import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="text-center text-gray-100 max-w-4xl mx-auto bg-black/50 p-12 rounded-2xl shadow-2xl border border-purple-900/30">
        <h1 className="text-6xl font-bold mb-8 tracking-wide bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
          EV Prediction
        </h1>
        <p className="text-2xl mb-10 font-medium text-gray-300 max-w-2xl mx-auto">
          Empower your electric vehicle experience with cutting-edge route optimization and battery analytics.
        </p>
        <div className="flex justify-center gap-8">
          <Link
            to="/login"
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 px-10 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg uppercase font-semibold text-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-4 px-10 rounded-lg hover:from-gray-800 hover:to-black transition-all duration-300 shadow-lg uppercase font-semibold text-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;