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
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
        Profile
      </h3>
      {profile ? (
        <div className="space-y-4">
          <p className="text-gray-700 text-lg">
            Name: <span className="font-semibold">{profile.name}</span>
          </p>
          <p className="text-gray-700 text-lg">
            Email: <span className="font-semibold">{profile.email}</span>
          </p>
        </div>
      ) : (
        <p className="text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default Profile;