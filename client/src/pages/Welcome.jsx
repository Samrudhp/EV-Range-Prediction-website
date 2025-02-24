import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center p-6">
      <div className="text-center text-white bg-black/20 p-10 rounded-2xl shadow-2xl backdrop-blur-md">
        <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
          Welcome to EV Prediction
        </h1>
        <p className="text-xl mb-8 max-w-md mx-auto">
          Optimize your electric vehicle journeys with smart route planning and battery insights.
        </p>
        <div className="flex justify-center gap-6">
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-8 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-8 rounded-full hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;