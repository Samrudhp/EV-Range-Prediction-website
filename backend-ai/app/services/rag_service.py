"""
RAG Service - Manages dual RAG system queries (OPTIMIZED)
"""

import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Any
import json
import re
from functools import lru_cache
from app.core.config import settings

class RAGService:
    """Manages queries to dual RAG system (OPTIMIZED for speed & accuracy)"""
    
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
        
        # 🚀 OPTIMIZATION: Query cache (last 50 queries)
        self._query_cache = {}
        self._cache_max_size = 50
        
        self._initialized = True
    
    def _extract_locations(self, query: str) -> tuple[Optional[str], Optional[str]]:
        """🚀 OPTIMIZATION: Extract start/end locations from query for precise filtering"""
        query_lower = query.lower()
        
        # Common patterns: "from X to Y", "X to Y", "reach Y from X"
        patterns = [
            r'from\s+([a-z\s]+?)\s+to\s+([a-z\s]+)',
            r'reach\s+([a-z\s]+?)\s+from\s+([a-z\s]+)',
            r'([a-z\s]+?)\s+to\s+([a-z\s]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, query_lower)
            if match:
                start = match.group(1).strip().title()
                end = match.group(2).strip().title()
                # Handle reversed order for "reach Y from X"
                if "reach" in pattern:
                    return end, start
                return start, end
        
        return None, None
    
    def query_global(self, query: str, n_results: int = 3) -> Dict[str, Any]:
        """🚀 OPTIMIZED: Query global trip knowledge with metadata filtering & caching"""
        
        # 🚀 OPTIMIZATION 1: Check cache first
        cache_key = f"global:{query}:{n_results}"
        if cache_key in self._query_cache:
            print(f"💨 Cache hit for: '{query}'")
            return self._query_cache[cache_key]
        
        # 🚀 OPTIMIZATION 2: Try metadata filtering first (MUCH faster than semantic search)
        start, end = self._extract_locations(query)
        
        if start and end:
            print(f"🎯 Using metadata filter: {start} → {end}")
            
            # Direct metadata query (instant, no embeddings needed)
            try:
                results = self.global_rag.query(
                    query_embeddings=[self.embedder.encode(query).tolist()],
                    n_results=n_results,
                    where={
                        "$and": [
                            {"start_location": {"$eq": start}},
                            {"end_location": {"$eq": end}}
                        ]
                    }
                )
                
                # If exact match found, return immediately
                if results['documents'][0]:
                    print(f"   ✅ Found {len(results['documents'][0])} exact matches")
                    result_dict = {
                        "documents": results["documents"][0],
                        "metadatas": results["metadatas"][0],
                        "distances": results["distances"][0]
                    }
                    self._cache_result(cache_key, result_dict)
                    self._print_results(query, results)
                    return result_dict
            except Exception as e:
                print(f"   ⚠️ Metadata filter failed, falling back to semantic search: {e}")
        
        # 🚀 OPTIMIZATION 3: Fallback to semantic search with similarity threshold
        query_embedding = self.embedder.encode(query)
        
        results = self.global_rag.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results * 2  # Get more, then filter by quality
        )
        
        # 🚀 OPTIMIZATION 4: Filter by similarity threshold (0.3 = 70% similar)
        SIMILARITY_THRESHOLD = 0.3
        filtered_docs = []
        filtered_meta = []
        filtered_dist = []
        
        if results['distances'] and results['distances'][0]:
            for doc, meta, dist in zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            ):
                if dist <= SIMILARITY_THRESHOLD:  # Lower distance = more similar
                    filtered_docs.append(doc)
                    filtered_meta.append(meta)
                    filtered_dist.append(dist)
                
                if len(filtered_docs) >= n_results:
                    break
        
        result_dict = {
            "documents": filtered_docs or results["documents"][0][:n_results],
            "metadatas": filtered_meta or results["metadatas"][0][:n_results],
            "distances": filtered_dist or results["distances"][0][:n_results]
        }
        
        self._cache_result(cache_key, result_dict)
        self._print_results(query, {"documents": [result_dict["documents"]], "distances": [result_dict["distances"]]})
        
        return result_dict
    
    def _cache_result(self, key: str, result: Dict):
        """Cache query result with LRU eviction"""
        if len(self._query_cache) >= self._cache_max_size:
            # Remove oldest entry
            self._query_cache.pop(next(iter(self._query_cache)))
        self._query_cache[key] = result
    
    def _print_results(self, query: str, results: Dict):
        """Print search results with similarity scores"""
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
    
    def query_personal(self, user_id: str, query: str, n_results: int = 1) -> Dict[str, Any]:
        """🚀 OPTIMIZED: Query personal patterns - reduced to 1 result (only need efficiency)"""
        
        # 🚀 OPTIMIZATION: Cache personal queries too
        cache_key = f"personal:{user_id}:{query}:{n_results}"
        if cache_key in self._query_cache:
            return self._query_cache[cache_key]
        
        query_embedding = self.embedder.encode(query)
        
        results = self.personal_rag.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
            where={"user_id": user_id}
        )
        
        result_dict = {
            "documents": results["documents"][0] if results["documents"][0] else [],
            "metadatas": results["metadatas"][0] if results["metadatas"][0] else [],
            "distances": results["distances"][0] if results["distances"][0] else []
        }
        
        self._cache_result(cache_key, result_dict)
        return result_dict
    
    def query_both(self, user_id: str, query: str) -> Dict[str, Any]:
        """🚀 OPTIMIZED: Query both RAG systems - reduced personal to 1 result"""
        global_results = self.query_global(query, n_results=3)
        personal_results = self.query_personal(user_id, query, n_results=1)  # Only need user efficiency
        
        return {
            "global": global_results,
            "personal": personal_results
        }
    
    def find_similar_trips(self, start: str, end: str, n_results: int = 5) -> List[Dict]:
        """🚀 OPTIMIZED: Find similar trips using metadata filter (much faster)"""
        
        # 🚀 OPTIMIZATION: Use metadata filter instead of semantic search
        try:
            results = self.global_rag.get(
                where={
                    "$and": [
                        {"start_location": {"$eq": start}},
                        {"end_location": {"$eq": end}}
                    ]
                },
                limit=n_results
            )
            
            if results["metadatas"]:
                print(f"🎯 Found {len(results['metadatas'])} exact trips: {start} → {end}")
                return results["metadatas"][:n_results]
        except Exception as e:
            print(f"   ⚠️ Metadata query failed: {e}")
        
        # Fallback to semantic search
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
