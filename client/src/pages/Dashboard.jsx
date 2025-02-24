import Navbar from "../components/Navbar";
import Map from "../components/Map";
import BatteryStatus from "../components/BatteryStatus";
import TripHistory from "../components/TripHistory";
import Profile from "../components/Profile";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Navbar />
      <main className="flex-1 ml-72 p-10">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
          Dashboard
        </h1>
        <div className="space-y-10">
          <section id="map" className="transform transition-all duration-300 hover:scale-[1.02]">
            <Map />
          </section>
          <section id="battery" className="transform transition-all duration-300 hover:scale-[1.02]">
            <BatteryStatus />
          </section>
          <section id="trips" className="transform transition-all duration-300 hover:scale-[1.02]">
            <TripHistory />
          </section>
          <section id="profile" className="transform transition-all duration-300 hover:scale-[1.02]">
            <Profile />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;