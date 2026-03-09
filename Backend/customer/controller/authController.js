const util = require("util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../../db/userDB");

const query = util.promisify(connection.query).bind(connection);

const CUSTOMER_ROLE = "User";

const mapRowsToUser = (rows) => {
  if (!rows || rows.length === 0) {
    return null;
  }

  const base = rows[0];
  const roles = [...new Set(rows.map((row) => row.role_name).filter(Boolean))];

  return {
    id: base.user_id,
    name: base.name,
    email: base.email,
    status: base.status,
    password: base.password,
    roles
  };
};

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

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

const fetchUserWithRolesById = async (id) => {
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
    [id]
  );

  return mapRowsToUser(rows);
};

const requireCustomerRole = (user) =>
  user.roles.some((role) => String(role).toLowerCase() === CUSTOMER_ROLE.toLowerCase());

const registerCustomer = async (req, res) => {
  let tx = null;

  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    const existing = await query("SELECT user_id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    tx = await connection.promise().getConnection();
    await tx.beginTransaction();

    const [userInsert] = await tx.query(
      "INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, 'active')",
      [name, email, hashedPassword]
    );

    const [roleRows] = await tx.query(
      "SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER(?) LIMIT 1",
      [CUSTOMER_ROLE]
    );

    let roleId = null;
    if (roleRows.length > 0) {
      roleId = roleRows[0].role_id;
    } else {
      const [roleInsert] = await tx.query("INSERT INTO roles (role_name) VALUES (?)", [
        CUSTOMER_ROLE
      ]);
      roleId = roleInsert.insertId;
    }

    await tx.query("INSERT INTO role_assign (user_id, role_id) VALUES (?, ?)", [
      userInsert.insertId,
      roleId
    ]);

    await tx.commit();

    const user = {
      id: userInsert.insertId,
      name,
      email,
      roles: [CUSTOMER_ROLE]
    };

    const token = signToken(user);

    return res.status(201).json({
      message: "Customer account created successfully",
      token,
      user
    });
  } catch (error) {
    console.error(error);
    if (tx) {
      await tx.rollback();
    }
    return res.status(500).json({ message: "Server error while creating customer account" });
  } finally {
    if (tx) {
      tx.release();
    }
  }
};

const loginCustomer = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    const user = await fetchUserWithRolesByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (String(user.status || "").toLowerCase() !== "active") {
      return res.status(403).json({ message: "Access denied. User inactive." });
    }

    if (!requireCustomerRole(user)) {
      return res.status(403).json({ message: "Customer access is not enabled for this account" });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while logging in" });
  }
};

const getCustomerMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await fetchUserWithRolesById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user.status || "").toLowerCase() !== "active") {
      return res.status(403).json({ message: "Access denied. User inactive." });
    }

    if (!requireCustomerRole(user)) {
      return res.status(403).json({ message: "Customer access is not enabled for this account" });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching profile" });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerMe
};
