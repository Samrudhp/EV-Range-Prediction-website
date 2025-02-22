"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Create the context
const AuthContext = createContext();

// Create a custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data);
        } catch (error) {
          console.error("Auth initialization error:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const loginUser = async (email, password) => {
    try {
      console.log("🔄 Attempting to log in...");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login`,
        { email, password }
      );

      console.log("✅ Login success:", response.data);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed"
      };
    }
  };

  // Logout function
  const logoutUser = () => {
    console.log("🔄 Logging out...");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
    console.log("✅ Successfully logged out");
  };

  const value = {
    user,
    loading,
    loginUser,
    logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
