import Navbar from "../components/Navbar";
import Map from "../components/Map";
import BatteryStatus from "../components/BatteryStatus";
import TripHistory from "../components/TripHistory";
import Profile from "../components/Profile";

const Dashboard = () => {
  return (
    <div className="flex">
      <Navbar />
      <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-black">Dashboard</h1>
        <div className="space-y-8">
          <div id ='map'><Map /></div>
          <BatteryStatus />
          <TripHistory />
          <Profile />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;