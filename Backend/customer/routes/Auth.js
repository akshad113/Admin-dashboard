const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware");
const { validateBody } = require("../../middleware/validate");
const { customerSignupSchema, customerLoginSchema } = require("../../validation/schemas");
const {
  registerCustomer,
  loginCustomer,
  getCustomerMe
} = require("../controller/authController");

router.post("/signup", validateBody(customerSignupSchema), registerCustomer);
router.post("/login", validateBody(customerLoginSchema), loginCustomer);
router.get("/me", verifyToken, getCustomerMe);

module.exports = router;
