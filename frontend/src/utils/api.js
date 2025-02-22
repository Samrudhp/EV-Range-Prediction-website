import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Only run on client side
if (typeof window !== 'undefined') {
    api.interceptors.request.use((config) => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn("LocalStorage access issue:", error);
        }
        return config;
    });
}

// Battery status API call
export const getBatteryStatus = async () => {
    try {
        const response = await api.get('/battery/status');
        return response.data;
    } catch (error) {
        console.error('Error fetching battery status:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch battery status');
    }
};

// Trip history API call
export const getTripHistory = async () => {
    try {
        const response = await api.get('/trips/history');
        return response.data;
    } catch (error) {
        console.error('Error fetching trip history:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch trip history');
    }
};

export default api;
