const express = require("express");
const router = express.Router();

const { createProduct, getProducts, getMyProducts } = require("../controller/ProductController");
const verifyToken = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");
const { validateBody } = require("../../middleware/validate");
const { createProductSchema } = require("../../validation/schemas");

router.get("/", verifyToken, authorizeRoles("Admin", "Manager"), getProducts);
router.get("/mine", verifyToken, authorizeRoles("Admin", "Manager"), getMyProducts);
router.post(
  "/create",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validateBody(createProductSchema),
  createProduct
);

module.exports = router;
