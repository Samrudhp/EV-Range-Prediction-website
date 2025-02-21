import { useEffect, useState } from "react";
import { getBatteryStatus } from "../utils/api";
import BatteryChart from "../components/Charts/BatteryChart";

export default function BatteryStatus() {
  const [battery, setBattery] = useState(null);

  useEffect(() => {
    async function fetchBatteryStatus() {
      const response = await getBatteryStatus();
      if (response.success) {
        setBattery(response.battery);
      } else {
        alert("Failed to fetch battery status.");
      }
    }
    fetchBatteryStatus();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Battery Status</h2>
      {battery ? (
        <BatteryChart level={battery.level} />
      ) : (
        <p>Loading battery data...</p>
      )}
    </div>
  );
}
