"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiEndpoints } from "@/utils/api";
import MapComponent from "@/components/MapComponent";

export default function MapPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [batteryEstimate, setBatteryEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleGetRoute = async () => {
    if (!start || !end) {
      setError("Please select both start and end locations on the map.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await apiEndpoints.maps.getRoute({ 
        start, 
        end,
        timestamp: new Date().toISOString() 
      });

      setRouteData(result.route);
      setBatteryEstimate(result.batteryUsage);
    } catch (error) {
      console.error("Error fetching route:", error);
      setError(error.message || "Failed to fetch optimized route.");
      
      if (error.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (type, location) => {
    if (type === 'start') {
      setStart(location);
    } else {
      setEnd(location);
    }
    setError(null);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">EV Range Prediction & Route Optimization</h1>
      
      {/* Map Container */}
      <div className="w-full h-[500px] mb-4 relative">
        <MapComponent 
          startLocation={start}
          endLocation={end}
          onLocationSelect={handleLocationSelect}
          routeData={routeData}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-lg mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleGetRoute}
        disabled={loading || !start || !end}
        className={`
          px-6 py-2 rounded-lg shadow-md transition
          ${loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {loading ? 'Calculating...' : 'Get Optimized Route'}
      </button>

      {/* Route Details */}
      {routeData && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-lg">
          <h2 className="text-xl font-semibold mb-2">Route Details</h2>
          <div className="space-y-2">
            <p><strong>Distance:</strong> {routeData.distance} km</p>
            <p><strong>Duration:</strong> {routeData.duration} mins</p>
            {batteryEstimate && (
              <p className={`font-medium ${batteryEstimate > 80 ? 'text-red-600' : 'text-green-600'}`}>
                <strong>Estimated Battery Usage:</strong> {batteryEstimate}%
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
