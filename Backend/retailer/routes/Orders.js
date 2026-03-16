const express = require("express");
const router = express.Router();

const { getRetailerOrders } = require("../controller/orderController");
const verifyToken = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");

router.get("/", verifyToken, authorizeRoles("Retailer"), getRetailerOrders);

module.exports = router;
