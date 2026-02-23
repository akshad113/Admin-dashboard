const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { productSchemas } = require("../../validation/schemas");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controller/ProductController");

router.get("/", verifyToken, getProducts);
router.get("/:id", verifyToken, validate(productSchemas.getProductById), getProductById);
router.post("/create", verifyToken, validate(productSchemas.createProduct), createProduct);
router.put("/:id", verifyToken, validate(productSchemas.updateProduct), updateProduct);
router.delete("/:id", verifyToken, validate(productSchemas.deleteProduct), deleteProduct);

module.exports = router;
