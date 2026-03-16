const util = require("util");
const connection = require("../../db/userDB");

const query = util.promisify(connection.query).bind(connection);

const mapUserWithRoles = (rows) => {
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
    roles
  };
};

const getRetailerProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rows = await query(
      `SELECT
        u.user_id,
        u.name,
        u.email,
        u.status,
        r.role_name
      FROM users u
      LEFT JOIN role_assign ra ON ra.user_id = u.user_id
      LEFT JOIN roles r ON r.role_id = ra.role_id
      WHERE u.user_id = ?`,
      [userId]
    );

    const user = mapUserWithRoles(rows);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching profile" });
  }
};

const updateRetailerProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!name || name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const duplicate = await query(
      "SELECT user_id FROM users WHERE email = ? AND user_id <> ?",
      [email, userId]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    await query("UPDATE users SET name = ?, email = ? WHERE user_id = ?", [
      name,
      email,
      userId
    ]);

    return getRetailerProfile(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while updating profile" });
  }
};

module.exports = { getRetailerProfile, updateRetailerProfile };
