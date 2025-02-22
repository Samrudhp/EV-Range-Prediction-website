import { useDashboard } from "@/context/DashboardContext";

export default function BatteryCard() {
    const { batteryStatus, loading } = useDashboard();

    if (loading) return <p>Loading battery status...</p>;

    return (
        <div className="p-4 bg-white rounded-xl shadow-md">
            <h2 className="text-lg font-bold">Battery Status</h2>
            <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className="bg-green-500 h-4 rounded-full"
                        style={{ width: `${batteryStatus?.level}%` }}
                    ></div>
                </div>
                <p className="text-center mt-1">{batteryStatus?.level}%</p>
            </div>
        </div>
    );
}
