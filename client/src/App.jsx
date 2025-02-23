import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS for styling
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      {/* Place ToastContainer outside Routes so it’s always rendered */}
      <ToastContainer
        position="top-right" // Where toasts appear
        autoClose={3000} // Close after 3 seconds
        hideProgressBar={false} // Show progress bar
        newestOnTop={true} // New toasts on top
        closeOnClick // Close on click
        rtl={false} // Left-to-right
        pauseOnFocusLoss // Pause when window loses focus
        draggable // Allow dragging
        pauseOnHover // Pause on hover
        theme="light" // Light or dark theme
      />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;