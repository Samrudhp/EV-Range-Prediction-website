import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4 fixed">
      <h2 className="text-2xl font-bold mb-6">EV Prediction</h2>
      <nav className="space-y-4 flex-1">
        <Link to="/dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</Link>
        <Link to="/dashboard#battery" className="block p-2 hover:bg-gray-700 rounded">Battery Health</Link>
        <Link to="/dashboard#trips" className="block p-2 hover:bg-gray-700 rounded">Trip History</Link>
        <Link to="/dashboard#profile" className="block p-2 hover:bg-gray-700 rounded">Profile</Link>
      </nav>
      <button onClick={handleLogout} className="bg-red-600 p-2 rounded hover:bg-red-700">
        Logout
      </button>
    </div>
  );
};

export default Navbar;