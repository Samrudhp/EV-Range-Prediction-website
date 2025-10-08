"""
Generate realistic synthetic EV trip dataset for 100 users
This will create comprehensive trip data to feed into the Global RAG system
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict
import numpy as np

# Indian cities and popular EV routes
CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", 
    "Kolkata", "Ahmedabad", "Goa", "Jaipur", "Kochi", "Guwahati",
    "Chandigarh", "Lucknow", "Indore", "Nagpur", "Coimbatore", "Mysore"
]

# Popular routes with realistic distances and elevations
ROUTES = [
    {"from": "Mumbai", "to": "Pune", "distance": 150, "elevation": 550, "highway": True},
    {"from": "Mumbai", "to": "Goa", "distance": 580, "elevation": 150, "highway": True},
    {"from": "Delhi", "to": "Jaipur", "distance": 280, "elevation": 100, "highway": True},
    {"from": "Bangalore", "to": "Mysore", "distance": 145, "elevation": -50, "highway": True},
    {"from": "Bangalore", "to": "Chennai", "distance": 350, "elevation": 50, "highway": True},
    {"from": "Pune", "to": "Goa", "distance": 450, "elevation": 200, "highway": True},
    {"from": "Delhi", "to": "Chandigarh", "distance": 250, "elevation": 200, "highway": True},
    {"from": "Hyderabad", "to": "Bangalore", "distance": 570, "elevation": 300, "highway": True},
    {"from": "Chennai", "to": "Kochi", "distance": 680, "elevation": 100, "highway": True},
    {"from": "Mumbai", "to": "Ahmedabad", "distance": 530, "elevation": 80, "highway": True},
]

# EV models with realistic specs
EV_MODELS = [
    {"name": "Tata Nexon EV", "battery_capacity": 30.2, "efficiency": 14.5, "price_range": "low"},
    {"name": "MG ZS EV", "battery_capacity": 44.5, "efficiency": 15.8, "price_range": "mid"},
    {"name": "Hyundai Kona", "battery_capacity": 39.2, "efficiency": 15.2, "price_range": "mid"},
    {"name": "BYD Atto 3", "battery_capacity": 60.5, "efficiency": 16.1, "price_range": "mid"},
    {"name": "Tesla Model 3", "battery_capacity": 75.0, "efficiency": 14.0, "price_range": "high"},
    {"name": "Mercedes EQC", "battery_capacity": 80.0, "efficiency": 17.5, "price_range": "high"},
]

# Driving styles
DRIVING_STYLES = {
    "eco": {"accel": 1.5, "speed_factor": 0.9, "regen_usage": 0.95, "efficiency_bonus": 0.85},
    "normal": {"accel": 2.2, "speed_factor": 1.0, "regen_usage": 0.80, "efficiency_bonus": 1.0},
    "aggressive": {"accel": 3.5, "speed_factor": 1.15, "regen_usage": 0.60, "efficiency_bonus": 1.20},
    "sporty": {"accel": 3.0, "speed_factor": 1.10, "regen_usage": 0.70, "efficiency_bonus": 1.15},
}

# Weather conditions
WEATHER_CONDITIONS = [
    {"type": "sunny", "temp": 28, "impact": 1.0},
    {"type": "hot", "temp": 38, "impact": 1.12},
    {"type": "cold", "temp": 8, "impact": 1.25},
    {"type": "rainy", "temp": 24, "impact": 1.08},
    {"type": "pleasant", "temp": 22, "impact": 0.98},
]

# Traffic patterns
TRAFFIC_PATTERNS = {
    "light": {"delay_mins": 5, "impact": 1.02},
    "moderate": {"delay_mins": 20, "impact": 1.08},
    "heavy": {"delay_mins": 45, "impact": 1.15},
}

# Charging networks
CHARGING_NETWORKS = [
    "Tata Power", "Ather Grid", "Shell Recharge", "Exicom", "Fortum", "BPCL"
]


def generate_user_profile(user_id: int) -> Dict:
    """Generate a realistic user profile"""
    
    # Select EV model (weighted towards mid-range)
    weights = [0.25, 0.20, 0.20, 0.15, 0.15, 0.05]
    ev_model = random.choices(EV_MODELS, weights=weights)[0]
    
    # Select driving style (weighted towards normal)
    style_weights = {"eco": 0.25, "normal": 0.50, "aggressive": 0.15, "sporty": 0.10}
    driving_style = random.choices(list(DRIVING_STYLES.keys()), 
                                   weights=list(style_weights.values()))[0]
    
    # Home city
    home_city = random.choice(CITIES)
    
    # Battery health (degrades over time)
    age_months = random.randint(1, 60)
    battery_health = max(75, 100 - (age_months * 0.4) + random.uniform(-5, 5))
    
    return {
        "user_id": f"user_{user_id:03d}",
        "name": f"User {user_id}",
        "ev_model": ev_model["name"],
        "battery_capacity": ev_model["battery_capacity"],
        "base_efficiency": ev_model["efficiency"],
        "home_city": home_city,
        "driving_style": driving_style,
        "driving_stats": DRIVING_STYLES[driving_style],
        "battery_health": round(battery_health, 1),
        "age_months": age_months,
        "total_trips": 0,
        "total_distance": 0,
        "preferred_charge_level": random.choice([80, 85, 90, 100]),
    }


def generate_trip(user: Dict, trip_num: int) -> Dict:
    """Generate a realistic trip for a user"""
    
    # Select route (prefer routes from home city, but allow random trips)
    if random.random() < 0.6:  # 60% from home city
        home_routes = [r for r in ROUTES if r["from"] == user["home_city"]]
        if home_routes:
            route = random.choice(home_routes)
        else:
            route = random.choice(ROUTES)
    else:
        route = random.choice(ROUTES)
    
    # Sometimes reverse the route
    if random.random() < 0.3:
        route = {
            "from": route["to"],
            "to": route["from"],
            "distance": route["distance"],
            "elevation": -route["elevation"],
            "highway": route["highway"]
        }
    
    # Random date in last 6 months
    days_ago = random.randint(0, 180)
    trip_date = datetime.now() - timedelta(days=days_ago)
    
    # Weather (seasonal variation)
    month = trip_date.month
    if month in [12, 1, 2]:  # Winter
        weather = random.choice([w for w in WEATHER_CONDITIONS if w["temp"] < 20])
    elif month in [4, 5, 6]:  # Summer
        weather = random.choice([w for w in WEATHER_CONDITIONS if w["temp"] > 25])
    else:
        weather = random.choice(WEATHER_CONDITIONS)
    
    # Traffic (time-dependent)
    hour = random.randint(6, 22)
    if hour in [8, 9, 18, 19]:  # Rush hour
        traffic = random.choices(["moderate", "heavy"], weights=[0.4, 0.6])[0]
    elif hour in [10, 11, 12, 13, 14, 15, 16, 17]:  # Daytime
        traffic = random.choices(["light", "moderate"], weights=[0.3, 0.7])[0]
    else:  # Off-peak
        traffic = "light"
    
    traffic_data = TRAFFIC_PATTERNS[traffic]
    
    # Calculate energy consumption
    base_consumption = user["base_efficiency"] * (route["distance"] / 100)
    
    # Apply various factors
    style_factor = user["driving_stats"]["efficiency_bonus"]
    weather_factor = weather["impact"]
    traffic_factor = traffic_data["impact"]
    battery_health_factor = user["battery_health"] / 100
    elevation_factor = 1 + (abs(route["elevation"]) / 1000)
    
    energy_used = base_consumption * style_factor * weather_factor * traffic_factor * elevation_factor
    energy_used = round(energy_used * random.uniform(0.95, 1.05), 2)  # Add some randomness
    
    # Calculate actual efficiency
    efficiency = round((energy_used / route["distance"]) * 100, 2)
    
    # Starting battery
    start_battery = random.randint(60, 100)
    
    # Ending battery
    energy_percent = (energy_used / user["battery_capacity"]) * 100
    end_battery = max(5, start_battery - energy_percent)
    
    # Charging stops (if needed)
    charging_stops = []
    if end_battery < 20:
        num_stops = random.randint(1, 2)
        for i in range(num_stops):
            stop_distance = random.randint(150, 300)
            charging_stops.append({
                "location": f"Station at {stop_distance}km",
                "network": random.choice(CHARGING_NETWORKS),
                "power_kw": random.choice([50, 120, 150, 240]),
                "duration_mins": random.randint(20, 45),
                "cost": random.randint(300, 800),
                "charge_added": random.randint(30, 60)
            })
    
    # Trip duration
    base_duration_hours = route["distance"] / (90 * user["driving_stats"]["speed_factor"])
    actual_duration = base_duration_hours + (traffic_data["delay_mins"] / 60)
    if charging_stops:
        actual_duration += sum(s["duration_mins"] for s in charging_stops) / 60
    
    return {
        "trip_id": f"{user['user_id']}_trip_{trip_num:04d}",
        "user_id": user["user_id"],
        "date": trip_date.isoformat(),
        "start_location": route["from"],
        "end_location": route["to"],
        "distance_km": route["distance"],
        "elevation_change_m": route["elevation"],
        "is_highway": route["highway"],
        
        # Energy data
        "start_battery_percent": round(start_battery, 1),
        "end_battery_percent": round(end_battery, 1),
        "energy_used_kwh": energy_used,
        "efficiency_kwh_per_100km": efficiency,
        
        # Conditions
        "weather": weather["type"],
        "temperature_c": weather["temp"],
        "traffic": traffic,
        "traffic_delay_mins": traffic_data["delay_mins"],
        
        # Timing
        "start_time": f"{hour:02d}:00",
        "duration_hours": round(actual_duration, 2),
        "avg_speed_kmh": round(route["distance"] / actual_duration, 1),
        
        # Charging
        "charging_stops": charging_stops,
        "num_charging_stops": len(charging_stops),
        
        # Driving metrics
        "avg_acceleration": user["driving_stats"]["accel"],
        "regen_braking_usage": user["driving_stats"]["regen_usage"],
        "driving_style": user["driving_style"],
        
        # Cost
        "electricity_cost": round(energy_used * 10, 2),  # ₹10 per kWh avg
    }


def generate_complete_dataset():
    """Generate complete dataset with 100 users and their trips"""
    
    print("🚗 Generating EV Dataset for 100 Users...")
    print("=" * 60)
    
    all_users = []
    all_trips = []
    
    # Generate 100 users
    for user_id in range(1, 101):
        user = generate_user_profile(user_id)
        
        # Each user has between 5-50 trips
        num_trips = random.randint(5, 50)
        user_trips = []
        
        for trip_num in range(num_trips):
            trip = generate_trip(user, trip_num)
            user_trips.append(trip)
            all_trips.append(trip)
        
        # Update user stats
        user["total_trips"] = len(user_trips)
        user["total_distance"] = sum(t["distance_km"] for t in user_trips)
        user["avg_efficiency"] = round(np.mean([t["efficiency_kwh_per_100km"] for t in user_trips]), 2)
        user["total_energy_used"] = round(sum(t["energy_used_kwh"] for t in user_trips), 2)
        
        all_users.append(user)
        
        if user_id % 10 == 0:
            print(f"✅ Generated {user_id} users with {len(all_trips)} total trips")
    
    print("\n" + "=" * 60)
    print(f"📊 Dataset Summary:")
    print(f"   Total Users: {len(all_users)}")
    print(f"   Total Trips: {len(all_trips)}")
    print(f"   Avg Trips/User: {len(all_trips) / len(all_users):.1f}")
    print(f"   Total Distance: {sum(u['total_distance'] for u in all_users):,.0f} km")
    print("=" * 60)
    
    # Save to files
    with open("data/dataset_users.json", "w") as f:
        json.dump(all_users, f, indent=2)
    
    with open("data/dataset_trips.json", "w") as f:
        json.dump(all_trips, f, indent=2)
    
    print("\n✅ Saved to:")
    print("   - data/dataset_users.json")
    print("   - data/dataset_trips.json")
    
    # Generate some statistics
    print("\n📈 Dataset Statistics:")
    print(f"   EV Models:")
    for model in EV_MODELS:
        count = len([u for u in all_users if u["ev_model"] == model["name"]])
        print(f"      {model['name']}: {count} users")
    
    print(f"\n   Driving Styles:")
    for style in DRIVING_STYLES.keys():
        count = len([u for u in all_users if u["driving_style"] == style])
        print(f"      {style.capitalize()}: {count} users")
    
    print(f"\n   Popular Routes:")
    route_counts = {}
    for trip in all_trips:
        route_key = f"{trip['start_location']} → {trip['end_location']}"
        route_counts[route_key] = route_counts.get(route_key, 0) + 1
    
    for route, count in sorted(route_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"      {route}: {count} trips")
    
    return all_users, all_trips


if __name__ == "__main__":
    users, trips = generate_complete_dataset()
    print("\n🎉 Dataset generation complete!")
