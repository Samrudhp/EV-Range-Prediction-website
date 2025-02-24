import { useState, useEffect } from "react";
import { getProfile } from "../api";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Profile fetch failed");
      }
    };
    fetchProfile();
  }, []);

  return (
    <div id="profile" className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-black">Profile</h3>
      {profile ? (
        <div className="text-black">
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;