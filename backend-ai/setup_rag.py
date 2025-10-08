"""
Dual RAG System Setup
- RAG 1: Global knowledge from 100 users (2917 trips)
- RAG 2: Personal driving patterns (last 10 trips per user)
"""

import json
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict
import os

# Initialize embedding model (local, no API needed)
print("📦 Loading embedding model from cache...")
embedder = SentenceTransformer(
    'all-MiniLM-L6-v2',  # 384 dimensions, fast
    cache_folder=None  # Uses default cache: ~/.cache/torch/sentence_transformers/
)
print("✅ Embedding model loaded from cache!")
print(f"   Cache location: ~/.cache/torch/sentence_transformers/")

# Initialize ChromaDB client
client = chromadb.PersistentClient(path="./chroma_db")

# Create collections
print("\n🗄️  Creating vector databases...")

# RAG 1: Global Trip Knowledge (all users)
global_collection = client.get_or_create_collection(
    name="global_trip_knowledge",
    metadata={"description": "Trip data from 100 users for community insights"}
)

# RAG 2: Personal Driving Patterns (per user, last 10 trips)
personal_collection = client.get_or_create_collection(
    name="personal_driving_patterns",
    metadata={"description": "Individual user's last 10 trips for personalization"}
)

print("✅ Collections created!")


def load_datasets():
    """Load generated datasets"""
    print("\n📂 Loading datasets...")
    
    with open("data/dataset_users.json", "r") as f:
        users = json.load(f)
    
    with open("data/dataset_trips.json", "r") as f:
        trips = json.load(f)
    
    print(f"   Loaded {len(users)} users and {len(trips)} trips")
    return users, trips


def create_trip_text(trip: Dict) -> str:
    """Convert trip data to searchable text"""
    
    charging_info = ""
    if trip["num_charging_stops"] > 0:
        stops = trip["charging_stops"]
        charging_info = f"Charging stops: {len(stops)}. "
        for stop in stops:
            charging_info += f"{stop['network']} {stop['power_kw']}kW for {stop['duration_mins']}min, "
    
    text = f"""
Trip from {trip['start_location']} to {trip['end_location']}.
Distance: {trip['distance_km']}km, Elevation: {trip['elevation_change_m']}m.
Energy used: {trip['energy_used_kwh']}kWh, Efficiency: {trip['efficiency_kwh_per_100km']}kWh/100km.
Weather: {trip['weather']}, Temperature: {trip['temperature_c']}°C.
Traffic: {trip['traffic']}, Delay: {trip['traffic_delay_mins']} minutes.
Driving style: {trip['driving_style']}, Average speed: {trip['avg_speed_kmh']}km/h.
Battery: Started at {trip['start_battery_percent']}%, ended at {trip['end_battery_percent']}%.
{charging_info}
Trip duration: {trip['duration_hours']} hours.
    """.strip()
    
    return text


def populate_global_rag(trips: List[Dict]):
    """Populate RAG 1 with all trip data"""
    
    print("\n🌍 Populating Global RAG (RAG 1)...")
    print("   This may take a few minutes...")
    
    batch_size = 100
    total_batches = (len(trips) + batch_size - 1) // batch_size
    
    for i in range(0, len(trips), batch_size):
        batch = trips[i:i + batch_size]
        
        # Convert trips to text
        texts = [create_trip_text(trip) for trip in batch]
        
        # Generate embeddings
        embeddings = embedder.encode(texts, show_progress_bar=False)
        
        # Add to collection
        global_collection.add(
            documents=texts,
            embeddings=embeddings.tolist(),
            metadatas=batch,
            ids=[trip["trip_id"] for trip in batch]
        )
        
        current_batch = i // batch_size + 1
        print(f"   Batch {current_batch}/{total_batches} complete ({len(batch)} trips)")
    
    print(f"✅ Global RAG populated with {len(trips)} trips!")


def create_user_pattern_text(user_id: str, trips: List[Dict]) -> str:
    """Create text summary of user's driving patterns"""
    
    avg_efficiency = sum(t["efficiency_kwh_per_100km"] for t in trips) / len(trips)
    avg_speed = sum(t["avg_speed_kmh"] for t in trips) / len(trips)
    total_distance = sum(t["distance_km"] for t in trips)
    
    # Common routes
    routes = {}
    for trip in trips:
        route_key = f"{trip['start_location']} to {trip['end_location']}"
        routes[route_key] = routes.get(route_key, 0) + 1
    
    common_route = max(routes.items(), key=lambda x: x[1])[0] if routes else "Various"
    
    # Driving style
    styles = [t["driving_style"] for t in trips]
    dominant_style = max(set(styles), key=styles.count)
    
    # Charging behavior
    total_stops = sum(t["num_charging_stops"] for t in trips)
    
    text = f"""
User {user_id}'s driving profile based on last {len(trips)} trips:
Average efficiency: {avg_efficiency:.2f} kWh/100km
Average speed: {avg_speed:.1f} km/h
Total distance: {total_distance} km
Most common route: {common_route}
Dominant driving style: {dominant_style}
Total charging stops: {total_stops}
Regenerative braking usage: {trips[0]['regen_braking_usage']*100:.0f}%

Recent trip patterns:
    """.strip()
    
    # Add last 3 trips summary
    for trip in trips[-3:]:
        text += f"\n- {trip['start_location']} to {trip['end_location']}: {trip['distance_km']}km, {trip['efficiency_kwh_per_100km']}kWh/100km"
    
    return text


