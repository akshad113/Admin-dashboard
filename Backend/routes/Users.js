const express = require('express');
const router = express.Router();

const { createUser, loginUser, updateUser, toggleUserStatus } = require('../controller/userController');
const verifyToken = require('../middleware/authMiddleware');
const userDB = require('../db/userDB');


/////////////////////////////////////////////////
// PUBLIC ROUTES
/////////////////////////////////////////////////

// Create user
router.post('/createuser', createUser);

// Login
router.post('/login', loginUser);


/////////////////////////////////////////////////
// PROTECTED ROUTES (Require JWT)
/////////////////////////////////////////////////

router.get("/users", verifyToken, (req, res) => {

  const sql = `
    SELECT u.user_id, u.name, u.email, u.status, ra.role_id, r.role_name
    FROM users u
    LEFT JOIN role_assign ra ON ra.user_id = u.user_id
    LEFT JOIN roles r ON r.role_id = ra.role_id
  `;

  userDB.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


router.get("/roles", verifyToken, (req, res) => {

  const sql = `
    SELECT role_id, role_name 
    FROM roles 
    ORDER BY role_name ASC
  `;

  userDB.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.put("/users/:id/status", verifyToken, toggleUserStatus);
router.put("/users/:id", verifyToken, updateUser);

module.exports = router;
