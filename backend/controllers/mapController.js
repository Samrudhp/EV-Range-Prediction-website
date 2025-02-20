const axios = require("axios");

// @desc Get optimized EV route and range prediction
// @route POST /api/maps/route
// @access Private
const getOptimizedRoute = async (req, res) => {
    try {
        const { source, destination, trip_distance, elevation_change, traffic_delay, battery_consumption } = req.body;

        // Validate input
        if (!trip_distance || !elevation_change || !traffic_delay || !battery_consumption) {
            return res.status(400).json({ message: "All input fields are required!" });
        }

        // Call ML Model API
        const mlResponse = await axios.post("http://localhost:8000/predict/", {
            trip_distance,
            elevation_change,
            traffic_delay,
            battery_consumption
        });

        // Extract predicted range from ML response
        const { predicted_range_km } = mlResponse.data;

        res.json({
            success: true,
            source,
            destination,
            predicted_range: predicted_range_km
        });

    } catch (error) {
        console.error("Error fetching ML prediction:", error.message);
        res.status(500).json({ message: "Error fetching ML prediction" });
    }
};

module.exports = { getOptimizedRoute };
