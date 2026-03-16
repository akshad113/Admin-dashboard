const express = require("express");
const router = express.Router();

const { getAdminOrders } = require("../controller/orderController");
const verifyToken = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");

router.get("/", verifyToken, authorizeRoles("Admin", "Manager"), getAdminOrders);

module.exports = router;
