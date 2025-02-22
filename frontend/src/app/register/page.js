"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiEndpoints } from "@/utils/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState({ 
    name: "", 
    email: "", 
    password: "" 
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validateForm = () => {
    if (!userData.name.trim()) {
      setError("Name is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (userData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    try {
        setLoading(true);
        setError("");
        
        const result = await apiEndpoints.auth.register(userData);
        if (result.success) {
            router.push("/login?registered=true");
        } else {
            throw new Error(result.message || "Registration failed");
        }
    } catch (error) {
        console.error("Registration error:", error);
        setError(
            error?.response?.data?.message || 
            error?.message || 
            "Registration failed. Please try again."
        );
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={userData.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={userData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={userData.password}
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
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
