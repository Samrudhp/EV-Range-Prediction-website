"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiEndpoints } from "@/utils/api";

export default function TripHistory() {
  const router = useRouter();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTrips();
  }, [user, router]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiEndpoints.trips.getHistory();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setError(error.message || "Failed to fetch trips. Please try again later.");
      
      // Handle authentication errors
      if (error.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trip History</h1>
      {trips.length === 0 ? (
        <div className="text-gray-500 text-center p-4">
          No trips found. Start planning your first trip!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Start</th>
                <th className="border p-2 text-left">Destination</th>
                <th className="border p-2 text-right">Distance</th>
                <th className="border p-2 text-right">Battery Used</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr 
                  key={trip._id} 
                  className="border hover:bg-gray-50 transition-colors"
                >
                  <td className="border p-2">{trip.start}</td>
                  <td className="border p-2">{trip.destination}</td>
                  <td className="border p-2 text-right">{trip.distance} km</td>
                  <td className="border p-2 text-right">{trip.batteryUsage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
