"use client";
import { useState } from "react";
import Navbar from "./components/Navbar";
import RouteForm from "./components/RouteForm";
import PredictionChart from "./components/PredictionChart";
import Map from "./components/Map";

export default function Home() {
  const [predictionData, setPredictionData] = useState(null);
  const [route, setRoute] = useState({ start: "", end: "" });

  const handlePredict = async (start, end) => {
    setRoute({ start, end });

    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start, end }),
    });

    const data = await response.json();
    setPredictionData(data);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <RouteForm onSubmit={handlePredict} />
        <Map start={route.start} end={route.end} />
        {predictionData && <PredictionChart data={predictionData} />}
      </div>
    </div>
  );
}
