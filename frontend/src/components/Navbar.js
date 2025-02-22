"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logoutUser } = useAuth();

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">EV Optimization</h1>
      <div>
        {user ? (
          <>
            <Link href="/map" className="mr-4">Map</Link>
            <button onClick={logoutUser} className="bg-red-500 px-4 py-2 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="mr-4">Login</Link>
            <Link href="/register" className="bg-blue-500 px-4 py-2 rounded">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
