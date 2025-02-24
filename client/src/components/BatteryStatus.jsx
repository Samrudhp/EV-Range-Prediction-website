import { useState, useEffect } from "react";
import { getBattery, updateBattery } from "../api";

const BatteryStatus = () => {
  const [battery, setBattery] = useState(null);
  const [form, setForm] = useState({ batteryLevel: "", lastCharged: "", healthStatus: "" });

  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const { data } = await getBattery();
        setBattery(data);
      } catch (error) {
        console.error("Battery fetch failed");
      }
    };
    fetchBattery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateBattery(form);
      setBattery(data.battery);
    } catch (error) {
      alert("Update failed");
    }
  };

  return (
    <div id="battery" className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-black">Battery Health</h3>
      {battery ? (
        <div className="mb-4 text-black">
          <p>Level: {battery.batteryLevel}%</p>
          <p>Last Charged: {new Date(battery.lastCharged).toLocaleString()}</p>
          <p>Health: {battery.healthStatus}</p>
        </div>
      ) : (
        <p className="text-black">Loading...</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="number"
          value={form.batteryLevel}
          onChange={(e) => setForm({ ...form, batteryLevel: e.target.value })}
          placeholder="Battery Level"
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          value={form.lastCharged}
          onChange={(e) => setForm({ ...form, lastCharged: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={form.healthStatus}
          onChange={(e) => setForm({ ...form, healthStatus: e.target.value })}
          placeholder="Health Status"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Update
        </button>
      </form>
    </div>
  );
};

export default BatteryStatus;