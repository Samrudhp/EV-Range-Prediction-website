import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  currentQuery: '',
  setCurrentQuery: (query) => set({ currentQuery: query }),
  
  aiResponse: null,
  setAiResponse: (response) => set({ aiResponse: response }),
  
  loading: false,
  setLoading: (loading) => set({ loading }),
  
  mapData: null,
  setMapData: (data) => set({ mapData: data }),
}));

export default useStore;
