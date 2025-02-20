
// backend/controllers/batteryController.js
const Battery = require("../models/Battery");

// @desc    Update battery status
// @route   POST /api/battery/update
// @access  Private
exports.updateBatteryStatus = async (req, res) => {
    try {
        const { batteryLevel, lastCharged, healthStatus } = req.body;

        if (batteryLevel === undefined || !lastCharged || !healthStatus) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let battery = await Battery.findOne({ user: req.user.id });

        if (battery) {
            battery.batteryLevel = batteryLevel;
            battery.lastCharged = lastCharged;
            battery.healthStatus = healthStatus;
        } else {
            battery = new Battery({
                user: req.user.id,
                batteryLevel,
                lastCharged,
                healthStatus
            });
        }

        await battery.save();
        res.status(200).json({ message: "Battery status updated", battery });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get battery status
// @route   GET /api/battery/status
// @access  Private
exports.getBatteryStatus = async (req, res) => {
    try {
        const battery = await Battery.findOne({ user: req.user.id });

        if (!battery) {
            return res.status(404).json({ message: "Battery data not found" });
        }

        res.status(200).json(battery);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


