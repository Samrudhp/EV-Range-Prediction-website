import { useState, useEffect } from "react";
import { getProfile } from "../api";
import { toast } from "react-toastify";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setProfile(data);
      } catch (error) {
        toast.error("Profile fetch failed: " + error.response?.data?.message);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-purple-900/30">
      <h3 className="text-3xl font-bold mb-6 tracking-wide bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
        Profile
      </h3>
      {profile ? (
        <div className="space-y-4">
          <p className="text-gray-200 text-xl">
            Name: <span className="font-semibold text-purple-400">{profile.name}</span>
          </p>
          <p className="text-gray-200 text-xl">
            Email: <span className="font-semibold text-purple-400">{profile.email}</span>
          </p>
        </div>
      ) : (
        <p className="text-gray-400">Loading...</p>
      )}
    </div>
  );
};

export default Profile;