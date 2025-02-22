export default function TripCard({ trip }) {
    return (
      <div className="border p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">{trip.start} → {trip.end}</h3>
        <p className="text-gray-500">Distance: {trip.distance} km</p>
        <p className="text-gray-500">Battery Used: {trip.batteryUsage}%</p>
      </div>
    );
  }
  