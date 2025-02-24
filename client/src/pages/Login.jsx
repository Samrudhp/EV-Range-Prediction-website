import { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(form);
      localStorage.setItem("token", data.token);
      toast.success("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Login failed: " + error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-lg border border-purple-900/30"
      >
        <h2 className="text-4xl font-bold mb-10 text-center tracking-wide bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
          Login
        </h2>
        <div className="space-y-8">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400 text-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-4 bg-gray-700 text-gray-200 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400 text-lg"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg uppercase font-semibold text-lg"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;