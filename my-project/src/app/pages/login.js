import { useState } from "react";
import { loginUser } from "../utils/api";
import { useRouter } from "next/router";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useAuthStore();
  const router = useRouter();

  async function handleLogin() {
    const response = await loginUser(email, password);
    if (response.success) {
      setToken(response.token);
      router.push("/dashboard"); // Redirect to map after login
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded w-full mt-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded w-full mt-2"
      />
      <button
        onClick={handleLogin}
        className="mt-4 p-2 bg-blue-600 text-white rounded w-full"
      >
        Login
      </button>
    </div>
  );
}
