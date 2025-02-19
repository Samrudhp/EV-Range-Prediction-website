const express = require("express");
const { addTrip, getTripsByUser } = require("../controllers/tripController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Add a new trip (protected)
router.post("/add", protect, addTrip);

// Get trip history for logged-in user (protected)
router.get("/history", protect, getTripsByUser);

module.exports = router;
