import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Stars, 
  Line,
  Text,
  Billboard,
  Float
} from '@react-three/drei';
import * as THREE from 'three';

// Charging Station Marker Component
function ChargingStation({ position, name, available, onClick }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Marker pole */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial 
          color={available ? "#10b981" : "#ef4444"}
          emissive={available ? "#10b981" : "#ef4444"}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Marker head */}
      <mesh 
        ref={meshRef}
        position={[0, 1.2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={available ? "#10b981" : "#ef4444"}
          emissive={available ? "#10b981" : "#ef4444"}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>
      
      {/* Label */}
      {hovered && (
        <Billboard position={[0, 2, 0]}>
          <Text
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="black"
          >
            {name}
          </Text>
        </Billboard>
      )}
      
      {/* Pulsing ring */}
      {available && <PulsingRing position={[0, 1.2, 0]} color="#10b981" />}
    </group>
  );
}

// Pulsing Ring Effect
function PulsingRing({ position, color }) {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
    meshRef.current.scale.set(scale, 1, scale);
    meshRef.current.material.opacity = 0.5 - Math.sin(clock.getElapsedTime() * 2) * 0.3;
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.2, 0.3, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Animated Route Path
function RoutePath({ points, color = "#3b82f6", animated = true }) {
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    if (animated && progress < 1) {
      setProgress(prev => Math.min(prev + 0.005, 1));
    }
  });

  const visiblePoints = animated 
    ? points.slice(0, Math.floor(points.length * progress))
    : points;

  if (visiblePoints.length < 2) return null;

  return (
    <>
      {/* Main route line */}
      <Line
        points={visiblePoints}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.8}
      />
      
      {/* Glowing effect */}
      <Line
        points={visiblePoints}
        color={color}
        lineWidth={6}
        transparent
        opacity={0.2}
      />
      
      {/* Moving particle */}
      {animated && progress > 0 && progress < 1 && (
        <MovingParticle 
          points={points} 
          progress={progress} 
          color={color}
        />
      )}
    </>
  );
}

// Moving Particle along route
function MovingParticle({ points, progress, color }) {
  const particleRef = useRef();
  
  useFrame(() => {
    const index = Math.floor((points.length - 1) * progress);
    if (particleRef.current && points[index]) {
      particleRef.current.position.set(...points[index]);
    }
  });
  
  return (
    <Float speed={2} rotationIntensity={0.5}>
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={1}
        />
      </mesh>
    </Float>
  );
}

// Terrain/Ground Plane
function Terrain() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.1, 0]}
      receiveShadow
    >
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshStandardMaterial 
        color="#1a1a2e"
        wireframe={false}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

// Grid Helper
function GridHelper() {
  return (
    <gridHelper 
      args={[100, 50, "#6366f1", "#1e293b"]} 
      position={[0, 0, 0]}
    />
  );
}

// Current Location Marker
function CurrentLocationMarker({ position }) {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime();
  });
  
  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.3}>
        <mesh ref={meshRef} position={[0, 0.5, 0]}>
          <coneGeometry args={[0.3, 0.8, 4]} />
          <meshStandardMaterial 
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
      
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial 
          color="#f59e0b"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Main 3D Scene
function Scene({ routeData, chargingStations, currentLocation, onStationClick }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={0.5} castShadow />
      <spotLight position={[0, 15, 0]} angle={0.3} intensity={0.5} />
      
      {/* Stars background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      {/* Terrain */}
      <Terrain />
      <GridHelper />
      
      {/* Current location */}
      {currentLocation && (
        <CurrentLocationMarker position={currentLocation} />
      )}
      
      {/* Route paths */}
      {routeData && routeData.routes && routeData.routes.map((route, index) => (
        <RoutePath 
          key={`route-${index}`}
          points={route.points}
          color={route.color || "#3b82f6"}
          animated={route.animated !== false}
        />
      ))}
      
      {/* Charging stations */}
      {chargingStations && chargingStations.map((station, index) => (
        <ChargingStation
          key={`station-${index}`}
          position={station.position}
          name={station.name}
          available={station.available}
          onClick={() => onStationClick && onStationClick(station)}
        />
      ))}
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
      
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={60} />
    </>
  );
}

// Main Map3D Component Export
export default function Map3D({ 
  routeData, 
  chargingStations = [],
  currentLocation,
  height = "700px",
  className = "",
  onStationClick
}) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading 3D Map...</p>
          </div>
        </div>
      )}
      
      <div className={`w-full h-full rounded-xl overflow-hidden shadow-2xl ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <Scene 
            routeData={routeData}
            chargingStations={chargingStations}
            currentLocation={currentLocation}
            onStationClick={onStationClick}
          />
        </Canvas>
      </div>
      
      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
        <p className="font-semibold mb-1">Controls:</p>
        <p>🖱️ Left Click + Drag: Rotate</p>
        <p>🖱️ Right Click + Drag: Pan</p>
        <p>🖱️ Scroll: Zoom</p>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-sm space-y-2">
        <p className="font-semibold mb-2">Legend:</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Route Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Available Charger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Busy Charger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span>Current Location</span>
        </div>
      </div>
    </div>
  );
}
