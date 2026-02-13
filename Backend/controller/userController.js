const connection = require('../db/userDB');
const util = require('util');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { error } = require('console');

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

//////////////////////////////////////////////////
// CREATE USER
//////////////////////////////////////////////////

const createUser = async (req, res) => {
  try {
    const { name, email, password, status, role_id } = req.body;

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

    const existing = await query("SELECT * FROM users WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const rawPassword = password || "123456";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const userPayload = {
      name,
      email,
      password: hashedPassword,
    };

    // Let DB defaults handle status when not explicitly supplied.
    if (status !== undefined && status !== null && String(status).trim() !== "") {
      userPayload.status = String(status).trim();
    }
    await beginTransaction();

    const result = await query('INSERT INTO users SET ?', userPayload);

    if (parsedRoleId) {
      await query('INSERT INTO role_assign SET ?', {
        user_id: result.insertId,
        role_id: parsedRoleId,
      });
    }

    await commit();

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("createUser failed:", error.message);

    try {
      await rollback();
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError.message);
    }

    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////
// LOGIN USER WITH JWT
//////////////////////////////////////////////////

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const users = await query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    if ((user.status || "").toLowerCase() !== 'active') {
      return res.status(403).json({
        message: 'Access denied. User inactive.',
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

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////
// TOGGLE USER STATUS
//////////////////////////////////////////////////
 
const toggleUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if(!Number.isInteger(userId) || userId < 0){
      return res.status(400).json({error:"Invalid user id"})
    }
    const row = await query('SELECT status FROM users WHERE user_id = ?',[userId]);
    if(row.length === 0){
      return res.status(404).json({error:"User not found"});
    }
    const current = String(row[0].status || "").toLowerCase();
    const nextStatus = current ==='active' ? 'inactive':'active';

    await query('UPDATE users SET status = ? WHERE user_id = ?',[nextStatus,userId])
    return res.status(200).json({
      message:"User status updated",
      userId,
      status:nextStatus
    })

    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  toggleUserStatus,
};
