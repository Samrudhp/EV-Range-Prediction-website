"use client";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from "next/navigation";
import api from '@/utils/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
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
          // Clear auth state
          localStorage.removeItem('token');
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );

    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Cleanup interceptors
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [router]);

  const loginUser = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return { success: true };
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginUser,
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
