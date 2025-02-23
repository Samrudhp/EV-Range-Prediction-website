import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
});

// Cookie helper functions
const cookieUtils = {
    get: (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    },
    set: (name, value, options = {}) => {
        const defaults = {
            path: '/',
            maxAge: 86400,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        const opts = { ...defaults, ...options };
        document.cookie = `${name}=${value}; ${Object.entries(opts)
            .map(([key, val]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}=${val}`)
            .join('; ')}`;
    },
    remove: (name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
};

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

// Request interceptor with improved token handling
api.interceptors.request.use(
    (config) => {
        const token = cookieUtils.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
            // Clear token and redirect to login
            cookieUtils.remove('token');
            window.location.href = '/login';
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
                    cookieUtils.set('token', response.data.token);
                }
                return response.data;
            } catch (error) {
                throw handleApiError(error, 'Login error');
            }
        },
        logout: () => {
            cookieUtils.remove('token');
            window.location.href = '/login';
        }
    }
};

export default api;
