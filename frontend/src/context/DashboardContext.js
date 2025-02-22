"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
    const [batteryStatus, setBatteryStatus] = useState(null);
    const [tripHistory, setTripHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [batteryRes, tripsRes] = await Promise.all([
                    api.get("/battery/status"),
                    api.get("/trips/history"),
                ]);

                setBatteryStatus(batteryRes.data);
                setTripHistory(tripsRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardContext.Provider value={{ batteryStatus, tripHistory, loading }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    return useContext(DashboardContext);
}
