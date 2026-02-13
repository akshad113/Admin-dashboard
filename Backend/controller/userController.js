const connection = require('../db/userDB');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//////////////////////////////////////////////////
// CREATE USER (Callback Version)
//////////////////////////////////////////////////

const createUser = (req, res) => {
  const { name, email, password, status, role_id } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  if (password && password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  let parsedRoleId = null;
  if (role_id !== undefined && role_id !== null && role_id !== "") {
    parsedRoleId = Number(role_id);
    if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
      return res.status(400).json({ error: "Invalid role id" });
    }
  }

  // Check if email already exists
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (existing.length > 0) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const rawPassword = password || "123456";

      // Hash password
      bcrypt.hash(rawPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const userPayload = {
          name,
          email,
          password: hashedPassword,
        };

        if (status !== undefined && status !== null && String(status).trim() !== "") {
          userPayload.status = String(status).trim();
        }

        // Begin transaction
        connection.beginTransaction((err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Insert user
          connection.query(
            "INSERT INTO users SET ?",
            userPayload,
            (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  res.status(500).json({ error: err.message });
                });
              }

              // If role provided, insert into role_assign
              if (parsedRoleId) {
                connection.query(
                  "INSERT INTO role_assign SET ?",
                  {
                    user_id: result.insertId,
                    role_id: parsedRoleId,
                  },
                  (err) => {
                    if (err) {
                      return connection.rollback(() => {
                        res.status(500).json({ error: err.message });
                      });
                    }

                    // Commit transaction
                    connection.commit((err) => {
                      if (err) {
                        return connection.rollback(() => {
                          res.status(500).json({ error: err.message });
                        });
                      }

                      res.status(201).json({
                        message: "User created successfully",
                        userId: result.insertId,
                      });
                    });
                  }
                );
              } else {
                // No role assignment — just commit
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      res.status(500).json({ error: err.message });
                    });
                  }

                  res.status(201).json({
                    message: "User created successfully",
                    userId: result.insertId,
                  });
                });
              }
            }
          );
        });
      });
    }
  );
};

//////////////////////////////////////////////////
// LOGIN USER (Callback Version)
//////////////////////////////////////////////////

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (users.length === 0) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const user = users[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!isMatch) {
          return res.status(401).json({
            error: "Invalid email or password",
          });
        }

        if ((user.status || "").toLowerCase() !== "active") {
          return res.status(403).json({
            message: "Access denied. User inactive.",
          });
        }

        const token = jwt.sign(
          {
            id: user.user_id,
            email: user.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
          message: "Login successful",
          token,
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email,
          },
        });
      });
    }
  );
};

module.exports = {
  createUser,
  loginUser,
};
