const express = require("express");
const router = express.Router();

const { loginRetailer } = require("../controller/authController");
const { validateBody } = require("../../middleware/validate");
const { loginSchema } = require("../../validation/schemas");

router.post("/login", validateBody(loginSchema), loginRetailer);

module.exports = router;
