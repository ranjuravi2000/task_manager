const express = require("express");
const router = express.Router();

const {
  updateSubscription,
} = require("../controllers/subscriptionController");

const protect = require("../middleware/authMiddleware");

// Update subscription plan
router.put("/update", protect, updateSubscription);

module.exports = router;