import { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import axios from "axios";
import { getRoute } from "../api";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";

const Map = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [route, setRoute] = useState(null);
  const [predictedRange, setPredictedRange] = useState(null);

  const ORS_API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY;
  const ORS_BASE_URL = "https://api.openrouteservice.org";

  const handleRoute = async (e) => {
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
  
      const routeCoords = routeResponse.data.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const summary = routeResponse.data.features[0].properties.summary || {};
      const tripDistance = summary.distance ? summary.distance / 1000 : 0; // Default to 0 if missing
  
      // Ensure all fields are explicitly defined
      const payload = {
        source: start || "", // Fallback to empty string if undefined
        destination: end || "", // Fallback to empty string if undefined
        trip_distance: tripDistance, // Now guaranteed to be a number
        elevation_change: 50, // Placeholder, ensure it’s a number
        traffic_delay: 10, // Placeholder, ensure it’s a number
        battery_consumption: 20, // Placeholder, ensure it’s a number
      };
  
      console.log("Payload to backend:", payload); // Debug the payload
  
      const { data } = await getRoute(payload);
  
      setRoute(routeCoords);
      setPredictedRange(data.predicted_range);
      toast.success("Route and range calculated successfully!");
    } catch (error) {
      console.error("Route calculation failed:", error.response?.data || error);
      toast.error("Route calculation failed: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-purple-900/30">
      <h3 className="text-3xl font-bold mb-6 tracking-wide bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
        Route Prediction
      </h3>
      <form onSubmit={handleRoute} className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Start Location"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="flex-1 p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="End Location"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="flex-1 p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 px-8 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg uppercase font-semibold"
        >
          Calculate
        </button>
      </form>
      <div className="rounded-lg overflow-hidden shadow-inner border border-purple-900/50">
        <MapContainer center={[51.505, -0.09]} zoom={13} className="h-[450px] w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {route && <Polyline positions={route} color="#9333ea" />}
          {route && <Marker position={route[0]} />}
          {route && <Marker position={route[route.length - 1]} />}
        </MapContainer>
      </div>
      {predictedRange && (
        <p className="mt-6 text-xl font-semibold text-purple-400">Predicted Range: {predictedRange} km</p>
      )}
    </div>
  );
};

export default Map;