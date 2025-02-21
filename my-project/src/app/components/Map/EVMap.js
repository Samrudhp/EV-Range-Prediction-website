import { useEffect, useState } from "react";

export default function Map({ source, destination, routeData }) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@mapbox/mapbox-gl-js").then((mapboxgl) => {
        mapboxgl.accessToken = "YOUR_MAPBOX_API_KEY";
        const newMap = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [77.5946, 12.9716], // Default: Bangalore
          zoom: 10,
        });
        setMap(newMap);
      });
    }
  }, []);

  useEffect(() => {
    if (map && source && destination) {
      console.log("Updating map for route...");
      // Code to draw the route on the map goes here (e.g., using OpenRouter or Mapbox Directions API)
    }
  }, [map, source, destination, routeData]);

  return <div id="map" className="w-full h-96 mt-4 border rounded" />;
}
