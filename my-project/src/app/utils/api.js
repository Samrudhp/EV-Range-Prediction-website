const API_URL = "http://localhost:5000/api";

export async function registerUser(name, email, password) {
  const response = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

export async function getUserProfile() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });
  return response.json();
}

export async function getTripsByUser() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/trips/history`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });
  return response.json();
}

export async function getBatteryStatus() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/battery/status`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });
  return response.json();
}

export async function getOptimizedRoute(source, destination) {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/map/route", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ source, destination }),
    });
    return response.json();
  }
  