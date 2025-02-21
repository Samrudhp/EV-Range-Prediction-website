import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function BatteryChart({ level }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([{ name: "Battery", level }]);
  }, [level]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="level" fill={level > 50 ? "#4CAF50" : "#F44336"} />
      </BarChart>
    </ResponsiveContainer>
  );
}
