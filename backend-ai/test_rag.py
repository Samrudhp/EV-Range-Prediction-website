#!/usr/bin/env python3
"""
Quick test script to verify RAG is retrieving correct data
"""

import sys
sys.path.append('.')

from app.services.rag_service import rag_service

# Test queries
test_queries = [
    "charging stations between Bangalore and Chennai",
    "trip from Bangalore to Chennai",
    "route from Mumbai to Pune",
    "Delhi to Jaipur charging",
]

print("="*70)
print("🧪 RAG RETRIEVAL TEST")
print("="*70)

for query in test_queries:
    print(f"\n📝 Query: '{query}'")
    print("-"*70)
    
    # Get RAG results
    results = rag_service.query_global(query, n_results=3)
    
    print(f"\n📊 Retrieved {len(results['documents'])} documents:\n")
    
    for i, (doc, meta, dist) in enumerate(zip(
        results['documents'], 
        results['metadatas'], 
        results['distances']
    ), 1):
        similarity = 1 - dist
        print(f"Result {i} (Similarity: {similarity:.3f}):")
        print(f"  Document: {doc[:200]}...")
        print(f"  Route: {meta.get('start_location', '?')} → {meta.get('end_location', '?')}")
        print(f"  Distance: {meta.get('distance_km', '?')} km")
        print(f"  Charging stops: {meta.get('num_charging_stops', '?')}")
        print(f"  Energy: {meta.get('energy_used_kwh', '?')} kWh")
        print()
    
    print("="*70)

print("\n✅ RAG test complete!")
print("\nIf results look good, the RAG is working correctly.")
print("If results are irrelevant, the dataset might need better trip examples.")
