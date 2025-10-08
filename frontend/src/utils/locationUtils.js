// Major Indian cities with coordinates
const CITY_COORDINATES = {
  // Maharashtra
  'mumbai': [19.0760, 72.8777],
  'pune': [18.5204, 73.8567],
  'nagpur': [21.1458, 79.0882],
  'nashik': [19.9975, 73.7898],
  'aurangabad': [19.8762, 75.3433],
  
  // Karnataka
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'mysore': [12.2958, 76.6394],
  'mangalore': [12.9141, 74.8560],
  
  // Tamil Nadu
  'chennai': [13.0827, 80.2707],
  'coimbatore': [11.0168, 76.9558],
  'madurai': [9.9252, 78.1198],
  
  // Delhi NCR
  'delhi': [28.7041, 77.1025],
  'new delhi': [28.6139, 77.2090],
  'gurgaon': [28.4595, 77.0266],
  'gurugram': [28.4595, 77.0266],
  'noida': [28.5355, 77.3910],
  
  // Rajasthan
  'jaipur': [26.9124, 75.7873],
  'udaipur': [24.5854, 73.7125],
  'jodhpur': [26.2389, 73.0243],
  
  // Gujarat
  'ahmedabad': [23.0225, 72.5714],
  'surat': [21.1702, 72.8311],
  'vadodara': [22.3072, 73.1812],
  
  // West Bengal
  'kolkata': [22.5726, 88.3639],
  'calcutta': [22.5726, 88.3639],
  
  // Telangana
  'hyderabad': [17.3850, 78.4867],
  
  // Kerala
  'kochi': [9.9312, 76.2673],
  'thiruvananthapuram': [8.5241, 76.9366],
  'trivandrum': [8.5241, 76.9366],
  
  // Goa
  'goa': [15.2993, 74.1240],
  'panaji': [15.4909, 73.8278],
  
  // Others
  'chandigarh': [30.7333, 76.7794],
  'lucknow': [26.8467, 80.9462],
  'indore': [22.7196, 75.8577],
  'bhopal': [23.2599, 77.4126],
};

// Charging stations database (will be expanded)
const CHARGING_STATIONS_DB = {
  'mumbai-pune': [
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
  ],
  'delhi-jaipur': [
    {
      position: [28.0229, 76.8777],
      name: "Manesar Highway Charger",
      available: true,
      network: "Tata Power",
      power: "100 kW DC",
      distance: "45 km from Delhi"
    },
    {
      position: [27.5706, 76.6413],
      name: "Shahjahanpur Rest Stop",
      available: true,
      network: "Fortum",
      power: "120 kW DC",
      distance: "120 km from Delhi"
    },
  ],
  'bangalore-chennai': [
    {
      position: [12.8230, 78.1568],
      name: "Hosur Charging Hub",
      available: true,
      network: "Ather Grid",
      power: "150 kW DC",
      distance: "40 km from Bangalore"
    },
    {
      position: [12.5266, 78.2150],
      name: "Krishnagiri Fast Charger",
      available: true,
      network: "Tata Power",
      power: "120 kW DC",
      distance: "90 km from Bangalore"
    },
  ],
};

/**
 * Extract city names from a text query
 */
export function extractCitiesFromQuery(query) {
  const text = query.toLowerCase();
  const cities = Object.keys(CITY_COORDINATES);
  
  const foundCities = cities.filter(city => {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
    return cityRegex.test(text);
  });
  
  return foundCities;
}

/**
 * Parse source and destination from query
 */
