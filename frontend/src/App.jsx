import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FloatingNavbar from './components/FloatingNavbar';
import Home from './pages/Home';
import AIAssistant from './pages/AIAssistant';
import MapPage from './pages/MapPage';
import ChargingPage from './pages/ChargingPage';

function App() {
  return (
    <Router>
      <FloatingNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/charging" element={<ChargingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
