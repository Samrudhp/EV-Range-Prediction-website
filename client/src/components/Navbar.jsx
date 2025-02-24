import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const scrollToSection = (sectionId) => {
    navigate("/dashboard"); // Ensure we’re on dashboard
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // Delay to ensure page is rendered
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4 fixed">
      <h2 className="text-2xl font-bold mb-6">EV Prediction</h2>
      <nav className="space-y-4 flex-1">
        <button
          onClick={() => scrollToSection("map")}
          className="block p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          Route Prediction
        </button>
        <button
          onClick={() => scrollToSection("battery")}
          className="block p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          Battery Health
        </button>
        <button
          onClick={() => scrollToSection("trips")}
          className="block p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          Trip History
        </button>
        <button
          onClick={() => scrollToSection("profile")}
          className="block p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          Profile
        </button>
      </nav>
      <button onClick={handleLogout} className="bg-red-600 p-2 rounded hover:bg-red-700">
        Logout
      </button>
    </div>
  );
};

export default Navbar;