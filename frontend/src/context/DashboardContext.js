"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { apiEndpoints } from "@/utils/api";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
    const [batteryStatus, setBatteryStatus] = useState(null);
    const [tripHistory, setTripHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [batteryData, tripsData] = await Promise.all([
                    apiEndpoints.battery.getStatus(),
                    apiEndpoints.trips.getHistory()
                ]);

                setBatteryStatus(batteryData);
                setTripHistory(tripsData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setError(error.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        // Refresh data every minute
        const interval = setInterval(fetchDashboardData, 60000);
        
        return () => {
            clearInterval(interval);
        };
    }, []);

    const value = {
        batteryStatus,
        tripHistory,
        loading,
        error,
        refreshData: async () => {
            try {
                setLoading(true);
                setError(null);
                const batteryData = await apiEndpoints.battery.getStatus();
                setBatteryStatus(batteryData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
