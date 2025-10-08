import { motion } from 'framer-motion';
import { FaChargingStation, FaBolt, FaMapMarkerAlt, FaWifi } from 'react-icons/fa';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const ChargingPage = () => {
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState(null);
  const chargingStations = useStore((state) => state.chargingStations);
  const sourceLocation = useStore((state) => state.sourceLocation);
  const destinationLocation = useStore((state) => state.destinationLocation);

  // Handle navigation to station on map
  const handleNavigate = (station) => {
    if (station.lat && station.lng) {
      // If station has coordinates, navigate to map with station highlighted
      useStore.setState({
        routeData: [[station.lat, station.lng]],
        sourceLocation: [station.lat, station.lng],
        destinationLocation: null,
        chargingStations: [station]
      });
      navigate('/map');
    } else {
      // Open in Google Maps
      const query = encodeURIComponent(station.location || station.name);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  // Handle showing station details
  const handleDetails = (station) => {
    setSelectedStation(station);
  };

  // Close details modal
  const closeDetails = () => {
    setSelectedStation(null);
  };

  // Use stations from AI query, fallback to default if none
  const stations = useMemo(() => {
    if (chargingStations && chargingStations.length > 0) {
      return chargingStations.map((station, index) => ({
        id: index + 1,
        name: station.name || `Charging Station ${index + 1}`,
        location: station.location || 'Unknown Location',
        power: station.power || '120 kW',
        available: station.available !== false ? (station.available || Math.floor(Math.random() * 8) + 4) : 0,
        total: station.total || 12,
        network: station.network || 'EV Network',
        distance: station.distance || `${Math.round(Math.random() * 100)} km`
      }));
    }
    
    // Fallback to default stations if no AI query
    return [
      { id: 1, name: 'Mumbai Central Supercharger', location: 'Mumbai, MH', power: '150 kW', available: 8, total: 12, network: 'Tesla', distance: '2.3 km' },
      { id: 2, name: 'Lonavala Fast Charger', location: 'Lonavala, MH', power: '120 kW', available: 4, total: 6, network: 'Fortum', distance: '64 km' },
      { id: 3, name: 'Pune Tech Park Station', location: 'Pune, MH', power: '100 kW', available: 0, total: 8, network: 'Tata Power', distance: '148 km' },
      { id: 4, name: 'Khandala Highway Hub', location: 'Khandala, MH', power: '150 kW', available: 6, total: 10, network: 'ChargePoint', distance: '72 km' },
      { id: 5, name: 'Bangalore City Center', location: 'Bangalore, KA', power: '180 kW', available: 12, total: 15, network: 'Tesla', distance: '842 km' },
      { id: 6, name: 'Delhi Airport Charging', location: 'Delhi, DL', power: '200 kW', available: 10, total: 20, network: 'Fortum', distance: '1,414 km' },
    ];
  }, [chargingStations]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalStations = stations.length;
    const totalAvailable = stations.reduce((sum, s) => sum + (s.available || 0), 0);
    const uniqueNetworks = new Set(stations.map(s => s.network)).size;
    const avgDistance = stations.length > 0 
      ? Math.round(stations.reduce((sum, s) => {
          const dist = parseFloat(String(s.distance).replace(/[^\d.]/g, '')) || 0;
          return sum + dist;
        }, 0) / stations.length)
      : 0;

    return {
      totalStations,
      totalAvailable,
      uniqueNetworks,
      avgDistance: avgDistance > 1000 ? `${(avgDistance / 1000).toFixed(1)}k km` : `${avgDistance} km`
    };
  }, [stations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 pb-20 px-6">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Charging Stations
          </h1>
          <p className="text-gray-600 text-lg">
            {chargingStations && chargingStations.length > 0 
              ? `Showing ${stations.length} stations for your route`
              : 'Find nearby charging stations and plan your route'}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Stations', value: stats.totalStations.toString(), icon: FaChargingStation, color: 'from-green-500 to-emerald-500' },
            { label: 'Available Now', value: stats.totalAvailable.toString(), icon: FaBolt, color: 'from-blue-500 to-cyan-500' },
            { label: 'Networks', value: stats.uniqueNetworks.toString(), icon: FaWifi, color: 'from-purple-500 to-indigo-500' },
            { label: 'Avg Distance', value: stats.avgDistance, icon: FaMapMarkerAlt, color: 'from-orange-500 to-red-500' },
          ].map((stat, index) => (
            <div key={index} className="backdrop-blur-xl bg-white/70 border-2 border-blue-200/50 rounded-xl p-4 text-center shadow-lg">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md`}>
                <stat.icon className="text-white text-xl" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Stations Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {stations.map((station, index) => {
            const availabilityPercent = (station.available / station.total) * 100;
            const isAvailable = station.available > 0;
            
            return (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative group"
              >
                {/* Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${
                  isAvailable ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500'
                } rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-all`}></div>
                
                {/* Card */}
                <div className="relative backdrop-blur-xl bg-white/70 border-2 border-blue-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all shadow-lg">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{station.name}</h3>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {station.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isAvailable 
                        ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                        : 'bg-red-100 text-red-700 border-2 border-red-300'
                    }`}>
                      {isAvailable ? 'Available' : 'Full'}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Power</p>
                      <p className="text-gray-800 font-semibold">{station.power}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Network</p>
                      <p className="text-gray-800 font-semibold">{station.network}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Distance</p>
                      <p className="text-gray-800 font-semibold">{station.distance}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Available</p>
                      <p className="text-gray-800 font-semibold">{station.available}/{station.total}</p>
                    </div>
                  </div>

                  {/* Availability Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Availability</span>
                      <span>{Math.round(availabilityPercent)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${availabilityPercent}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className={`h-full ${
                          availabilityPercent > 50 ? 'bg-green-500' : availabilityPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigate(station)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      Navigate
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDetails(station)}
                      className="px-4 py-2 backdrop-blur-xl bg-white/80 border-2 border-blue-200/50 text-gray-700 rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-shadow"
                    >
                      Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Details Modal */}
      {selectedStation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDetails}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedStation.name}</h2>
                <p className="text-gray-600 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-xs" />
                  {selectedStation.location}
                </p>
              </div>
              <button
                onClick={closeDetails}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Availability Status */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Availability</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedStation.available > 0
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-red-100 text-red-700 border-2 border-red-300'
                  }`}>
                    {selectedStation.available > 0 ? 'Available' : 'Full'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  {selectedStation.available}/{selectedStation.total}
                  <span className="text-sm font-normal text-gray-600 ml-2">charging ports</span>
                </div>
              </div>

              {/* Station Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Power Output</p>
                  <p className="text-xl font-bold text-gray-800">{selectedStation.power}</p>
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Network</p>
                  <p className="text-xl font-bold text-gray-800">{selectedStation.network}</p>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Distance</p>
                  <p className="text-xl font-bold text-gray-800">{selectedStation.distance}</p>
                </div>
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1">Charging Type</p>
                  <p className="text-xl font-bold text-gray-800">DC Fast</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs">WiFi</span>
                  <span className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs">Restroom</span>
                  <span className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs">Cafe</span>
                  <span className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs">Parking</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate(selectedStation)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
                >
                  Navigate to Station
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeDetails}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ChargingPage;
