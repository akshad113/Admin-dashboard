const express = require('express');
const router = express.Router();

const {
  createUser,
  loginUser,
  listUsers,
  listRoles,
  updateUser,
  toggleUserStatus,
} = require('../controller/userController');
const verifyToken = require('../../middleware/authMiddleware');
const { validateBody, validateParams } = require('../../middleware/validate');
const {
  createUserSchema,
  loginSchema,
  updateUserSchema,
  idParamSchema,
} = require('../../validation/schemas');

/////////////////////////////////////////////////
// PUBLIC ROUTES
/////////////////////////////////////////////////

// Create user.
router.post('/createuser', validateBody(createUserSchema), createUser);

// Login.
router.post('/login', validateBody(loginSchema), loginUser);

/////////////////////////////////////////////////
// PROTECTED ROUTES (Require JWT)
/////////////////////////////////////////////////

// Return the admin user list.
router.get('/users', verifyToken, listUsers);

// Return the role list for admin forms.
router.get('/roles', verifyToken, listRoles);

router.put('/users/:id/status', verifyToken, validateParams(idParamSchema), toggleUserStatus);
router.put('/users/:id', verifyToken, validateParams(idParamSchema), validateBody(updateUserSchema), updateUser);

module.exports = router;
