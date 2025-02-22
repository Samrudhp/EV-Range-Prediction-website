import React from "react";

export default  Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-4 text-center mt-10">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} EV Range Prediction & Route Optimization. All rights reserved.
      </p>
      <p className="text-xs mt-1">
        Built with ❤️ using Next.js, Tailwind CSS & OpenRouter API.
      </p>
    </footer>
  );
};


