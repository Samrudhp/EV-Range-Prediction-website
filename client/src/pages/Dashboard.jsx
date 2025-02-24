import Navbar from "../components/Navbar";
import Map from "../components/Map";
import BatteryStatus from "../components/BatteryStatus";
import TripHistory from "../components/TripHistory";
import Profile from "../components/Profile";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="flex-1 ml-80 p-12">
        <h1 className="text-5xl font-bold mb-16 tracking-wide bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="space-y-16">
          <section id="map" className="transition-all duration-300">
            <Map />
          </section>
          <section id="battery" className="transition-all duration-300">
            <BatteryStatus />
          </section>
          <section id="trips" className="transition-all duration-300">
            <TripHistory />
          </section>
          <section id="profile" className="transition-all duration-300">
            <Profile />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;