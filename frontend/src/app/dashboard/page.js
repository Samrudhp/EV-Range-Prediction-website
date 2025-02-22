"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BatteryCard from "@/components/BatteryCard";
import DashboardStats from "@/components/DashboardStats";
import { getBatteryStatus, getTripHistory } from "@/utils/api";

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [battery, setBattery] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [batteryData, tripData] = await Promise.all([
          getBatteryStatus(),
          getTripHistory()
        ]);

        setBattery(batteryData);
        setTripHistory(tripData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Battery Status */}
      {battery && <BatteryCard battery={battery} />}

      {/* Dashboard Stats */}
      <DashboardStats tripHistory={tripHistory} />

      {/* Redirect to Map for Route Planning */}
      <button
        onClick={() => router.push("/map")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
      >
        Plan a Trip
      </button>
    </div>
  );
};

export default Dashboard;
