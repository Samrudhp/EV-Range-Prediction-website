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
      const startGeoResponse = await axios.get(`${ORS_BASE_URL}/geocode/search`, {
        params: { api_key: ORS_API_KEY, text: start, size: 1 },
      });
      const startCoords = startGeoResponse.data.features[0].geometry.coordinates;

      const endGeoResponse = await axios.get(`${ORS_BASE_URL}/geocode/search`, {
        params: { api_key: ORS_API_KEY, text: end, size: 1 },
      });
      const endCoords = endGeoResponse.data.features[0].geometry.coordinates;

      const routeResponse = await axios.post(
        `${ORS_BASE_URL}/v2/directions/driving-car/geojson`,
        { coordinates: [startCoords, endCoords], instructions: false },
        { headers: { Authorization: ORS_API_KEY, "Content-Type": "application/json" } }
      );

      const summary = routeResponse.data.features[0].properties.summary;
      const distance = summary.distance / 1000;
      const duration = summary.duration / 60;

      const { data } = await addTrip({
        startLocation: start,
        endLocation: end,
        distance,
        duration,
        energyUsed: 20,
      });

      setTrips([data, ...trips]);
      setStart("");
      setEnd("");
      toast.success("Trip added successfully!");
    } catch (error) {
      toast.error("Trip add failed: " + error.response?.data?.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
        Trip History
      </h3>
      <form onSubmit={handleAddTrip} className="mb-6 space-y-4">
        <input
          type="text"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="Start Location"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          placeholder="End Location"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-md"
        >
          Add Trip
        </button>
      </form>
      <div className="space-y-4">
        {trips.length ? (
          trips.map((trip) => (
            <div
              key={trip._id}
              className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200"
            >
              <p className="text-gray-800 font-semibold">
                {trip.startLocation} → {trip.endLocation}
              </p>
              <p className="text-gray-600">
                Distance: <span className="font-medium">{trip.distance} km</span>, Energy:{" "}
                <span className="font-medium">{trip.energyUsed} kWh</span>, Duration:{" "}
                <span className="font-medium">{trip.duration} min</span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No trips yet</p>
        )}
      </div>
    </div>
  );
};

export default TripHistory;