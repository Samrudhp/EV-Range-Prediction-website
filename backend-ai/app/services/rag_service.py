"""
RAG Service - Manages dual RAG system queries
"""

import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Any
import json
from app.core.config import settings

class RAGService:
    """Manages queries to dual RAG system"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RAGService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        print("📚 Initializing RAG Service...")
        print("   Loading embedding model from cache...")
        
        # SentenceTransformer automatically uses cache directory (~/.cache/torch/sentence_transformers/)
        # It will reuse cached models if available
        self.embedder = SentenceTransformer(
            settings.EMBEDDING_MODEL,
            cache_folder=None  # Uses default cache: ~/.cache/torch/sentence_transformers/
        )
        print(f"   ✅ Embedding model loaded: {settings.EMBEDDING_MODEL}")
        
        # Connect to ChromaDB
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        
        # Get collections
        try:
            self.global_rag = self.client.get_collection("global_trip_knowledge")
            self.personal_rag = self.client.get_collection("personal_driving_patterns")
            
            print(f"   Global RAG: {self.global_rag.count()} trips")
            print(f"   Personal RAG: {self.personal_rag.count()} users")
            print("✅ RAG Service ready!")
        except Exception as e:
            print(f"⚠️  RAG collections not found. Run setup_rag.py first!")
            raise e
        
        self._initialized = True
    
    def query_global(self, query: str, n_results: int = 3) -> Dict[str, Any]:
        """Query global trip knowledge - OPTIMIZED: Reduced default from 5 to 3"""
        query_embedding = self.embedder.encode(query)
        
        results = self.global_rag.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results
        )
        
        # DEBUG: Print similarity scores
        print(f"🔎 RAG Search for: '{query}'")
        if results['distances'] and results['distances'][0]:
            for i, (doc, dist) in enumerate(zip(results['documents'][0][:3], results['distances'][0][:3])):
                similarity = 1 - dist  # Convert distance to similarity
                print(f"   Result {i+1}: Similarity={similarity:.3f}, Preview={doc[:100]}...")
        
        return {
            "documents": results["documents"][0],
            "metadatas": results["metadatas"][0],
            "distances": results["distances"][0]
        }
    
    def query_personal(self, user_id: str, query: str, n_results: int = 2) -> Dict[str, Any]:
        """Query personal driving patterns for specific user - OPTIMIZED: Reduced default from 3 to 2"""
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
        """Query both RAG systems and combine results - OPTIMIZED: Reduced results"""
        global_results = self.query_global(query, n_results=3)  # Reduced from 5
        personal_results = self.query_personal(user_id, query, n_results=2)  # Reduced from 3
        
        return {
            "global": global_results,
            "personal": personal_results
        }
    
    def find_similar_trips(self, start: str, end: str, n_results: int = 5) -> List[Dict]:
        """Find similar trips in global RAG"""
        query = f"trip from {start} to {end}"
        results = self.query_global(query, n_results)
        
        similar_trips = []
        for metadata in results["metadatas"]:
            if (metadata["start_location"].lower() == start.lower() and 
                metadata["end_location"].lower() == end.lower()):
                similar_trips.append(metadata)
        
        return similar_trips
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user's driving profile from personal RAG"""
        try:
            results = self.personal_rag.get(ids=[f"profile_{user_id}"])
            
            if results["metadatas"]:
                return results["metadatas"][0]
            return None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    def get_popular_routes(self, limit: int = 10) -> List[Dict]:
        """Get most popular routes from global data"""
        results = self.global_rag.get(limit=1000)
        
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
        
        for route in route_counts.values():
            route["avg_distance"] = round(sum(route["distances"]) / len(route["distances"]), 1)
            route["avg_efficiency"] = round(sum(route["efficiencies"]) / len(route["efficiencies"]), 2)
            del route["distances"]
            del route["efficiencies"]
        
        popular_routes = sorted(
            route_counts.values(),
            key=lambda x: x["count"],
            reverse=True
        )[:limit]
        
        return popular_routes
    
    def get_global_stats(self) -> Dict:
        """Get statistics from global RAG"""
        total_trips = self.global_rag.count()
        sample = self.global_rag.get(limit=500)
        
        if not sample["metadatas"]:
            return {"total_trips": 0}
        
        efficiencies = [m["efficiency_kwh_per_100km"] for m in sample["metadatas"]]
        distances = [m["distance_km"] for m in sample["metadatas"]]
        
        return {
            "total_trips": total_trips,
            "total_users": self.personal_rag.count(),
            "avg_efficiency": round(sum(efficiencies) / len(efficiencies), 2),
            "avg_distance": round(sum(distances) / len(distances), 1),
            "most_efficient": round(min(efficiencies), 2),
            "least_efficient": round(max(efficiencies), 2)
        }

# Singleton instance
rag_service = RAGService()
