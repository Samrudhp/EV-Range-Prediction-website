import { useEffect, useState } from "react";
import { getUserProfile } from "../utils/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const response = await getUserProfile();
      if (response.success) {
        setUser(response.user);
      } else {
        alert("Failed to fetch user profile.");
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">User Profile</h2>
      {user ? (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
