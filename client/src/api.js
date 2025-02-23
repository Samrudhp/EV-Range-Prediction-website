import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => API.post("/users/register", data);
export const login = (data) => API.post("/users/login", data);
export const getProfile = () => API.get("/users/profile");
export const getBattery = () => API.get("/battery/status");
export const updateBattery = (data) => API.post("/battery/update", data);
export const addTrip = (data) => API.post("/trips/add", data);
export const getTrips = () => API.get("/trips/history");
export const getRoute = (data) => API.post("/maps/route");