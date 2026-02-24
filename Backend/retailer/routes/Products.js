const express = require("express");
const router = express.Router();

const { createProduct } = require("../controller/ProductController");

router.post("/create", createProduct);

module.exports = router;
