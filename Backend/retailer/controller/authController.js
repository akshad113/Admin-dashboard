const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');

const connection = require('../../db/userDB');

const query = util.promisify(connection.query).bind(connection);

// Normalize any text input so comparisons stay consistent.
const normalizeText = (value) => String(value ?? '').trim();

// Normalize email addresses into a lowercase string.
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

// Turn role rows into a unique list of names.
const extractRoleNames = (rows) => [...new Set(rows.map((row) => row.role_name).filter(Boolean))];

// Check whether the current role list includes the retailer role.
const hasRetailerRole = (roles) =>
  roles.some((role) => String(role).toLowerCase() === 'retailer');

// Run multiple SQL statements in a single transaction and always release the connection.
const runInTransaction = async (task) => {
  const transaction = await connection.promise().getConnection();

  try {
    await transaction.beginTransaction();
    const result = await task(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.release();
  }
};

// Get the retailer role id or create it if it does not exist yet.
const getOrCreateRetailerRoleId = async (transaction) => {
  const [roleRows] = await transaction.query(
    'SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER(?) LIMIT 1',
    ['Retailer']
  );

  if (roleRows.length > 0) {
    return roleRows[0].role_id;
  }

  const [roleInsert] = await transaction.query('INSERT INTO roles (role_name) VALUES (?)', [
    'Retailer',
  ]);

  return roleInsert.insertId;
};

// Sign a JWT for the logged-in retailer account.
const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

// Create a retailer request that starts in pending state.
const signupRetailer = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    const existingUser = await query('SELECT user_id FROM users WHERE email = ? LIMIT 1', [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await runInTransaction(async (transaction) => {
      const [userInsert] = await transaction.query(
        "INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, 'pending')",
        [name, email, hashedPassword]
      );

      const roleId = await getOrCreateRetailerRoleId(transaction);

      await transaction.query('INSERT INTO role_assign (user_id, role_id) VALUES (?, ?)', [
        userInsert.insertId,
        roleId,
      ]);

      return userInsert.insertId;
    });

    return res.status(201).json({
      message: 'Retailer request submitted successfully',
      requestId: userId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while submitting retailer request' });
  }
};

// Login a retailer only when the account is active and has the retailer role.
const loginRetailer = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    const users = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const normalizedStatus = normalizeText(user.status).toLowerCase();

    if (normalizedStatus === 'pending') {
      return res.status(403).json({ message: 'Your retailer request is pending admin approval' });
    }

    if (normalizedStatus !== 'active') {
      return res.status(403).json({ message: 'Access denied. User inactive.' });
    }

    const roleRows = await query(
      `SELECT r.role_name
       FROM role_assign ra
       INNER JOIN roles r ON r.role_id = ra.role_id
       WHERE ra.user_id = ?`,
      [user.user_id]
    );

    const roles = extractRoleNames(roleRows);

    if (!hasRetailerRole(roles)) {
      return res.status(403).json({ message: 'Retailer access is not enabled for this account' });
    }

    const token = signToken({
      id: user.user_id,
      email: user.email,
      roles,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        roles,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while logging in' });
  }
};

module.exports = {
  signupRetailer,
  loginRetailer,
};
