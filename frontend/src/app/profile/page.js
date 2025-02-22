"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiEndpoints } from "@/utils/api";

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiEndpoints.users.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile Information</h1>
      
      <div className="space-y-4">
        <div className="border rounded-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="text-lg">{profile?.name || 'Not available'}</div>
        </div>

        <div className="border rounded-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="text-lg">{profile?.email || 'Not available'}</div>
        </div>

        <div className="border rounded-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Member Since
          </label>
          <div className="text-lg">
            {profile?.createdAt 
              ? new Date(profile.createdAt).toLocaleDateString() 
              : 'Not available'}
          </div>
        </div>
      </div>
    </div>
  );
}
