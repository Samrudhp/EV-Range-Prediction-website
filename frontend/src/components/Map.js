"use client";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ 
    startLocation, 
    endLocation, 
    onLocationClick,
    route 
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        // Initialize map if it hasn't been initialized
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);

            // Add click handler
            mapInstanceRef.current.on('click', (e) => {
                onLocationClick([e.latlng.lat, e.latlng.lng]);
            });
        }

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers and route when locations change
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers and route
        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        // Add start marker
        if (startLocation) {
            L.marker(startLocation)
                .addTo(mapInstanceRef.current)
                .bindPopup('Start Location');
        }

        // Add end marker
        if (endLocation) {
            L.marker(endLocation)
                .addTo(mapInstanceRef.current)
                .bindPopup('End Location');
        }

        // Draw route if available
        if (route) {
            L.polyline(route.coordinates, { 
                color: 'blue',
                weight: 4,
                opacity: 0.7 
            }).addTo(mapInstanceRef.current);

            // Fit map bounds to show the entire route
            const bounds = L.latLngBounds(route.coordinates);
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [startLocation, endLocation, route]);

    return <div ref={mapRef} className="h-full w-full" />;
}