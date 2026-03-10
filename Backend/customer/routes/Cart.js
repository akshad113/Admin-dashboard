const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
} = require("../controller/cartController");

router.use(verifyToken, authorizeRoles("User", "Admin"));

router.get("/", getCart);
router.post("/items", addCartItem);
router.put("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/clear", clearCart);

module.exports = router;
