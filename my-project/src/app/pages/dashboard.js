import { useState } from "react";
import Map from "../components/Map";
import { getOptimizedRoute } from "../utils/api";

export default function Dashboard() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleGetRoute() {
    if (!source || !destination) {
      alert("Please select both source and destination.");
      return;
    }

    setLoading(true);
    const response = await getOptimizedRoute(source, destination);
    setLoading(false);

    if (response.success) {
      setRouteData(response.route);
    } else {
      alert("Failed to get optimized route.");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">EV Route Optimization</h2>

      <div className="flex gap-4 mt-4">
        <input
          type="text"
          placeholder="Enter Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="p-2 border rounded w-1/2"
        />
        <input
          type="text"
          placeholder="Enter Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="p-2 border rounded w-1/2"
        />
      </div>

      <button
        onClick={handleGetRoute}
        className="mt-4 p-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Calculating..." : "Find Optimized Route"}
      </button>

      <Map source={source} destination={destination} routeData={routeData} />
    </div>
  );
}
