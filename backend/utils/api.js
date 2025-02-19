// backend/utils/api.js
const axios = require("axios");

const fetchRoute = async (startCoords, endCoords) => {
    const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTE_API_KEY}&start=${startCoords}&end=${endCoords}`;
    return await axios.get(url);
};

module.exports = { fetchRoute };
