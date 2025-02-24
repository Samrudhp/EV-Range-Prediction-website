import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const scrollToSection = (sectionId) => {
    navigate("/dashboard");
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <aside className="w-80 h-screen bg-black text-gray-100 fixed flex flex-col p-8 shadow-2xl border-r border-purple-900/30">
      <h2 className="text-4xl font-bold mb-12 tracking-wide bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
        EV PREDICTION
      </h2>
      <nav className="space-y-6 flex-1">
        {[
          { id: "map", label: "Route Prediction" },
          { id: "battery", label: "Battery Health" },
          { id: "trips", label: "Trip History" },
          { id: "profile", label: "Profile" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="w-full text-left py-4 px-6 text-xl font-semibold uppercase tracking-wide hover:bg-purple-900/50 transition-all duration-300 rounded-lg shadow-md hover:shadow-purple-700/30"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-4 px-6 text-xl font-semibold uppercase tracking-wide rounded-lg hover:from-purple-800 hover:to-purple-950 transition-all duration-300 shadow-md"
      >
        Logout
      </button>
    </aside>
  );
};

export default Navbar;