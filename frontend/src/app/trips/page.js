"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function TripHistory() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(response.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setError("Failed to fetch trips. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading trips...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trip History</h1>
      {trips.length === 0 ? (
        <p>No trips found</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Start</th>
              <th className="border p-2">Destination</th>
              <th className="border p-2">Distance</th>
              <th className="border p-2">Battery Used</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip._id} className="border">
                <td className="border p-2">{trip.start}</td>
                <td className="border p-2">{trip.destination}</td>
                <td className="border p-2">{trip.distance} km</td>
                <td className="border p-2">{trip.batteryUsage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
