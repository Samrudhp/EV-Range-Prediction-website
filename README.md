
# EV Range Prediction Website

## Overview
The EV Range Prediction Website is a full-stack application designed to optimize electric vehicle (EV) journeys by predicting range based on routes, battery status, and trip data. It features a modern, user-friendly interface built with React and Tailwind CSS for the frontend, and a robust backend using Node.js, Express, and MongoDB. The application integrates with OpenRouteService (ORS) API to fetch real-time route data (distance, duration, and coordinates) and calculates EV range predictions via an ML model.

This project aims to assist EV users in planning efficient routes, tracking battery health, and logging trip history, enhancing sustainability and user experience.

---

## Features
- **Route Prediction**: Search for start and end locations to calculate the optimal route and predict EV range using map data from OpenRouteService.
- **Battery Health Monitoring**: Update and view battery levels, last charge time, and health status.
- **Trip History**: Log and review past trips with details like distance, duration, and energy consumption.
- **User Authentication**: Secure login and registration with JWT-based authentication.
- **Dark Theme UI**: Sleek, modern dark-themed interface with purple accents for an elegant, tech-forward feel.
- **Interactive Map**: (Optional, if implemented) Use an interactive map to select locations for routes and trips.

---

## Tech Stack
- **Frontend**:
  - React (v19.0.0) with Vite for fast development.
  - Tailwind CSS for styling.
  - React-Leaflet for map visualization.
  - Axios for HTTP requests.
  - React-Toastify for notifications.

- **Backend**:
  - Node.js with Express for the server.
  - MongoDB with Mongoose for data storage.
  - JWT for authentication.
  - CORS for cross-origin requests.
  - Axios for external API calls (e.g., ML model, OpenRouteService).

- **APIs**:
  - OpenRouteService (ORS) API for geocoding, routing, and map data.
  - Custom ML model endpoint (`http://localhost:8000/predict/`) for range prediction.

---

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v20.17.0 or later)
- **MongoDB** (local or cloud instance, e.g., MongoDB Atlas)
- **npm** (v11.1.0 or later, comes with Node.js)
- An OpenRouteService API key (sign up at [openrouteservice.org](https://openrouteservice.org/))
- (Optional) An ML model server running at `http://localhost:8000/predict/` (for range prediction)

---

## Project Structure
```
EV-Range-Preediction-website/
├── client/              # Frontend (React, Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components (Map, BatteryStatus, etc.)
│   │   ├── pages/       # Pages (Welcome, Login, Dashboard, etc.)
│   │   ├── api.js       # API client for backend communication
│   │   └── ...          # Other files (index.css, main.jsx, etc.)
│   ├── package.json
│   └── .env            # Environment variables (API keys, URLs)
├── backend/              # Backend (Node.js, Express)
│   ├── config/          # MongoDB configuration
│   ├── controllers/     # Business logic (user, battery, trip, map)
│   ├── middleware/      # Authentication, error handling
│   ├── models/          # MongoDB schemas (User, Battery, Trip)
│   ├── routes/          # API routes
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env            # Environment variables (DB URI, port, secrets)
└── README.md            # This file
```

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Samrudhp/EV-Range-Prediction-website.git
cd EV-Range-Prediction-website
```

### 2. Set Up the Backend
- Navigate to the backend directory:
  ```bash
  cd server
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` file with the following variables:
  ```
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/ev_prediction
  JWT_SECRET=your_secret_key_here
  ```
  - Replace `mongodb://localhost:27017/ev_prediction` with your MongoDB connection string (e.g., MongoDB Atlas URI).
  - Use a secure `JWT_SECRET` (e.g., a random string).
- Start MongoDB locally (if using local MongoDB):
  ```bash
  mongod
  ```
- Start the backend:
  ```bash
  node server.js
  ```
  - The server will run on `http://localhost:5000`.

### 3. Set Up the Frontend
- Navigate to the frontend directory:
  ```bash
  cd ../client
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` file with the following variables:
  ```
  VITE_API_URL=http://localhost:5000/api
  VITE_OPENROUTE_API_KEY=your_openroute_api_key_here
  ```
  - Replace `your_openroute_api_key_here` with your ORS API key from [openrouteservice.org](https://openrouteservice.org/).
- Start the frontend:
  ```bash
  npm run dev
  ```
  - The app will run on `http://localhost:5173`.

### 4. (Optional) Set Up ML Model
- Ensure an ML model server is running at `http://localhost:8000/predict/` to handle range predictions.
- Update the `MONGO_URI` in `server/config/db.js` if using a cloud MongoDB instance.

---

## Usage
1. **Access the Website**:
   - Open `http://localhost:5173` in your browser.
   - You’ll see the Welcome page. Click "Login" or "Register" to create an account or log in.

2. **Login/Register**:
   - Use the Login or Register page to authenticate.
   - After login, you’ll be redirected to the Dashboard.

3. **Dashboard Features**:
   - **Route Prediction**: Enter start and end locations in the Map component, click "Calculate" to see the route and predicted range.
   - **Battery Health**: Update or view battery status (level, last charged, health).
   - **Trip History**: Add trips with start/end locations, distance, duration, and energy, then review the history.
   - **Profile**: View user details (name, email).

4. **Backend Interaction**:
   - The frontend communicates with the backend via REST APIs (e.g., `/api/users`, `/api/maps`, `/api/trips`, `/api/battery`).
   - ORS API provides route data, sent to the backend for predictions.

---

## Environment Variables
- **Backend (.env)**:
  ```
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/ev_prediction
  JWT_SECRET=your_secret_key_here
  ```
- **Frontend (.env)**:
  ```
  VITE_API_URL=http://localhost:5000/api
  VITE_OPENROUTE_API_KEY=your_openroute_api_key_here
  ```

---

## API Endpoints
### Backend (Base URL: `http://localhost:5000/api`)
- **Users**:
  - `POST /users/register` – Register a user (body: `name`, `email`, `password`).
  - `POST /users/login` – Log in (body: `email`, `password`).
  - `GET /users/profile` – Get user profile (requires JWT).

- **Battery**:
  - `POST /battery/update` – Update battery status (body: `batteryLevel`, `lastCharged`, `healthStatus`).
  - `GET /battery/status` – Get battery status (requires JWT).

- **Trips**:
  - `POST /trips/add` – Add a trip (body: `startLocation`, `endLocation`, `distance`, `duration`, `energyUsed`).
  - `GET /trips/history` – Get trip history (requires JWT).

- **Maps**:
  - `POST /maps/route` – Get route and predict range (body: `source`, `destination`, `trip_distance`, `elevation_change`, `traffic_delay`, `battery_consumption`).

---

## Contributing
1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Make changes and commit:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Submit a pull request.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details (create one if not present).

---

## Acknowledgments
- OpenRouteService for map and routing data.
- Leaflet and React-Leaflet for map visualization.
- Tailwind CSS for modern styling.
- The open-source community for Node.js, React, and MongoDB tools.

---

### Troubleshooting
- **"All input fields are required"**: Ensure all required fields in `POST /api/maps/route` and `POST /api/trips/add` are sent as non-empty strings or numbers. Use Firefox DevTools (F12 > Network, Console) to debug.
- **Network Errors**: Verify `VITE_OPENROUTE_API_KEY`, internet connectivity, and ORS API limits.
- **Dependency Issues**: Use `npm install --legacy-peer-deps` if facing `ERESOLVE` errors.

Let me know if you want to add specific sections (e.g., screenshots, deployment instructions) or modify anything! This README will help others understand and contribute to your project on GitHub. 🚗⚡
