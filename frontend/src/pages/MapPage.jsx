import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/InteractiveMap';
import useStore from '../store/useStore';
import { calculateDistance } from '../utils/locationUtils';
import { 
  FaRoad, 
  FaBolt, 
  FaChargingStation, 
  FaMapMarkerAlt, 
  FaClock, 
  FaRoute,
  FaInfoCircle,
  FaTimes,
  FaArrowLeft,
  FaLocationArrow
} from 'react-icons/fa';

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
  const navigate = useNavigate();
  const { routeData, sourceLocation, destinationLocation, chargingStations, clearRouteData } = useStore();
  const [showRoute, setShowRoute] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapView, setMapView] = useState('standard'); // standard, satellite, terrain
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState('');

  // Use data from store if available, otherwise use sample data
  const routes = routeData || sampleRoutes;
  const currentLocation = sourceLocation || defaultCurrentLocation;
  const destination = destinationLocation || defaultDestination;
  const stations = chargingStations.length > 0 ? chargingStations : sampleStations;
  const isAIRoute = !!routeData;

  // Calculate estimated arrival time
  useEffect(() => {
    const distance = calculateDistance(currentLocation, destination);
    const drivingTime = distance / 60; // hours at 60 km/h average
    const chargingTime = stations.filter(s => s.available !== false).length * 0.5;
    const totalHours = drivingTime + chargingTime;
    
    const now = new Date();
    now.setHours(now.getHours() + Math.floor(totalHours));
    now.setMinutes(now.getMinutes() + Math.round((totalHours % 1) * 60));
    
    setEstimatedArrival(now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }));
  }, [currentLocation, destination, stations]);

  // Calculate dynamic trip statistics
  const tripStats = useMemo(() => {
    const distance = calculateDistance(currentLocation, destination);
    const numStops = stations.filter(s => s.available !== false).length;
    
    // Estimate battery needed (assume 15 kWh/100km average)
    const batteryNeeded = Math.round((distance * 15) / 100);
    const currentBattery = 75; // Assume 75% starting
    const bufferNeeded = batteryNeeded + 10; // 10% safety buffer
    
    // Estimate time (assume 60 km/h average with charging)
    const drivingTime = distance / 60;
    const chargingTime = numStops * 0.5; // 30 min per stop
    const totalTime = drivingTime + chargingTime;
    
    // Get city names from coordinates (reverse lookup)
    const getLocationName = (coords) => {
      // Try to find matching city in the original data
      if (routeData && sourceLocation && destinationLocation) {
        // We have AI-generated data with city names
        return null; // Will use default display
      }
      return 'Location';
    };
    
    return {
      distance,
      batteryNeeded,
      bufferNeeded,
      currentBattery,
      numStops,
      totalTime,
      stationNames: stations.slice(0, 2).map(s => s.name.split(' ')[0]).join(', ')
    };
  }, [currentLocation, destination, stations, routeData, sourceLocation, destinationLocation]);

  const handleStationClick = (station) => {
    setSelectedStation(station);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 pb-20 px-6">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 right-1/3 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            {isAIRoute && (
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/ai-assistant')}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 border-2 border-blue-200/50 rounded-xl font-medium text-gray-700 shadow-md hover:shadow-lg transition-all"
              >
                <FaArrowLeft />
                <span>Back to AI Assistant</span>
              </motion.button>
            )}
            
            {isAIRoute && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (confirm('Clear route and return to sample view?')) {
                    clearRouteData();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-200 rounded-xl font-medium text-red-700 shadow-md hover:bg-red-100 transition-all"
              >
                <FaTimes />
                <span>Clear Route</span>
              </motion.button>
            )}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Interactive Route Map
          </h1>
          <p className="text-gray-600 text-lg">
            {isAIRoute
              ? "🤖 AI-generated route with optimized charging stops" 
              : "Interactive map with route planning and charging stations"}
          </p>
          
          {isAIRoute && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300/50 rounded-xl px-5 py-3 shadow-md"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <FaMapMarkerAlt className="text-blue-600" />
              <span className="text-gray-700 font-medium">
                AI Assistant detected route • ETA: {estimatedArrival}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 backdrop-blur-xl bg-white/70 border-2 border-blue-200/50 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                <input
                  type="checkbox"
                  checked={showRoute}
                  onChange={() => setShowRoute(!showRoute)}
                  className="w-5 h-5 rounded accent-blue-500"
                />
                <FaRoute className="text-blue-600" />
                <span className="font-medium">Show Route</span>
              </label>
              
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-green-600 transition-colors">
                <input
                  type="checkbox"
                  checked={showStations}
                  onChange={() => setShowStations(!showStations)}
                  className="w-5 h-5 rounded accent-green-500"
                />
                <FaChargingStation className="text-green-600" />
                <span className="font-medium">Charging Stations</span>
              </label>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTripDetails(!showTripDetails)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-md ${
                  showTripDetails
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/80 text-gray-700 border-2 border-indigo-200'
                }`}
              >
                <FaInfoCircle />
                <span>Trip Details</span>
              </motion.button>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowRoute(true);
                  setShowStations(true);
                  setSelectedStation(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-md"
              >
                <FaLocationArrow className="inline mr-2" />
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
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Distance Card */}
          <motion.div 
            className="relative group"
            whileHover={{ y: -4 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all"></div>
            <div className="relative backdrop-blur-xl bg-white/70 border-2 border-blue-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all shadow-lg h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <FaRoad className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Distance</h3>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {tripStats.distance} <span className="text-2xl">km</span>
              </p>
              <p className="text-blue-600 text-sm font-medium">
                {isAIRoute ? '🤖 AI Optimized' : 'Sample Route'}
              </p>
            </div>
          </motion.div>

          {/* Battery Card */}
          <motion.div 
            className="relative group"
            whileHover={{ y: -4 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all"></div>
            <div className="relative backdrop-blur-xl bg-white/70 border-2 border-green-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all shadow-lg h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <FaBolt className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Battery</h3>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                ~{tripStats.batteryNeeded}<span className="text-2xl">%</span>
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    style={{ width: `${Math.min(tripStats.batteryNeeded, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{tripStats.currentBattery}%</span>
              </div>
            </div>
          </motion.div>

          {/* Charging Card */}
          <motion.div 
            className="relative group"
            whileHover={{ y: -4 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all"></div>
            <div className="relative backdrop-blur-xl bg-white/70 border-2 border-purple-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all shadow-lg h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <FaChargingStation className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Stops</h3>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {tripStats.numStops}
              </p>
              <p className="text-purple-600 text-sm font-medium truncate">
                {tripStats.stationNames || 'No stations'}
              </p>
            </div>
          </motion.div>

          {/* Time Card */}
          <motion.div 
            className="relative group"
            whileHover={{ y: -4 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all"></div>
            <div className="relative backdrop-blur-xl bg-white/70 border-2 border-orange-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all shadow-lg h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <FaClock className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Est. Time</h3>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {Math.floor(tripStats.totalTime)}<span className="text-2xl">h</span> {Math.round((tripStats.totalTime % 1) * 60)}<span className="text-2xl">m</span>
              </p>
              <p className="text-orange-600 text-sm font-medium">
                Arrive at {estimatedArrival}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Trip Details Panel */}
        <AnimatePresence>
          {showTripDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="backdrop-blur-xl bg-white/70 border-2 border-blue-200/50 rounded-2xl p-6 shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaRoute className="text-blue-600" />
                  Trip Details
                </h3>
                <button
                  onClick={() => setShowTripDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Route Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" />
                    Route Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                      <span className="text-gray-600">Total Distance</span>
                      <span className="font-bold text-gray-800">{tripStats.distance} km</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                      <span className="text-gray-600">Energy Required</span>
                      <span className="font-bold text-gray-800">{tripStats.batteryNeeded}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                      <span className="text-gray-600">Charging Stops</span>
                      <span className="font-bold text-gray-800">{tripStats.numStops}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                      <span className="text-gray-600">Estimated Duration</span>
                      <span className="font-bold text-gray-800">
                        {Math.floor(tripStats.totalTime)}h {Math.round((tripStats.totalTime % 1) * 60)}m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Charging Strategy */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FaChargingStation className="text-green-500" />
                    Charging Strategy
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                      <p className="text-sm text-gray-600 mb-2">Current Battery</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-white rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${tripStats.currentBattery}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-800">{tripStats.currentBattery}%</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Recommended Strategy</p>
                      <p className="text-sm font-medium text-gray-800">
                        {tripStats.numStops > 0 
                          ? `Charge at ${tripStats.numStops} stations along the route for optimal efficiency`
                          : 'No charging needed - sufficient battery for entire trip'}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Safety Buffer</p>
                      <p className="text-sm font-medium text-gray-800">
                        Maintain 10% buffer • Arrival battery: ~{tripStats.currentBattery - tripStats.bufferNeeded}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stations List */}
              {stations.length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FaChargingStation className="text-purple-500" />
                    Charging Stations on Route ({stations.length})
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {stations.map((station, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all cursor-pointer"
                        onClick={() => setSelectedStation(station)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-800 text-sm">{station.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            station.available !== false
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {station.available !== false ? '✓ Available' : '✗ Busy'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>{station.power || '120 kW'}</span>
                          <span>•</span>
                          <span>{station.network || 'EV Network'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Station Details Modal */}
        <AnimatePresence>
          {selectedStation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStation(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedStation.name}</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-500" />
                      {selectedStation.location || 'Location information unavailable'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Status Banner */}
                <div className={`mb-6 p-4 rounded-xl border-2 ${
                  selectedStation.available !== false
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                    : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Current Status</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      selectedStation.available !== false
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {selectedStation.available !== false ? '✓ AVAILABLE' : '✗ ALL PORTS BUSY'}
                    </span>
                  </div>
                </div>

                {/* Station Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                    <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                      <FaBolt className="text-blue-500" />
                      Power Output
                    </p>
                    <p className="text-2xl font-bold text-gray-800">{selectedStation.power || '120 kW'}</p>
                    <p className="text-xs text-gray-500 mt-1">DC Fast Charging</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
                    <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                      <FaChargingStation className="text-purple-500" />
                      Network
                    </p>
                    <p className="text-2xl font-bold text-gray-800">{selectedStation.network || 'EV Network'}</p>
                    <p className="text-xs text-gray-500 mt-1">Verified Provider</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4">
                    <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                      <FaRoad className="text-orange-500" />
                      Distance
                    </p>
                    <p className="text-2xl font-bold text-gray-800">{selectedStation.distance || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">From current location</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                      <FaClock className="text-green-500" />
                      Charging Time
                    </p>
                    <p className="text-2xl font-bold text-gray-800">~30 min</p>
                    <p className="text-xs text-gray-500 mt-1">80% charge estimate</p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Available Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {['WiFi', 'Restroom', 'Cafe', 'Parking', '24/7 Access', 'ATM'].map((amenity) => (
                      <span key={amenity} className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const query = encodeURIComponent(selectedStation.location || selectedStation.name);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Navigate to Station
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStation(null)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
