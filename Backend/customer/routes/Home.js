const express = require("express");
const router = express.Router();

const {
  getCustomerCategories,
  getCustomerProducts,
  getCustomerProductById,
  getHomeData
} = require("../controller/homeController");

router.get("/categories", getCustomerCategories);
router.get("/products", getCustomerProducts);
router.get("/products/:productId", getCustomerProductById);
router.get("/home", getHomeData);

module.exports = router;
