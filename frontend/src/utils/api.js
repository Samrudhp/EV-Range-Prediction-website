import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
});

// Custom error class with better error handling
class ApiError extends Error {
    constructor(message, status, originalError = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
        
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            timestamp: this.timestamp
        };
    }
}

// Request interceptor
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.warn("LocalStorage access issue:", error);
            }
        }
        return config;
    },
    (error) => Promise.reject(new ApiError(
        error.message,
        error.response?.status,
        error
    ))
);

// Enhanced error handler with better error propagation
const handleApiError = (error, context) => {
    const apiError = error instanceof ApiError ? error : new ApiError(
        error.response?.data?.message || error.message || 'Unknown error occurred',
        error.response?.status,
        error
    );

    console.error(`API Error [${context}]:`, apiError.toJSON());

    // Always return a rejected promise to maintain consistent error handling
    return Promise.reject(apiError);
};

// Response interceptor without hooks
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Use window.location for navigation instead of router
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return handleApiError(error, 'Response interceptor');
    }
);

// API endpoints with enhanced error handling
export const apiEndpoints = {
    maps: {
        getRoute: async (routeData) => {
            try {
                const response = await api.post('/maps/route', routeData);
                return response.data;
            } catch (error) {
                handleApiError(error, 'Route calculation error');
            }
        }
    },

    users: {
       
        getProfile: async () => {
            try {
                const response = await api.get('/users/profile');
                return response.data;
            } catch (error) {
                handleApiError(error, 'Profile fetch error');
            }
        }
    },
    
    battery: {
        getStatus: async () => {
            try {
                const response = await api.get('/battery/status');
                return response.data;
            } catch (error) {
                return handleApiError(error, 'Battery status fetch');
            }
        },
        update: async (data) => {
            try {
                const response = await api.post('/battery/update', data);
                return response.data;
            } catch (error) {
                return handleApiError(error, 'Battery update');
            }
        }
    },
    trips: {
        getHistory: async () => {
            try {
                const response = await api.get('/trips/history');
                return response.data;
            } catch (error) {
                handleApiError(error, 'Error fetching trip history');
            }
        },
        create: async (tripData) => {
            try {
                const response = await api.post('/trips/add', tripData);
                return response.data;
            } catch (error) {
                handleApiError(error, 'Error creating trip');
            }
        }
    },
    auth: {
        register: async (userData) => {
            try {
                const response = await api.post('/auth/register', userData);
                return response.data;
            } catch (error) {
                throw handleApiError(error, 'Registration error');
            }
        },

        login: async (credentials) => {
            try {
                const response = await api.post('/auth/login', credentials);
                if (response.data?.token) {
                    localStorage.setItem('token', response.data.token);
                }
                return response.data;
            } catch (error) {
                throw handleApiError(error, 'Login error');
            }
        },
        logout: () => {
            localStorage.removeItem('token');
            // Use window.location for navigation instead of router
            window.location.href = '/login';
        }
    }
};

export default api;
