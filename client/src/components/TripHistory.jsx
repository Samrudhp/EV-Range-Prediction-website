import { useState, useEffect } from "react";
import { getTrips, addTrip } from "../api";
import { toast } from "react-toastify";

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ startLocation: "", endLocation: "", distance: "", duration: "", energyUsed: "" });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await getTrips();
        setTrips(data);
      } catch (error) {
        console.error("Trips fetch failed");
      }
    };
    fetchTrips();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const { data } = await addTrip(form);
        setTrips([data, ...trips]);
        toast.success("Trip added successfully!");
      } catch (error) {
        toast.error("Trip add failed: " + error.response?.data?.message);
      }
  };

  return (
    <div id="trips" className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-black">Trip History</h3>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          value={form.startLocation}
          onChange={(e) => setForm({ ...form, startLocation: e.target.value })}
          placeholder="Start Location"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={form.endLocation}
          onChange={(e) => setForm({ ...form, endLocation: e.target.value })}
          placeholder="End Location"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={form.distance}
          onChange={(e) => setForm({ ...form, distance: e.target.value })}
          placeholder="Distance (km)"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          placeholder="Duration (min)"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={form.energyUsed}
          onChange={(e) => setForm({ ...form, energyUsed: e.target.value })}
          placeholder="Energy Used (kWh)"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Add Trip
        </button>
      </form>
      <div className="text-black">
        {trips.length ? (
          trips.map((trip) => (
            <div key={trip._id} className="border-b py-2">
              <p>{trip.startLocation} to {trip.endLocation}</p>
              <p>Distance: {trip.distance} km, Energy: {trip.energyUsed} kWh</p>
            </div>
          ))
        ) : (
          <p>No trips yet</p>
        )}
      </div>
    </div>
  );
};

export default TripHistory;