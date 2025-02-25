import { useState, useEffect } from "react";
import axios from "axios";
import { getTrips, addTrip } from "../api";
import { toast } from "react-toastify";

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const ORS_API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY;
  const ORS_BASE_URL = "https://api.openrouteservice.org";

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await getTrips();
        setTrips(data);
      } catch (error) {
        toast.error("Failed to fetch trips: " + error.response?.data?.message);
      }
    };
    fetchTrips();
  }, []);

  const handleAddTrip = async (e) => {
    e.preventDefault();
    try {
      // Geocode start location
      const startGeoResponse = await axios.get(`${ORS_BASE_URL}/geocode/search`, {
        params: { api_key: ORS_API_KEY, text: start, size: 1 },
      });
      const startCoords = startGeoResponse.data.features[0].geometry.coordinates;

      // Geocode end location
      const endGeoResponse = await axios.get(`${ORS_BASE_URL}/geocode/search`, {
        params: { api_key: ORS_API_KEY, text: end, size: 1 },
      });
      const endCoords = endGeoResponse.data.features[0].geometry.coordinates;

      // Get route from ORS
      const routeResponse = await axios.post(
        `${ORS_BASE_URL}/v2/directions/driving-car/geojson`,
        { coordinates: [startCoords, endCoords], instructions: false },
        { headers: { Authorization: ORS_API_KEY, "Content-Type": "application/json" } }
      );

      const summary = routeResponse.data.features[0].properties.summary;
      const distance = summary.distance / 1000; // meters to km
      const duration = summary.duration / 60; // seconds to minutes

      // Send to backend
      const { data } = await addTrip({
        startLocation: start, // User-entered text
        endLocation: end, // User-entered text
        distance,
        duration,
        energyUsed: 20, // Placeholder (needs EV-specific logic)
      });

      setTrips([data, ...trips]);
      setStart("");
      setEnd("");
      toast.success("Trip added successfully!");
    } catch (error) {
      console.error("Trip add failed:", error);
      toast.error("Trip add failed: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-purple-900/30">
      <h3 className="text-3xl font-bold mb-6 tracking-wide bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
        Trip History
      </h3>
      <form onSubmit={handleAddTrip} className="mb-8 space-y-6">
        <input
          type="text"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="Start Location"
          className="w-full p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
        />
        <input
          type="text"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          placeholder="End Location"
          className="w-full p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg uppercase font-semibold"
        >
          Add Trip
        </button>
      </form>
      <div className="space-y-4">
        {trips.length ? (
          trips.map((trip) => (
            <div
              key={trip._id}
              className="p-5 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200 border border-purple-900/50"
            >
              <p className="text-gray-200 text-lg font-semibold">
                {trip.startLocation} → {trip.endLocation}
              </p>
              <p className="text-gray-400 text-md">
                Distance: <span className="text-purple-400">{trip.distance} km</span> | Energy:{" "}
                <span className="text-purple-400">{trip.energyUsed} kWh</span> | Duration:{" "}
                <span className="text-purple-400">{trip.duration} min</span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No trips yet</p>
        )}
      </div>
    </div>
  );
};

export default TripHistory;