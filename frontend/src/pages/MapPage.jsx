import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InteractiveMap from '../components/InteractiveMap';
import useStore from '../store/useStore';
import { FaRoad, FaBolt, FaChargingStation, FaMapMarkerAlt } from 'react-icons/fa';

// Sample route data - Mumbai to Pune (Real coordinates) - Used as fallback
const sampleRoutes = {
  routes: [
    {
      points: [
        [19.0760, 72.8777],  // Mumbai
        [19.1136, 73.0973],  // Panvel
        [18.9894, 73.2933],  // Lonavala
        [18.7537, 73.4263],  // Khandala
        [18.5679, 73.7143],  // Talegaon
        [18.5204, 73.8567],  // Pune
      ],
      color: "#3b82f6",
      animated: true
    }
  ]
};

// Sample charging stations with real coordinates - Used as fallback
const sampleStations = [
  { 
    position: [18.9894, 73.2933], 
    name: "Lonavala Fast Charger", 
    available: true,
    network: "Fortum Charge & Drive",
    power: "150 kW DC",
    distance: "85 km from Mumbai"
  },
  { 
    position: [18.7537, 73.4263], 
    name: "Khandala Supercharger", 
    available: true,
    network: "Tata Power EZ Charge",
    power: "120 kW DC",
    distance: "110 km from Mumbai"
  },
  { 
    position: [18.5679, 73.7143], 
    name: "Talegaon City Center", 
    available: false,
    network: "ChargePoint",
    power: "50 kW DC",
    distance: "145 km from Mumbai"
  },
];

const defaultCurrentLocation = [19.0760, 72.8777]; // Mumbai
const defaultDestination = [18.5204, 73.8567]; // Pune

export default function MapPage() {
  const { routeData, sourceLocation, destinationLocation, chargingStations } = useStore();
  const [showRoute, setShowRoute] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  // Use data from store if available, otherwise use sample data
  const routes = routeData || sampleRoutes;
  const currentLocation = sourceLocation || defaultCurrentLocation;
  const destination = destinationLocation || defaultDestination;
  const stations = chargingStations.length > 0 ? chargingStations : sampleStations;

  const handleStationClick = (station) => {
    setSelectedStation(station);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 pb-20 px-6">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Interactive Route Map
          </h1>
          <p className="text-gray-600 text-lg">
            {routeData 
              ? "🤖 AI-generated route with optimized charging stops" 
              : "Real map with route planning and charging stations (Sample Route: Mumbai to Pune)"}
          </p>
          {routeData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300/50 rounded-xl px-4 py-2"
            >
              <FaMapMarkerAlt className="text-blue-600" />
              <span className="text-gray-700 font-medium">
                AI Assistant detected route and updated the map
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 backdrop-blur-xl bg-white/70 border-2 border-blue-200/50 rounded-2xl p-4 shadow-lg"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showRoute}
                onChange={() => setShowRoute(!showRoute)}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span className="font-medium">Show Route</span>
            </label>
            
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showStations}
                onChange={() => setShowStations(!showStations)}
                className="w-5 h-5 rounded accent-green-500"
              />
              <span className="font-medium">Show Charging Stations</span>
            </label>
            
            <div className="ml-auto flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowRoute(true);
                  setShowStations(true);
                  setSelectedStation(null);
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-md"
              >
                Reset View
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/60 border-2 border-blue-200/50 rounded-3xl p-2 shadow-2xl overflow-hidden"
        >
          <InteractiveMap
            routeData={showRoute ? routes : null}
            chargingStations={showStations ? stations : []}
            currentLocation={currentLocation}
            destination={destination}
            height="700px"
            onStationClick={handleStationClick}
          />
        </motion.div>

        {/* Route Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Distance Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all"></div>
            <div className="relative backdrop-blur-xl bg-white/70 border-2 border-blue-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaRoad className="text-2xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Total Distance</h3>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">164 km</p>
              <p className="text-blue-600">Mumbai → Pune</p>
            </div>
          </div>

          {/* Battery Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all"></div>
            <div className="relative backdrop-blur-xl bg-white/70 border-2 border-green-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaBolt className="text-2xl text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Battery Required</h3>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">45%</p>
              <p className="text-green-600">Current: 75% (30% buffer)</p>
            </div>
          </div>

          {/* Charging Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all"></div>
            <div className="relative backdrop-blur-xl bg-white/70 border-2 border-purple-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FaChargingStation className="text-2xl text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Charging Stops</h3>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">2</p>
              <p className="text-purple-600">Lonavala, Khandala</p>
            </div>
          </div>
        </motion.div>

        {/* Station Details */}
        {selectedStation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 backdrop-blur-xl bg-white/70 border-2 border-blue-200/50 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Selected Station</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Name</p>
                <p className="text-gray-800 font-semibold">{selectedStation.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Network</p>
                <p className="text-gray-800 font-semibold">{selectedStation.network}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Power</p>
                <p className="text-gray-800 font-semibold">{selectedStation.power}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedStation.available 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : 'bg-red-100 text-red-700 border-2 border-red-300'
                }`}>
                  {selectedStation.available ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
