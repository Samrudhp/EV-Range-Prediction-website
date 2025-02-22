"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    // Clear error when component mounts or user changes
    if (mounted) {
      setError("");
    }
    
    if (user) {
      router.replace('/dashboard').catch(e => {
        if (mounted) {
          console.error('Navigation error:', e);
          setError("Failed to navigate to dashboard");
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [user, router]);

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter all fields");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const result = await loginUser(formData.email, formData.password);
      
      if (!result?.success) {
        throw new Error(result?.message || "Login failed");
      }
      // Navigation will be handled by the useEffect when user state updates
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error?.response?.data?.message || 
        error?.message || 
        "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className={`w-full py-2 px-4 rounded-md text-white transition-colors duration-200 
                        ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
