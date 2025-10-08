import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRobot, FaMap, FaChartLine, FaBolt, FaArrowRight } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: FaRobot,
      title: 'AI-Powered Insights',
      description: 'Ask anything about your EV range, routes, and efficiency',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.2
    },
    {
      icon: FaMap,
      title: '3D Route Visualization',
      description: 'Interactive 3D maps with charging stations and terrain',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.4
    },
    {
      icon: FaChartLine,
      title: 'Smart Analytics',
      description: 'Learn from 2,900+ trips and 100+ EV drivers',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.6
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        
        {/* Floating Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/25 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 backdrop-blur-xl bg-white/60 border-2 border-blue-200/50 rounded-full shadow-lg"
          >
            <FaBolt className="text-yellow-500 text-sm" />
            <span className="text-sm text-gray-700 font-medium">Powered by Local AI • 100% Private</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Electric Vehicle
            </span>
            <br />
            <span className="text-gray-800">Range Prediction</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-powered insights for your EV journey. Get accurate range predictions, 
            optimal routes, and charging recommendations based on real-world data.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/ai">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 flex items-center gap-3"
              >
                <FaRobot className="text-xl" />
                <span>Try AI Assistant</span>
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link to="/map">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 backdrop-blur-xl bg-white/60 border-2 border-blue-200/50 text-gray-700 font-bold rounded-2xl hover:bg-white/80 transition-all duration-300 flex items-center gap-3 shadow-lg"
              >
                <FaMap className="text-xl" />
                <span>Explore 3D Map</span>
              </motion.button>
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: '2,917', label: 'Trip Records' },
              { value: '100+', label: 'EV Drivers' },
              { value: '99%', label: 'Accuracy' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-20 group-hover:opacity-40 blur-xl transition-all duration-500`}></div>
                
                {/* Card */}
                <div className="relative backdrop-blur-xl bg-white/60 border-2 border-blue-100/50 rounded-3xl p-8 hover:bg-white/70 transition-all duration-500 shadow-lg">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tech Stack Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-32 text-center"
        >
          <p className="text-gray-500 text-sm font-medium mb-4">POWERED BY</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Three.js', 'FastAPI', 'ChromaDB', 'GPT4All'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 backdrop-blur-xl bg-white/60 border-2 border-blue-100/50 rounded-xl text-gray-700 text-sm font-medium shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
