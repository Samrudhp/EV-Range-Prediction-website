"""
RAG Query System - Handles queries to both Global and Personal RAG
"""

import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Any
import json
from datetime import datetime

class RAGQuerySystem:
    """Manages queries to dual RAG system"""
    
    def __init__(self):
        """Initialize RAG system"""
        print("📚 Initializing RAG Query System...")
        
        # Load embedding model
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Connect to ChromaDB
        self.client = chromadb.PersistentClient(path="./chroma_db")
        
        # Get collections
        self.global_rag = self.client.get_collection("global_trip_knowledge")
        self.personal_rag = self.client.get_collection("personal_driving_patterns")
        
        print(f"   Global RAG: {self.global_rag.count()} trips")
        print(f"   Personal RAG: {self.personal_rag.count()} users")
        print("✅ RAG System ready!")
    
    def query_global(self, query: str, n_results: int = 5) -> Dict[str, Any]:
        """Query global trip knowledge"""
        
        query_embedding = self.embedder.encode(query)
        
        results = self.global_rag.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results
        )
        
        return {
            "documents": results["documents"][0],
            "metadatas": results["metadatas"][0],
            "distances": results["distances"][0]
        }
    
    def query_personal(self, user_id: str, query: str, n_results: int = 3) -> Dict[str, Any]:
        """Query personal driving patterns for specific user"""
        
        query_embedding = self.embedder.encode(query)
        
        results = self.personal_rag.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
            where={"user_id": user_id}
        )
        
        return {
            "documents": results["documents"][0] if results["documents"][0] else [],
            "metadatas": results["metadatas"][0] if results["metadatas"][0] else [],
            "distances": results["distances"][0] if results["distances"][0] else []
        }
    
    def query_both(self, user_id: str, query: str) -> Dict[str, Any]:
        """Query both RAG systems and combine results"""
        
        global_results = self.query_global(query, n_results=5)
        personal_results = self.query_personal(user_id, query, n_results=3)
        
        return {
            "global": global_results,
            "personal": personal_results
        }
    
    def find_similar_trips(self, start: str, end: str, n_results: int = 5) -> List[Dict]:
        """Find similar trips in global RAG"""
        
        query = f"trip from {start} to {end}"
        results = self.query_global(query, n_results)
        
        # Filter for actual matching routes
        similar_trips = []
        for metadata in results["metadatas"]:
            if (metadata["start_location"].lower() == start.lower() and 
                metadata["end_location"].lower() == end.lower()):
                similar_trips.append(metadata)
        
        return similar_trips
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user's driving profile from personal RAG"""
        
        try:
            results = self.personal_rag.get(
                ids=[f"profile_{user_id}"]
            )
            
            if results["metadatas"]:
                return results["metadatas"][0]
            return None
        
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    def add_user_trip(self, user_id: str, trip_data: Dict):
        """Add new trip to user's personal RAG (maintains last 10 trips)"""
        
        # TODO: Implement sliding window of last 10 trips
        # For now, this is a placeholder
        print(f"Adding trip for {user_id}")
    
    def get_popular_routes(self, limit: int = 10) -> List[Dict]:
        """Get most popular routes from global data"""
        
        # Get all trips (limited sample)
        results = self.global_rag.get(limit=1000)
        
        # Count route frequencies
        route_counts = {}
        for metadata in results["metadatas"]:
            route_key = f"{metadata['start_location']} → {metadata['end_location']}"
            
            if route_key not in route_counts:
                route_counts[route_key] = {
                    "route": route_key,
                    "from": metadata["start_location"],
                    "to": metadata["end_location"],
                    "count": 0,
                    "avg_distance": 0,
                    "avg_efficiency": 0,
                    "distances": [],
                    "efficiencies": []
                }
            
            route_counts[route_key]["count"] += 1
            route_counts[route_key]["distances"].append(metadata["distance_km"])
            route_counts[route_key]["efficiencies"].append(metadata["efficiency_kwh_per_100km"])
        
        # Calculate averages
        for route in route_counts.values():
            route["avg_distance"] = sum(route["distances"]) / len(route["distances"])
            route["avg_efficiency"] = sum(route["efficiencies"]) / len(route["efficiencies"])
            del route["distances"]
            del route["efficiencies"]
        
        # Sort by popularity
        popular_routes = sorted(
            route_counts.values(),
            key=lambda x: x["count"],
            reverse=True
        )[:limit]
        
        return popular_routes
    
    def get_global_stats(self) -> Dict:
        """Get statistics from global RAG"""
        
        total_trips = self.global_rag.count()
        
        # Sample trips for statistics
        sample = self.global_rag.get(limit=500)
        
        if not sample["metadatas"]:
            return {"total_trips": 0}
        
        efficiencies = [m["efficiency_kwh_per_100km"] for m in sample["metadatas"]]
        distances = [m["distance_km"] for m in sample["metadatas"]]
        
        return {
            "total_trips": total_trips,
            "total_users": self.personal_rag.count(),
            "avg_efficiency": sum(efficiencies) / len(efficiencies),
            "avg_distance": sum(distances) / len(distances),
            "most_efficient": min(efficiencies),
            "least_efficient": max(efficiencies)
        }
