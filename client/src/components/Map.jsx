import { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import Ors from "openrouteservice-js";
import { getRoute } from "../api";
import "leaflet/dist/leaflet.css";

const Map = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [route, setRoute] = useState(null);
  const [predictedRange, setPredictedRange] = useState(null);

  const ors = new Ors.Directions({
    api_key: import.meta.env.VITE_OPENROUTE_API_KEY,
  });

  const handleRoute = async (e) => {
    e.preventDefault();
    try {
      // Geocode start and end (simplified; use ORS Geocode API if needed)
      const geocodeStart = await ors.geocode({ text: start });
      const geocodeEnd = await ors.geocode({ text: end });
      const startCoords = geocodeStart.features[0].geometry.coordinates; // [lon, lat]
      const endCoords = geocodeEnd.features[0].geometry.coordinates;

      // Get route
      const routeData = await ors.calculate({
        coordinates: [startCoords, endCoords],
        profile: "driving-car",
        format: "geojson",
      });
      const routeCoords = routeData.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);

      // Backend prediction
      const { data } = await getRoute({
        source: start,
        destination: end,
        trip_distance: routeData.features[0].properties.segments[0].distance / 1000, // km
        elevation_change: 50, // Placeholder
        traffic_delay: 10, // Placeholder
        battery_consumption: 20, // Placeholder
      });

      setRoute(routeCoords);
      setPredictedRange(data.predicted_range);
    } catch (error) {
      alert("Route calculation failed: " + error.message);
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