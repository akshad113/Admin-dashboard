const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');

const connection = require('../../db/userDB');

const query = util.promisify(connection.query).bind(connection);

// Normalize any text input so the controller always works with clean values.
const normalizeText = (value) => String(value ?? '').trim();

// Normalize email addresses into a lowercase string.
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

// Turn role rows into a unique list of role names.
const extractRoleNames = (rows) => [...new Set(rows.map((row) => row.role_name).filter(Boolean))];

// Map joined user rows into a single user object with a role list.
const mapRowsToUser = (rows) => {
  if (!rows || rows.length === 0) {
    return null;
  }

  const baseUser = rows[0];

  return {
    id: baseUser.user_id,
    name: baseUser.name,
    email: baseUser.email,
    status: baseUser.status,
    password: baseUser.password,
    roles: extractRoleNames(rows),
  };
};

// Fetch a user by email together with all role names.
const fetchUserWithRolesByEmail = async (email) => {
  const rows = await query(
    `SELECT
      u.user_id,
      u.name,
      u.email,
      u.password,
      u.status,
      r.role_name
    FROM users u
    LEFT JOIN role_assign ra ON ra.user_id = u.user_id
    LEFT JOIN roles r ON r.role_id = ra.role_id
    WHERE u.email = ?`,
    [email]
  );

  return mapRowsToUser(rows);
};

// Fetch a user by id together with all role names.
const fetchUserWithRolesById = async (userId) => {
  const rows = await query(
    `SELECT
      u.user_id,
      u.name,
      u.email,
      u.password,
      u.status,
      r.role_name
    FROM users u
    LEFT JOIN role_assign ra ON ra.user_id = u.user_id
    LEFT JOIN roles r ON r.role_id = ra.role_id
    WHERE u.user_id = ?`,
    [userId]
  );

  return mapRowsToUser(rows);
};

// Check whether a user has the customer role.
const hasCustomerRole = (user) =>
  user.roles.some((role) => String(role).toLowerCase() === 'user');

// Sign a JWT for the current user payload.
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

// Run multiple SQL statements inside one transaction.
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

// Get the role id for the customer role or create the role when it does not exist.
const getOrCreateCustomerRoleId = async (transaction) => {
  const [roleRows] = await transaction.query(
    'SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER(?) LIMIT 1',
    ['User']
  );

  if (roleRows.length > 0) {
    return roleRows[0].role_id;
  }

  const [roleInsert] = await transaction.query('INSERT INTO roles (role_name) VALUES (?)', [
    'User',
  ]);

  return roleInsert.insertId;
};

// Create a customer account inside a transaction and return a JWT session.
const registerCustomer = async (req, res) => {
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
        "INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, 'active')",
        [name, email, hashedPassword]
      );

      const roleId = await getOrCreateCustomerRoleId(transaction);

      await transaction.query('INSERT INTO role_assign (user_id, role_id) VALUES (?, ?)', [
        userInsert.insertId,
        roleId,
      ]);

      return userInsert.insertId;
    });

    const user = {
      id: userId,
      name,
      email,
      roles: ['User'],
    };

    return res.status(201).json({
      message: 'Customer account created successfully',
      token: signToken(user),
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while creating customer account' });
  }
};

// Log in a customer after password and role checks pass.
const loginCustomer = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    const user = await fetchUserWithRolesByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (normalizeText(user.status).toLowerCase() !== 'active') {
      return res.status(403).json({ message: 'Access denied. User inactive.' });
    }

    if (!hasCustomerRole(user)) {
      return res.status(403).json({ message: 'Customer access is not enabled for this account' });
    }

    return res.status(200).json({
      message: 'Login successful',
      token: signToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while logging in' });
  }
};

// Return the currently authenticated customer profile.
const getCustomerMe = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await fetchUserWithRolesById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (normalizeText(user.status).toLowerCase() !== 'active') {
      return res.status(403).json({ message: 'Access denied. User inactive.' });
    }

    if (!hasCustomerRole(user)) {
      return res.status(403).json({ message: 'Customer access is not enabled for this account' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

const { getFirebaseAdmin } = require("../../config/firebaseAdmin");

const googleLoginCustomer = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'idToken required' });
    }

    const admin = getFirebaseAdmin();

    if (!admin) {
      return res.status(500).json({
        message: 'Firebase Admin is not configured on the server',
      });
    }

    // 1. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const name = normalizeText(decodedToken.name || 'User');
    const email = normalizeEmail(decodedToken.email);

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Email not available from Google account' });
    }

    // 2. Check if user exists
    let user = await fetchUserWithRolesByEmail(email);

    // 3. If NOT exist → create user
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const userId = await runInTransaction(async (transaction) => {
        const [userInsert] = await transaction.query(
          "INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, 'active')",
          [name, email, hashedPassword]
        );

        const roleId = await getOrCreateCustomerRoleId(transaction);

        await transaction.query(
          'INSERT INTO role_assign (user_id, role_id) VALUES (?, ?)',
          [userInsert.insertId, roleId]
        );

        return userInsert.insertId;
      });

      user = {
        id: userId,
        name,
        email,
        roles: ['User'],
      };
    } else {
      // 4. Existing user checks
      if (normalizeText(user.status).toLowerCase() !== 'active') {
        return res.status(403).json({ message: 'Access denied. User inactive.' });
      }

      if (!hasCustomerRole(user)) {
        return res
          .status(403)
          .json({ message: 'Customer access is not enabled for this account' });
      }
    }

    // 5. Generate JWT (reuse your existing function)
    const token = signToken(user);

    // 6. Response (same shape as login)
    return res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    return res.status(500).json({
      message: 'Google authentication failed',
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerMe,
  googleLoginCustomer,
};
