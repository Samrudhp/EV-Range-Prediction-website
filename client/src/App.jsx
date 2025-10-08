import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingNavbar from "./components/FloatingNavbar";
import AIQueryInterface from "./components/AIQueryInterface";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MapDemo from "./pages/MapDemo";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 -z-10">
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <FloatingNavbar />
      
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        theme="dark"
        toastClassName="backdrop-blur-xl bg-white/10 border border-white/20"
      />
      
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><AIQueryInterface /></PrivateRoute>} />
        <Route path="/ai" element={<AIQueryInterface />} />
        <Route path="/map" element={<MapDemo />} />
      </Routes>
    </Router>
  );
}

export default App;