const util = require("util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../../db/userDB");

const query = util.promisify(connection.query).bind(connection);

const RETAILER_ROLE = "Retailer";

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

const loginRetailer = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const users = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (String(user.status || "").toLowerCase() !== "active") {
      return res.status(403).json({ message: "Access denied. User inactive." });
    }

    const roleRows = await query(
      `SELECT r.role_name
       FROM role_assign ra
       INNER JOIN roles r ON r.role_id = ra.role_id
       WHERE ra.user_id = ?`,
      [user.user_id]
    );
    const roles = [...new Set(roleRows.map((row) => row.role_name).filter(Boolean))];

    const hasRetailerRole = roles.some(
      (role) => String(role).toLowerCase() === RETAILER_ROLE.toLowerCase()
    );

    if (!hasRetailerRole) {
      return res.status(403).json({ message: "Retailer access is not enabled for this account" });
    }

    const token = signToken({
      id: user.user_id,
      email: user.email,
      roles
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        roles
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while logging in" });
  }
};

module.exports = {
  loginRetailer
};
