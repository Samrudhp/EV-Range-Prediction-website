import Link from "next/link";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { token, logout } = useAuthStore();

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between">
      <Link href="/" className="text-lg font-bold">EV Optimizer</Link>
      <div>
        {token ? (
          <>
            <Link href="/dashboard" className="mx-3">Dashboard</Link>
            <Link href="/trip-history" className="mx-3">History</Link>
            <button onClick={logout} className="ml-3 text-red-500">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="mx-3">Login</Link>
            <Link href="/register" className="mx-3">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
