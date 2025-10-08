import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaRobot, FaMap, FaBolt, FaChargingStation,
  FaBars, FaTimes 
} from 'react-icons/fa';

const FloatingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'AI Assistant', path: '/ai', icon: FaRobot },
    { name: '3D Map', path: '/map', icon: FaMap },
    { name: 'Charging', path: '/charging', icon: FaChargingStation },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6"
      >
        <div className={`w-full max-w-7xl backdrop-blur-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-purple-50/90 
                        border-2 border-blue-200/50 rounded-3xl shadow-2xl transition-all duration-500 ${
          scrolled ? 'shadow-blue-400/30' : 'shadow-indigo-300/40'
        }`}>
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <FaBolt className="text-white text-xl" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    EV Range AI
                  </h1>
                  <p className="text-xs text-gray-600">Powered by Intelligence</p>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-6 py-3 rounded-2xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-blue-100/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={isActive ? 'text-white' : 'text-gray-600'} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-2xl shadow-lg shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300"
              >
                Get Started
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-700 text-2xl"
              >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40 md:hidden"
          >
            <div className="backdrop-blur-xl bg-blue-50/95 border-2 border-blue-200/50 rounded-3xl shadow-2xl p-6">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : 'text-gray-700 hover:bg-blue-100/60'
                        }`}
                      >
                        <Icon className="text-xl" />
                        <span className="font-medium">{item.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingNavbar;