def populate_personal_rag(users: List[Dict], all_trips: List[Dict]):
    """Populate RAG 2 with each user's last 10 trips"""
    
    print("\n👤 Populating Personal RAG (RAG 2)...")
    
    # Group trips by user
    user_trips = {}
    for trip in all_trips:
        user_id = trip["user_id"]
        if user_id not in user_trips:
            user_trips[user_id] = []
        user_trips[user_id].append(trip)
    
    # Sort trips by date and take last 10
    for user_id in user_trips:
        user_trips[user_id].sort(key=lambda x: x["date"], reverse=True)
        user_trips[user_id] = user_trips[user_id][:10]  # Last 10 trips
    
    # Add to personal RAG
    texts = []
    metadatas = []
    ids = []
    
    for user in users:
        user_id = user["user_id"]
        
        if user_id in user_trips and len(user_trips[user_id]) > 0:
            trips = user_trips[user_id]
            
            # Create pattern text
            pattern_text = create_user_pattern_text(user_id, trips)
            
            # Metadata includes user profile + trip summaries
            metadata = {
                "user_id": user_id,
                "ev_model": user["ev_model"],
                "driving_style": user["driving_style"],
                "battery_health": user["battery_health"],
                "avg_efficiency": user["avg_efficiency"],
                "num_trips_analyzed": len(trips),
                "recent_trips": [
                    {
                        "route": f"{t['start_location']}-{t['end_location']}",
                        "efficiency": t["efficiency_kwh_per_100km"],
                        "date": t["date"]
                    }
                    for t in trips[:5]  # Store last 5 in metadata
                ]
            }
            
            texts.append(pattern_text)
            metadatas.append(metadata)
            ids.append(f"profile_{user_id}")
    
    # Generate embeddings and add to collection
    print(f"   Generating embeddings for {len(texts)} user profiles...")
    embeddings = embedder.encode(texts, show_progress_bar=True)
    
    personal_collection.add(
        documents=texts,
        embeddings=embeddings.tolist(),
        metadatas=metadatas,
        ids=ids
    )
    
    print(f"✅ Personal RAG populated with {len(texts)} user profiles!")


def verify_rag_systems():
    """Test both RAG systems"""
    
    print("\n🧪 Testing RAG Systems...")
    
    # Test Global RAG
    test_query = "trips from Mumbai to Goa with good efficiency"
    print(f"\n   Test query for Global RAG: '{test_query}'")
    
    query_embedding = embedder.encode(test_query)
    results = global_collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=3
    )
    
    print(f"   ✅ Found {len(results['documents'][0])} similar trips")
    print(f"   Example: {results['metadatas'][0][0]['start_location']} → {results['metadatas'][0][0]['end_location']}")
    
    # Test Personal RAG
    test_user_query = "user with eco driving style"
    print(f"\n   Test query for Personal RAG: '{test_user_query}'")
    
    query_embedding = embedder.encode(test_user_query)
    results = personal_collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=3
    )
    
    print(f"   ✅ Found {len(results['documents'][0])} matching user profiles")
    print(f"   Example: {results['metadatas'][0][0]['user_id']} - {results['metadatas'][0][0]['driving_style']} driver")
    
    # Print statistics
    print(f"\n📊 RAG System Statistics:")
    print(f"   Global RAG: {global_collection.count()} trip records")
    print(f"   Personal RAG: {personal_collection.count()} user profiles")


def main():
    """Main setup function"""
    
    print("=" * 70)
    print("🚀 EV Range Prediction - Dual RAG System Setup")
    print("=" * 70)
    
    # Load datasets
    users, trips = load_datasets()
    
    # Check if already populated
    global_count = global_collection.count()
    personal_count = personal_collection.count()
    
    if global_count > 0:
        print(f"\n⚠️  Global RAG already has {global_count} records")
        response = input("   Clear and repopulate? (y/n): ")
        if response.lower() == 'y':
            client.delete_collection("global_trip_knowledge")
            client.delete_collection("personal_driving_patterns")
            global_collection = client.get_or_create_collection(name="global_trip_knowledge")
            personal_collection = client.get_or_create_collection(name="personal_driving_patterns")
        else:
            print("   Skipping population...")
            verify_rag_systems()
            return
    
    # Populate both RAG systems
    populate_global_rag(trips)
    populate_personal_rag(users, trips)
    
    # Verify everything works
    verify_rag_systems()
    
    print("\n" + "=" * 70)
    print("🎉 RAG System Setup Complete!")
    print("=" * 70)
    print("\nYou can now:")
    print("  1. Query Global RAG for community trip insights")
    print("  2. Query Personal RAG for individual user patterns")
    print("  3. Combine both for personalized range predictions")
    print("\n💡 Next: Run the FastAPI server with: uvicorn main:app --reload")


if __name__ == "__main__":
    main()
