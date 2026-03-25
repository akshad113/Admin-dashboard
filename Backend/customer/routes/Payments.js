const express = require("express");

const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");
const {
  completeStripeCheckout,
  createStripeCheckoutSession,
} = require("../controller/paymentController");

router.use(verifyToken, authorizeRoles("User", "Admin"));

router.post("/stripe/checkout-session", createStripeCheckoutSession);
router.post("/stripe/complete", completeStripeCheckout);

module.exports = router;
