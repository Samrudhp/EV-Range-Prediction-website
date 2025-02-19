const express = require("express");
const { getOptimizedRoute } = require("../controllers/mapController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get optimized route based on OpenRouter API (protected)
router.post("/route", protect, getOptimizedRoute);

module.exports = router;
