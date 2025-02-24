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
      const summary = routeResponse.data.features[0].properties.summary;
      const tripDistance = summary.distance / 1000;

      const { data } = await getRoute({
        source: start,
        destination: end,
        trip_distance: tripDistance,
        elevation_change: 50,
        traffic_delay: 10,
        battery_consumption: 20,
      });

      setRoute(routeCoords);
      setPredictedRange(data.predicted_range);
      toast.success("Route calculated successfully!");
    } catch (error) {
      console.error("Route calculation failed:", error);
      toast.error("Route calculation failed: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
        Route Prediction
      </h3>
      <form onSubmit={handleRoute} className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Start Location"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
        <input
          type="text"
          placeholder="End Location"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-md"
        >
          Get Route
        </button>
      </form>
      <div className="rounded-xl overflow-hidden shadow-lg">
        <MapContainer center={[51.505, -0.09]} zoom={13} className="h-[400px] w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {route && <Polyline positions={route} color="blue" />}
          {route && <Marker position={route[0]} />}
          {route && <Marker position={route[route.length - 1]} />}
        </MapContainer>
      </div>
      {predictedRange && (
        <p className="mt-4 text-lg font-semibold text-green-600">Predicted Range: {predictedRange} km</p>
      )}
    </div>
  );
};

export default Map;