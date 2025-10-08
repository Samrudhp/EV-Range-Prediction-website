import { useState } from 'react';
import Map3D from '../components/Map3D';
import { motion } from 'framer-motion';

// Sample route data - Mumbai to Pune
const sampleRoutes = {
  routes: [
    {
      points: [
        [0, 0, 0],
        [2, 0.2, 2],
        [4, 0.3, 3],
        [6, 0.4, 4],
        [8, 0.2, 6],
        [10, 0.1, 8],
        [12, 0, 10],
      ],
      color: "#3b82f6",
      animated: true
    }
  ]
};

// Sample charging stations
const sampleStations = [
  { 
    position: [3, 0, 3], 
    name: "Lonavala Fast Charger", 
    available: true 
  },
  { 
    position: [7, 0, 5], 
    name: "Khandala Supercharger", 
    available: true 
  },
  { 
    position: [10, 0, 8], 
    name: "Pune City Center", 
    available: false 
  },
];

const currentLocation = [0, 0, 0];

export default function MapDemo() {
  const [showRoute, setShowRoute] = useState(true);
  const [showStations, setShowStations] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          3D Route Visualization
        </h1>
        <p className="text-gray-300 text-lg">
          Interactive 3D map with route planning and charging stations
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto mb-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
      >
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={showRoute}
              onChange={() => setShowRoute(!showRoute)}
              className="w-5 h-5 rounded accent-blue-500"
            />
            <span>Show Route</span>
          </label>
          
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={showStations}
              onChange={() => setShowStations(!showStations)}
              className="w-5 h-5 rounded accent-green-500"
            />
            <span>Show Charging Stations</span>
          </label>
          
          <div className="ml-auto flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Reset View
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              Export Route
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 3D Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        <Map3D
          routeData={showRoute ? sampleRoutes : null}
          chargingStations={showStations ? sampleStations : []}
          currentLocation={currentLocation}
          height="700px"
        />
      </motion.div>

      {/* Route Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Distance Card */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Total Distance</h3>
          </div>
          <p className="text-4xl font-bold text-white mb-2">164 km</p>
          <p className="text-blue-200">Mumbai → Pune</p>
        </div>

        {/* Battery Card */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Battery Required</h3>
          </div>
          <p className="text-4xl font-bold text-white mb-2">45%</p>
          <p className="text-green-200">Current: 75% (30% buffer)</p>
        </div>

        {/* Charging Card */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔌</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Charging Stops</h3>
          </div>
          <p className="text-4xl font-bold text-white mb-2">2</p>
          <p className="text-purple-200">Lonavala, Khandala</p>
        </div>
      </motion.div>

      {/* Station Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-7xl mx-auto mt-8"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Charging Stations Along Route</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleStations.map((station, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{station.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  station.available 
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-400/30'
                }`}>
                  {station.available ? 'Available' : 'Busy'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Distance from start:</span>
                  <span className="text-white font-medium">
                    {Math.round(Math.sqrt(station.position[0]**2 + station.position[2]**2) * 12)} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Charging Speed:</span>
                  <span className="text-white font-medium">150 kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Stop:</span>
                  <span className="text-white font-medium">20 min</span>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all">
                Reserve Slot
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
