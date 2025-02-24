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
    <aside className="w-72 h-screen bg-gradient-to-b from-blue-800 via-blue-600 to-green-500 text-white fixed flex flex-col p-6 shadow-2xl">
      <h2 className="text-3xl font-extrabold tracking-tight mb-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
        EV Prediction
      </h2>
      <nav className="space-y-4 flex-1">
        {[
          { id: "map", label: "Route Prediction" },
          { id: "battery", label: "Battery Health" },
          { id: "trips", label: "Trip History" },
          { id: "profile", label: "Profile" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="w-full text-left py-3 px-5 rounded-xl bg-opacity-0 hover:bg-white/10 transition-all duration-300 text-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 py-3 px-5 rounded-xl transition-all duration-300 text-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1"
      >
        Logout
      </button>
    </aside>
  );
};

export default Navbar;