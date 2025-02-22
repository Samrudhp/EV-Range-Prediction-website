"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Map from '@/components/Map';

// Dynamically import Map component with loading state
const Map = dynamic(() => import("./Map"), { 
    ssr: false,
    loading: () => (
        <div className="animate-pulse bg-gray-200 rounded-lg h-[500px] w-full" />
    ),
});

export default function MapComponent({ 
    startLocation, 
    endLocation, 
    onLocationSelect, 
    routeData 
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLocationClick = (location) => {
        if (!startLocation) {
            onLocationSelect('start', location);
        } else if (!endLocation) {
            onLocationSelect('end', location);
        }
    };

    return (
        <div className="relative rounded-lg overflow-hidden shadow-lg bg-white">
            {/* Map Container */}
            <div className="h-[500px] w-full">
                <Map
                    startLocation={startLocation}
                    endLocation={endLocation}
                    onLocationClick={handleLocationClick}
                    route={routeData}
                />
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <p className="text-gray-700">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Instructions */}
            {!startLocation && (
                <div className="absolute top-4 left-4 right-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-blue-600 text-sm">Click on the map to set start location</p>
                </div>
            )}
            {startLocation && !endLocation && (
                <div className="absolute top-4 left-4 right-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-blue-600 text-sm">Click on the map to set destination</p>
                </div>
            )}
        </div>
    );
}
