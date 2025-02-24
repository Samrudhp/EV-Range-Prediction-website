import { useState, useEffect } from "react";
import { getBattery, updateBattery } from "../api";
import { toast } from "react-toastify";

const BatteryStatus = () => {
  const [battery, setBattery] = useState(null);
  const [form, setForm] = useState({ batteryLevel: "", lastCharged: "", healthStatus: "" });

  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const { data } = await getBattery();
        setBattery(data);
      } catch (error) {
        toast.error("Battery fetch failed: " + error.response?.data?.message);
      }
    };
    fetchBattery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateBattery(form);
      setBattery(data.battery);
      toast.success("Battery updated successfully!");
    } catch (error) {
      toast.error("Update failed: " + error.response?.data?.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
        Battery Health
      </h3>
      {battery ? (
        <div className="mb-6">
          <p className="text-gray-700 text-lg">Level: <span className="font-semibold">{battery.batteryLevel}%</span></p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${battery.batteryLevel}%` }}
            ></div>
          </div>
          <p className="text-gray-700 text-lg mt-2">
            Last Charged: <span className="font-semibold">{new Date(battery.lastCharged).toLocaleString()}</span>
          </p>
          <p className="text-gray-700 text-lg mt-2">
            Health: <span className="font-semibold text-green-600">{battery.healthStatus}</span>
          </p>
        </div>
      ) : (
        <p className="text-gray-500">Loading...</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          value={form.batteryLevel}
          onChange={(e) => setForm({ ...form, batteryLevel: e.target.value })}
          placeholder="Battery Level (%)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="datetime-local"
          value={form.lastCharged}
          onChange={(e) => setForm({ ...form, lastCharged: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={form.healthStatus}
          onChange={(e) => setForm({ ...form, healthStatus: e.target.value })}
          placeholder="Health Status"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-md"
        >
          Update Battery
        </button>
      </form>
    </div>
  );
};

export default BatteryStatus;