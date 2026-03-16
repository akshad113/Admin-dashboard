const express = require("express");
const router = express.Router();

const { getRetailerProfile, updateRetailerProfile } = require("../controller/profileController");
const verifyToken = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");

router.get("/me", verifyToken, authorizeRoles("Retailer"), getRetailerProfile);
router.put("/", verifyToken, authorizeRoles("Retailer"), updateRetailerProfile);

module.exports = router;
