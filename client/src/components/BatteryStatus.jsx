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
      toast.success("Battery Updated!");
    } catch (error) {
      toast.error("Update failed: " + error.response?.data?.message);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-purple-900/30">
      <h3 className="text-3xl font-bold mb-6 tracking-wide bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
        Battery Health
      </h3>
      {battery ? (
        <div className="mb-8">
          <p className="text-gray-300 text-xl">
            Level: <span className="font-semibold text-purple-400">{battery.batteryLevel}%</span>
          </p>
          <div className="w-full bg-gray-700 rounded-full h-6 mt-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-700 h-6 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(147,51,234,0.7)]"
              style={{ width: `${battery.batteryLevel}%` }}
            ></div>
          </div>
          <p className="text-gray-300 text-xl mt-4">
            Last Charged: <span className="font-semibold">{new Date(battery.lastCharged).toLocaleString()}</span>
          </p>
          <p className="text-gray-300 text-xl mt-4">
            Health: <span className="font-semibold text-purple-400">{battery.healthStatus}</span>
          </p>
        </div>
      ) : (
        <p className="text-gray-400">Loading...</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="number"
          value={form.batteryLevel}
          onChange={(e) => setForm({ ...form, batteryLevel: e.target.value })}
          placeholder="Battery Level (%)"
          className="w-full p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
        />
        <input
          type="datetime-local"
          value={form.lastCharged}
          onChange={(e) => setForm({ ...form, lastCharged: e.target.value })}
          className="w-full p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
        />
        <input
          type="text"
          value={form.healthStatus}
          onChange={(e) => setForm({ ...form, healthStatus: e.target.value })}
          placeholder="Health Status"
          className="w-full p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg uppercase font-semibold"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default BatteryStatus;