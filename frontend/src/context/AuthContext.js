"use client";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from "next/navigation";
import api from '@/utils/api';

// Enhanced cookie helper functions
const cookieUtils = {
  get: (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  },
  remove: (name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
};

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = cookieUtils.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          cookieUtils.remove('token');
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );

    // Check for existing token on mount
    const checkAuth = async () => {
      const token = cookieUtils.get('token');
      if (!token) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        cookieUtils.remove('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkAuth();

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [router]);

  const logoutUser = useCallback(() => {
    cookieUtils.remove('token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    router.push("/login");
  }, [router]);

  if (!initialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user,
      logoutUser,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
