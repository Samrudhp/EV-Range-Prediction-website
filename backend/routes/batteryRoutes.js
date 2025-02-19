const express = require("express");
const { updateBatteryStatus, getBatteryStatus } = require("../controllers/batteryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Update battery status (protected)
router.post("/update", protect, updateBatteryStatus);

// Get battery status (protected)
router.get("/status", protect, getBatteryStatus);

module.exports = router;
