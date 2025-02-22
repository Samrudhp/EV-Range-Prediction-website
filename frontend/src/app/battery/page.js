"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiEndpoints } from "@/utils/api";

export default function BatteryStatus() {
  const router = useRouter();
  const { user } = useAuth();
  const [battery, setBattery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBatteryStatus();
  }, [user, router]);

  const fetchBatteryStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiEndpoints.battery.getStatus();
      setBattery(data);
    } catch (error) {
      console.error("Error fetching battery status:", error);
      setError(error.message || "Failed to fetch battery status. Please try again later.");
      
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Battery Status</h1>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Battery Status</h1>
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Battery Status</h1>
      {battery && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Charge Level</span>
              <span className={`text-xl font-bold ${
                battery.charge < 20 ? 'text-red-600' : 'text-green-600'
              }`}>
                {battery.charge}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${
                  battery.charge < 20 ? 'bg-red-600' : 'bg-green-600'
                }`}
                style={{ width: `${battery.charge}%` }}
              ></div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Range:</span>
              <span className="font-bold">{battery.estimatedRange} km</span>
            </p>
            <p className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-sm text-gray-500">
                {new Date(battery.lastUpdated).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
