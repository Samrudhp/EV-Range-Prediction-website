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

      const routeCoords = routeResponse.data.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      // Corrected distance extraction from summary
      const tripDistance = routeResponse.data.features[0].properties.summary.distance / 1000; // meters to km

      // Send to backend
      const { data } = await getRoute({
        source: start,
        destination: end,
        trip_distance: tripDistance,
        elevation_change: 50, // Placeholder
        traffic_delay: 10, // Placeholder
        battery_consumption: 20, // Placeholder
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
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleRoute} className="mb-4 flex space-x-2">
        <input
          type="text"
          placeholder="Start Location"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <input
          type="text"
          placeholder="End Location"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Get Route
        </button>
      </form>
      <MapContainer center={[51.505, -0.09]} zoom={13} className="h-96 w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {route && <Polyline positions={route} />}
        {route && <Marker position={route[0]} />}
        {route && <Marker position={route[route.length - 1]} />}
      </MapContainer>
      {predictedRange && (
        <p className="mt-2 text-green-600">Predicted Range: {predictedRange} km</p>
      )}
    </div>
  );
};

export default Map;