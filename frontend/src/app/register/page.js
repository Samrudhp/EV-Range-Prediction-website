"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

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

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/register`, 
        userData
      );
      router.push("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-md w-80">
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Name"
          className="w-full mb-3 p-2 border rounded"
          value={userData.name}
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          disabled={loading}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          disabled={loading}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={userData.password}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          disabled={loading}
          required
          minLength={6}
        />
        <button 
          type="submit" 
          className={`w-full p-2 rounded text-white ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
