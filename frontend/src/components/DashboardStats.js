"use client";
import { useDashboard } from "@/context/DashboardContext";
import formatDate from "@/utils/formatDate";

export default function DashboardStats() {
    const { batteryStatus, tripHistory, loading, error } = useDashboard();

    if (loading) {
        return (
            <div className="p-4 bg-white rounded-xl shadow-md animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-md">
                <p className="text-red-600">Error loading dashboard data: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-xl shadow-md">
            <h2 className="text-lg font-bold mb-4">Dashboard Stats</h2>
            <div className="space-y-4">
                {/* Battery Status Section */}
                <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-md font-semibold mb-2">Battery Status</h3>
                    <div className="space-y-2">
                        <p className="flex justify-between">
                            <span>Current Level:</span>
                            <span className={`font-medium ${batteryStatus?.level < 20 ? 'text-red-600' : 'text-green-600'}`}>
                                {batteryStatus?.level ?? 'N/A'}%
                            </span>
                        </p>
                        <p className="flex justify-between text-sm text-gray-600">
                            <span>Last Updated:</span>
                            <span>{batteryStatus?.updatedAt ? formatDate(batteryStatus.updatedAt) : 'Never'}</span>
                        </p>
                    </div>
                </div>

                {/* Trip History Section */}
                <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-md font-semibold mb-2">Recent Trips</h3>
                    {tripHistory && tripHistory.length > 0 ? (
                        <ul className="space-y-2">
                            {tripHistory.map((trip) => (
                                <li key={trip._id} className="p-2 bg-white rounded border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">
                                            {trip.startLocation} → {trip.endLocation}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(trip.date)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-2">No trip history available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
