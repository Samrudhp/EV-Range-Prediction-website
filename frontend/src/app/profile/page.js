"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "" 
  });

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name, 
        email: user.email, 
        password: "" 
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      setError("Profile updated successfully");
    } catch (error) {
      console.error("Profile update failed:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {error && (
        <div className={`p-3 mb-4 rounded ${
          error === "Profile updated successfully" 
            ? "bg-green-50 text-green-600 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Name"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-gray-50"
            placeholder="Email"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Leave blank to keep current password"
            disabled={loading}
            minLength={6}
          />
        </div>
        <button 
          type="submit" 
          className={`w-full p-2 rounded ${
            loading ? "bg-gray-400" : "bg-blue-500 text-white"
          }`}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
