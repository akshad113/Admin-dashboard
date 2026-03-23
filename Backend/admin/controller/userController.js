const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');

const connection = require('../../db/userDB');

const query = util.promisify(connection.query).bind(connection);

// Normalize any text input so controllers can work with predictable values.
const normalizeText = (value) => String(value ?? '').trim();

// Normalize email addresses into a consistent lowercase form.
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

// Parse a positive integer id, returning null when the value is invalid.
const parsePositiveId = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

// Turn role rows into a unique list of role names.
const extractRoleNames = (rows) => [...new Set(rows.map((row) => row.role_name).filter(Boolean))];

// Check whether a user already has the retailer role.
const hasRetailerRole = (roles) =>
  roles.some((role) => String(role).toLowerCase() === 'retailer');

// Map joined user rows into a single user object with roles.
const mapUserWithRoles = (rows) => {
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

// Fetch a single user and all of their roles by email.
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

  return mapUserWithRoles(rows);
};

// Fetch a single user and all of their roles by id.
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

  return mapUserWithRoles(rows);
};

// Fetch the full admin user list with role assignments for the management table.
const listUsers = async (_req, res) => {
  try {
    const rows = await query(
      `SELECT u.user_id, u.name, u.email, u.status, ra.role_id, r.role_name
       FROM users u
       LEFT JOIN role_assign ra ON ra.user_id = u.user_id
       LEFT JOIN roles r ON r.role_id = ra.role_id`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Fetch all roles so the admin UI can populate selection controls.
const listRoles = async (_req, res) => {
  try {
    const rows = await query(
      `SELECT role_id, role_name
       FROM roles
       ORDER BY role_name ASC`
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Sign a JWT for a user payload using the configured expiration.
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

// Get the retailer role id or create it when it does not exist yet.
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

// Create a new admin user and optionally attach a role assignment.
const createUser = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password = req.body.password || '123456';
    const status = normalizeText(req.body.status).toLowerCase();
    const roleId = parsePositiveId(req.body.role_id);

    const existingUser = await query('SELECT user_id FROM users WHERE email = ? LIMIT 1', [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await runInTransaction(async (transaction) => {
      const userPayload = {
        name,
        email,
        password: hashedPassword,
      };

      if (status) {
        userPayload.status = status;
      }

      const [result] = await transaction.query('INSERT INTO users SET ?', userPayload);

      if (roleId) {
        await transaction.query('INSERT INTO role_assign SET ?', {
          user_id: result.insertId,
          role_id: roleId,
        });
      }

      return result.insertId;
    });

    return res.status(201).json({
      message: 'User created successfully',
      userId,
    });
  } catch (error) {
    console.error('createUser failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Authenticate a user and return a JWT plus their basic profile.
const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    const user = await fetchUserWithRolesByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (normalizeText(user.status).toLowerCase() !== 'active') {
      return res.status(403).json({ message: 'Access denied. User inactive.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update a user and replace their single role assignment inside a transaction.
const updateUser = async (req, res) => {
  try {
    const userId = parsePositiveId(req.params.id);
    const name = normalizeText(req.body.name);
    const email = normalizeEmail(req.body.email);
    const status = normalizeText(req.body.status).toLowerCase();
    const roleId = parsePositiveId(req.body.role_id);

    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const existingUser = await query('SELECT user_id FROM users WHERE user_id = ? LIMIT 1', [
      userId,
    ]);

    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const duplicateEmail = await query(
      'SELECT user_id FROM users WHERE email = ? AND user_id <> ? LIMIT 1',
      [email, userId]
    );

    if (duplicateEmail.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    if (roleId) {
      const roleExists = await query('SELECT role_id FROM roles WHERE role_id = ? LIMIT 1', [
        roleId,
      ]);

      if (roleExists.length === 0) {
        return res.status(400).json({ error: 'Role does not exist' });
      }
    }

    await runInTransaction(async (transaction) => {
      await transaction.query('UPDATE users SET name = ?, email = ?, status = ? WHERE user_id = ?', [
        name,
        email,
        status,
        userId,
      ]);

      await transaction.query('DELETE FROM role_assign WHERE user_id = ?', [userId]);

      if (roleId) {
        await transaction.query('INSERT INTO role_assign SET ?', {
          user_id: userId,
          role_id: roleId,
        });
      }
    });

    return res.status(200).json({
      message: 'User updated successfully',
      userId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Flip a user's active status between active and inactive.
const toggleUserStatus = async (req, res) => {
  try {
    const userId = parsePositiveId(req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const rows = await query('SELECT status FROM users WHERE user_id = ? LIMIT 1', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentStatus = normalizeText(rows[0].status).toLowerCase();
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';

    await query('UPDATE users SET status = ? WHERE user_id = ?', [nextStatus, userId]);

    return res.status(200).json({
      message: 'User status updated',
      userId,
      status: nextStatus,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Approve a pending retailer request by enabling the retailer role and activating the account.
const approveRetailerRequest = async (req, res) => {
  try {
    const userId = parsePositiveId(req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await fetchUserWithRolesById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await runInTransaction(async (transaction) => {
      const retailerRoleId = await getOrCreateRetailerRoleId(transaction);

      if (!hasRetailerRole(user.roles)) {
        const [roleAssignRows] = await transaction.query(
          'SELECT 1 FROM role_assign WHERE user_id = ? AND role_id = ? LIMIT 1',
          [userId, retailerRoleId]
        );

        if (roleAssignRows.length === 0) {
          await transaction.query('INSERT INTO role_assign (user_id, role_id) VALUES (?, ?)', [
            userId,
            retailerRoleId,
          ]);
        }
      }

      await transaction.query('UPDATE users SET status = ? WHERE user_id = ?', ['active', userId]);
    });

    return res.status(200).json({
      message: 'Retailer request approved',
      userId,
      status: 'active',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  listUsers,
  listRoles,
  updateUser,
  toggleUserStatus,
  approveRetailerRequest,
  fetchUserWithRolesByEmail,
  fetchUserWithRolesById,
  signToken,
};
