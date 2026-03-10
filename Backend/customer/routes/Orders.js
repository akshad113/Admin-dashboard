const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");
const { checkoutCart, getMyOrders } = require("../controller/orderController");

router.use(verifyToken, authorizeRoles("User", "Admin"));

router.get("/mine", getMyOrders);
router.post("/checkout", checkoutCart);

module.exports = router;
