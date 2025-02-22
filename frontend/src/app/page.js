"use client";
import { useRouter } from 'next/navigation';
import DashboardStats from "@/components/DashboardStats";
import MapComponent from "@/components/MapComponent";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";

export default function Page() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { stats, loading: dashboardLoading } = useDashboard();

    // Protect the route
    if (authLoading || dashboardLoading) {
        return (
            <div className="p-4">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-64 bg-gray-200 rounded"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DashboardStats stats={stats} />
                <MapComponent />
            </div>
        </div>
    );
}
