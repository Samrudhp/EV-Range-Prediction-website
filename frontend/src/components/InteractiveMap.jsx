import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 20px;">
          ${icon}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Icons for different marker types
const startIcon = createCustomIcon('#10b981', '🚗');
const endIcon = createCustomIcon('#ef4444', '🏁');
const chargingIcon = createCustomIcon('#3b82f6', '⚡');
const availableChargingIcon = createCustomIcon('#22c55e', '⚡');
const busyChargingIcon = createCustomIcon('#f59e0b', '⚡');

// Component to fit map bounds
function MapBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);

  return null;
}

const InteractiveMap = ({ 
  routeData = null, 
  chargingStations = [], 
  currentLocation = null,
  destination = null,
  height = '600px',
  onStationClick = () => {}
}) => {
  // Default center (India - can be changed based on your region)
  const defaultCenter = [19.0760, 72.8777]; // Mumbai
  const defaultZoom = 10;

  // Calculate all positions for bounds
  const allPositions = [];
  
  if (currentLocation) {
    allPositions.push(currentLocation);
  }
  if (destination) {
    allPositions.push(destination);
  }
  if (routeData && routeData.routes && routeData.routes[0]) {
    allPositions.push(...routeData.routes[0].points);
  }
  chargingStations.forEach(station => {
    allPositions.push(station.position);
  });

  // Route line coordinates
  const routeCoordinates = routeData?.routes?.[0]?.points || [];

  return (
    <div style={{ height, width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
      <MapContainer
        center={currentLocation || defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Map Tiles - Using OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Alternative: Satellite view */}
        {/* <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        /> */}

        {/* Fit bounds to show all markers */}
        {allPositions.length > 0 && <MapBounds positions={allPositions} />}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#3b82f6',
              weight: 5,
              opacity: 0.8,
              dashArray: '10, 10',
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Start Location Marker */}
        {currentLocation && (
          <Marker position={currentLocation} icon={startIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">🚗 Start Location</h3>
                <p className="text-sm text-gray-600">Current Position</p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={destination} icon={endIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">🏁 Destination</h3>
                <p className="text-sm text-gray-600">End Point</p>
                <p className="text-xs text-gray-500 mt-1">
                  {destination[0].toFixed(4)}, {destination[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Charging Station Markers */}
        {chargingStations.map((station, index) => {
          const icon = station.available 
            ? availableChargingIcon 
            : station.available === false 
            ? busyChargingIcon 
            : chargingIcon;

          return (
            <Marker
              key={index}
              position={station.position}
              icon={icon}
              eventHandlers={{
                click: () => onStationClick(station)
              }}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">
                    ⚡ {station.name}
                  </h3>
                  
                  {station.network && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Network:</strong> {station.network}
                    </p>
                  )}
                  
                  {station.power && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Power:</strong> {station.power}
                    </p>
                  )}
                  
                  {station.available !== undefined && (
                    <div className="mt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        station.available 
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-orange-100 text-orange-700 border border-orange-300'
                      }`}>
                        {station.available ? '✓ Available' : '○ Busy'}
                      </span>
                    </div>
                  )}

                  {station.distance && (
                    <p className="text-xs text-gray-500 mt-2">
                      📍 Distance: {station.distance}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Pulsing circle at current location */}
        {currentLocation && (
          <CircleMarker
            center={currentLocation}
            radius={15}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.2,
              weight: 2
            }}
          />
        )}
      </MapContainer>

      {/* Custom CSS for marker animations */}
      <style>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .leaflet-popup-content {
          margin: 0;
        }

        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default InteractiveMap;