export function parseSourceDestination(query) {
  const cities = extractCitiesFromQuery(query);
  
  if (cities.length >= 2) {
    // Common patterns: "from X to Y", "X to Y", "reach Y from X"
    const text = query.toLowerCase();
    
    // Pattern: "from X to Y"
    const fromToMatch = text.match(/from\s+(\w+)\s+to\s+(\w+)/i);
    if (fromToMatch) {
      const source = cities.find(c => fromToMatch[1].includes(c));
      const dest = cities.find(c => fromToMatch[2].includes(c));
      if (source && dest) return { source, destination: dest };
    }
    
    // Pattern: "X to Y"
    const toMatch = text.match(/(\w+)\s+to\s+(\w+)/i);
    if (toMatch) {
      const source = cities.find(c => toMatch[1].includes(c));
      const dest = cities.find(c => toMatch[2].includes(c));
      if (source && dest) return { source, destination: dest };
    }
    
    // Pattern: "reach Y from X"
    const reachMatch = text.match(/reach\s+(\w+)\s+from\s+(\w+)/i);
    if (reachMatch) {
      const dest = cities.find(c => reachMatch[1].includes(c));
      const source = cities.find(c => reachMatch[2].includes(c));
      if (source && dest) return { source, destination: dest };
    }
    
    // Default: first two cities found
    return { source: cities[0], destination: cities[1] };
  }
  
  return null;
}

/**
 * Get coordinates for a city
 */
export function getCityCoordinates(cityName) {
  const normalized = cityName.toLowerCase().trim();
  return CITY_COORDINATES[normalized] || null;
}

/**
 * Generate route points between two coordinates
 */
export function generateRoutePoints(sourceCoords, destCoords, numPoints = 6) {
  const points = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    const lat = sourceCoords[0] + (destCoords[0] - sourceCoords[0]) * ratio;
    const lng = sourceCoords[1] + (destCoords[1] - sourceCoords[1]) * ratio;
    points.push([lat, lng]);
  }
  
  return points;
}

/**
 * Get charging stations for a route
 */
export function getChargingStationsForRoute(source, destination) {
  const routeKey = `${source}-${destination}`;
  const reverseKey = `${destination}-${source}`;
  
  // Try both directions
  let stations = CHARGING_STATIONS_DB[routeKey] || CHARGING_STATIONS_DB[reverseKey];
  
  if (!stations) {
    // Generate generic charging stations along the route if no specific data
    const sourceCoords = getCityCoordinates(source);
    const destCoords = getCityCoordinates(destination);
    
    if (sourceCoords && destCoords) {
      const midpoint1 = [
        sourceCoords[0] + (destCoords[0] - sourceCoords[0]) * 0.33,
        sourceCoords[1] + (destCoords[1] - sourceCoords[1]) * 0.33
      ];
      
      const midpoint2 = [
        sourceCoords[0] + (destCoords[0] - sourceCoords[0]) * 0.66,
        sourceCoords[1] + (destCoords[1] - sourceCoords[1]) * 0.66
      ];
      
      stations = [
        {
          position: midpoint1,
          name: "Highway Charging Point 1",
          available: true,
          network: "Tata Power",
          power: "120 kW DC",
          distance: "~33% of route"
        },
        {
          position: midpoint2,
          name: "Highway Charging Point 2",
          available: true,
          network: "Fortum",
          power: "100 kW DC",
          distance: "~66% of route"
        }
      ];
    }
  }
  
  return stations || [];
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
}

/**
 * Process AI query and extract route information
 */
export function processAIQueryForRoute(query) {
  const locations = parseSourceDestination(query);
  
  if (!locations) {
    return null;
  }
  
  const sourceCoords = getCityCoordinates(locations.source);
  const destCoords = getCityCoordinates(locations.destination);
  
  if (!sourceCoords || !destCoords) {
    return null;
  }
  
  const routePoints = generateRoutePoints(sourceCoords, destCoords);
  const chargingStations = getChargingStationsForRoute(locations.source, locations.destination);
  const distance = calculateDistance(sourceCoords, destCoords);
  
  return {
    source: sourceCoords,
    destination: destCoords,
    sourceName: locations.source.charAt(0).toUpperCase() + locations.source.slice(1),
    destinationName: locations.destination.charAt(0).toUpperCase() + locations.destination.slice(1),
    route: {
      routes: [{
        points: routePoints,
        color: "#3b82f6",
        animated: true
      }]
    },
    chargingStations,
    distance
  };
}
