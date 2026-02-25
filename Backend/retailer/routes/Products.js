const express = require("express");
const router = express.Router();

const { createProduct } = require("../controller/ProductController");
const { validateBody } = require("../../middleware/validate");
const { createProductSchema } = require("../../validation/schemas");

router.post("/create", validateBody(createProductSchema), createProduct);

module.exports = router;
