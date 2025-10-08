import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaRoute, FaChartLine, FaUser, FaRobot, FaMap } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const FloatingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'ai-query', label: 'AI Assistant', icon: <FaRobot />, path: '/dashboard' },
    { id: '3d-map', label: '3D Map', icon: <FaMap />, path: '/map' },
    { id: 'range', label: 'Range Prediction', icon: <FaBolt />, path: '/range' },
    { id: 'routes', label: 'Routes', icon: <FaRoute />, path: '/routes' },
    { id: 'analytics', label: 'Analytics', icon: <FaChartLine />, path: '/analytics' },
    { id: 'profile', label: 'Profile', icon: <FaUser />, path: '/profile' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled ? 'w-auto' : 'w-[90%] max-w-6xl'
      }`}
    >
      {/* Glassmorphism container */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full opacity-30 blur-xl animate-pulse"></div>
        
        {/* Main nav */}
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-8 py-4 shadow-2xl">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <FaBolt className="text-white text-xl" />
              </div>
              <span className="text-white font-bold text-xl hidden sm:block group-hover:text-purple-300 transition-colors">
                EV Range AI
              </span>
            </Link>

            {/* Nav items */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                  </motion.div>
                  
                  {/* Active indicator */}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* User avatar */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer"
            >
              <FaUser className="text-white text-sm" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default FloatingNavbar;
