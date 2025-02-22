"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMap, FiClock, FiBattery, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <div className={`h-screen bg-gray-900 text-white flex flex-col p-5 ${isOpen ? "w-60" : "w-20"} transition-all duration-300`}>
      {/* Toggle Sidebar */}
      <button className="mb-6 self-end text-gray-400" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "←" : "→"}
      </button>

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-4">
        <Link href="/dashboard" className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded">
          <FiMap className="text-xl" />
          {isOpen && <span>Dashboard</span>}
        </Link>

        <Link href="/trips" className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded">
          <FiClock className="text-xl" />
          {isOpen && <span>Trip History</span>}
        </Link>

        <Link href="/battery" className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded">
          <FiBattery className="text-xl" />
          {isOpen && <span>Battery Status</span>}
        </Link>

        <button onClick={handleLogout} className="flex items-center space-x-3 hover:bg-red-600 p-2 rounded mt-auto">
          <FiLogOut className="text-xl" />
          {isOpen && <span>Logout</span>}
        </button>
      </nav>
    </div>
  );
}