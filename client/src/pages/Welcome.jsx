import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
      <div className="text-center text-white p-8 rounded-lg shadow-lg bg-opacity-80 bg-gray-800">
        <h1 className="text-5xl font-bold mb-4">EV Prediction</h1>
        <p className="text-xl mb-6">Optimize your electric vehicle journeys with smart route planning and battery tracking.</p>
        <div className="space-x-4">
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full">
            Login
          </Link>
          <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;