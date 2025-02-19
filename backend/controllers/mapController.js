const axios = require('axios');

// @desc    Get optimized route using OpenRouteService
// @route   POST /api/maps/route
// @access  Private
exports.getOptimizedRoute = async (req, res) => {
    try {
        const { startCoords, endCoords } = req.body;

        if (!startCoords || !endCoords) {
            return res.status(400).json({ message: "Start and end coordinates are required" });
        }

        const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY;
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTE_API_KEY}&start=${startCoords}&end=${endCoords}`;

        const response = await axios.get(url);

        if (response.data && response.data.routes.length > 0) {
            res.status(200).json({
                route: response.data.routes[0],
                message: "Route retrieved successfully",
            });
        } else {
            res.status(404).json({ message: "No route found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};