import { create } from 'zustand';

const useStore = create((set) => ({
  // AI Query state
  isLoading: false,
  aiResponse: null,
  error: null,
  
  setLoading: (loading) => set({ isLoading: loading }),
  setAiResponse: (response) => set({ aiResponse: response, error: null }),
  setError: (error) => set({ error, aiResponse: null }),
  clearResponse: () => set({ aiResponse: null, error: null }),
  
  // User state
  currentUser: { id: 'user_001', name: 'Demo User' },
  
  // Route and Map state
  routeData: null,
  sourceLocation: null,
  destinationLocation: null,
  chargingStations: [],
  
  setRouteData: (data) => set({ 
    routeData: data.route,
    sourceLocation: data.source,
    destinationLocation: data.destination,
    chargingStations: data.chargingStations || []
  }),
  clearRouteData: () => set({ 
    routeData: null, 
    sourceLocation: null, 
    destinationLocation: null,
    chargingStations: []
  }),
}));

export default useStore;
