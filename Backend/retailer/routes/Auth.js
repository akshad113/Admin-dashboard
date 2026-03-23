const express = require("express");
const router = express.Router();

const { loginRetailer, signupRetailer } = require("../controller/authController");
const { validateBody } = require("../../middleware/validate");
const { loginSchema, retailerSignupSchema } = require("../../validation/schemas");

router.post("/signup", validateBody(retailerSignupSchema), signupRetailer);
router.post("/login", validateBody(loginSchema), loginRetailer);

module.exports = router;
