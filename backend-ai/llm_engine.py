"""
LLM Engine - GPT4All integration for query processing
Uses Mistral-7B locally for all AI responses
"""

from gpt4all import GPT4All
from typing import Dict, Any, List
import json
import re

class LLMEngine:
    """Manages LLM (GPT4All) for generating responses"""
    
    def __init__(self, model_name: str = "mistral-7b-instruct-v0.2.Q4_0.gguf"):
        """Initialize GPT4All model"""
        
        print(f"🤖 Loading LLM: {model_name}...")
        print("   This may take a moment...")
        
        try:
            self.model = GPT4All(model_name)
            print("✅ LLM loaded successfully!")
        except Exception as e:
            print(f"⚠️  Could not load model: {e}")
            print("   Model will be downloaded on first use")
            self.model = None
    
    def _ensure_model_loaded(self):
        """Lazy load model if not already loaded"""
        if self.model is None:
            print("📥 Downloading Mistral-7B model (one-time, ~4GB)...")
            self.model = GPT4All("mistral-7b-instruct-v0.2.Q4_0.gguf")
    
    def _classify_query(self, query: str) -> str:
        """Determine query type"""
        
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['range', 'reach', 'how far', 'can i go', 'predict']):
            return "range_prediction"
        
        elif any(word in query_lower for word in ['route', 'plan', 'trip to', 'navigate']):
            return "route_planning"
        
        elif any(word in query_lower for word in ['efficiency', 'my driving', 'my trips', 'performance']):
            return "performance_analysis"
        
        elif any(word in query_lower for word in ['compare', 'vs', 'better', 'community']):
            return "comparison"
        
        elif any(word in query_lower for word in ['charging', 'charge', 'station', 'charger']):
            return "charging_info"
        
        else:
            return "general"
    
    def process_query(self, query: str, user_id: str, rag_system) -> Dict[str, Any]:
        """Process general query"""
        
        self._ensure_model_loaded()
        
        query_type = self._classify_query(query)
        
        # Route to appropriate handler
        if query_type == "range_prediction":
            return self._handle_range_query(query, user_id, rag_system)
        
        elif query_type == "route_planning":
            return self._handle_route_query(query, user_id, rag_system)
        
        elif query_type == "performance_analysis":
            return self._handle_performance_query(query, user_id, rag_system)
        
        elif query_type == "comparison":
            return self._handle_comparison_query(query, user_id, rag_system)
        
        else:
            return self._handle_general_query(query, user_id, rag_system)
    
    def _handle_range_query(self, query: str, user_id: str, rag_system) -> Dict[str, Any]:
        """Handle range prediction queries"""
        
        # Get context from both RAGs
        rag_results = rag_system.query_both(user_id, query)
        
        # Build context
        context = self._build_range_context(query, user_id, rag_results)
        
        # Generate response
        response = self.model.generate(
            context,
            max_tokens=600,
            temp=0.3  # Lower temperature for factual responses
        )
        
        return {
            "response": response,
            "query_type": "range_prediction",
            "sources_used": ["global_rag", "personal_rag"],
            "confidence": 0.88
        }
    
    def _handle_route_query(self, query: str, user_id: str, rag_system) -> Dict[str, Any]:
        """Handle route planning queries"""
        
        rag_results = rag_system.query_both(user_id, query)
        
        context = self._build_route_context(query, user_id, rag_results)
        
        response = self.model.generate(
            context,
            max_tokens=700,
            temp=0.4
        )
        
        return {
            "response": response,
            "query_type": "route_planning",
            "sources_used": ["global_rag", "personal_rag"]
        }
    
    def _handle_performance_query(self, query: str, user_id: str, rag_system) -> Dict[str, Any]:
        """Handle performance analysis queries"""
        
        personal_results = rag_system.query_personal(user_id, "driving patterns efficiency", n_results=1)
        global_stats = rag_system.get_global_stats()
        
        context = f"""
You are an EV driving coach. Analyze this user's performance.

USER'S DRIVING PROFILE:
{personal_results['documents'][0] if personal_results['documents'] else 'No data'}

COMMUNITY AVERAGE:
- Average efficiency: {global_stats.get('avg_efficiency', 15.5):.2f} kWh/100km
- Best efficiency: {global_stats.get('most_efficient', 12.0):.2f} kWh/100km

USER QUESTION: {query}

Provide:
1. Performance comparison to community
2. Specific areas for improvement
3. Actionable tips to improve efficiency
4. Estimated savings if improvements are made

Be encouraging but honest.
"""
        
        response = self.model.generate(context, max_tokens=500, temp=0.5)
        
        return {
            "response": response,
            "query_type": "performance_analysis",
            "sources_used": ["personal_rag", "global_stats"]
        }
    
    def _handle_comparison_query(self, query: str, user_id: str, rag_system) -> Dict[str, Any]:
        """Handle comparison queries"""
        
        rag_results = rag_system.query_both(user_id, query)
        
        context = f"""
Compare and analyze the following data.

COMMUNITY DATA:
{rag_results['global']['documents'][:3]}

USER DATA:
{rag_results['personal']['documents']}

QUERY: {query}

Provide a detailed comparison highlighting:
- Similarities and differences
- User's standing vs community
- Recommendations
"""
        
        response = self.model.generate(context, max_tokens=500, temp=0.4)
        
        return {
            "response": response,
            "query_type": "comparison"
        }
    
    def _handle_general_query(self, query: str, user_id: str, rag_system) -> Dict[str, Any]:
        """Handle general queries"""
        
        rag_results = rag_system.query_both(user_id, query)
        
        context = f"""
You are an EV expert assistant. Answer the following question based on available data.

RELEVANT TRIP DATA:
{rag_results['global']['documents'][:2]}

USER CONTEXT:
{rag_results['personal']['documents'][:1] if rag_results['personal']['documents'] else 'New user'}

QUESTION: {query}

Provide a helpful, accurate response.
"""
        
        response = self.model.generate(context, max_tokens=400, temp=0.5)
        
        return {
            "response": response,
            "query_type": "general"
        }
    
    def predict_range(self, user_id: str, start: str, end: str, current_battery: float, 
                     weather: str, traffic: str, rag_system) -> Dict[str, Any]:
        """Dedicated range prediction endpoint"""
        
        self._ensure_model_loaded()
        
        # Find similar trips
        similar_trips = rag_system.find_similar_trips(start, end, n_results=5)
        
        # Get user profile
        user_profile = rag_system.get_user_profile(user_id)
        
        # Build detailed context
        context = f"""
You are an EV range prediction expert. Analyze if the user can complete this trip.

TRIP DETAILS:
- From: {start}
- To: {end}
- Current battery: {current_battery}%
- Weather: {weather}
- Traffic: {traffic}

SIMILAR TRIPS FROM COMMUNITY ({len(similar_trips)} trips):
"""
        
        if similar_trips:
            for i, trip in enumerate(similar_trips[:3], 1):
                context += f"""
Trip {i}:
- Distance: {trip['distance_km']}km
- Energy used: {trip['energy_used_kwh']}kWh
- Efficiency: {trip['efficiency_kwh_per_100km']}kWh/100km
- Weather: {trip['weather']}, Traffic: {trip['traffic']}
- Charging stops: {trip['num_charging_stops']}
"""
        else:
            context += "\nNo similar trips found in database.\n"
        
        if user_profile:
            context += f"""
USER'S DRIVING PROFILE:
- EV Model: {user_profile.get('ev_model', 'Unknown')}
- Average efficiency: {user_profile.get('avg_efficiency', 15.5)}kWh/100km
- Driving style: {user_profile.get('driving_style', 'normal')}
- Battery health: {user_profile.get('battery_health', 100)}%
"""
        
        context += """
PROVIDE YOUR ANALYSIS:
1. Can they reach the destination? (YES/NO with confidence %)
2. Estimated energy needed (kWh)
3. Recommended charging stops (if any)
4. Personalized tips based on their driving style
5. Confidence level based on data quality

Be specific with numbers and realistic.
"""
        
        response = self.model.generate(context, max_tokens=600, temp=0.2)
        
        # Parse response for structured data (simple extraction)
        can_reach = "yes" in response.lower()[:100]
        
        return {
            "response": response,
            "can_reach": can_reach,
            "confidence": 0.85,
            "charging_stops": [],  # TODO: Parse from response
            "energy_needed_kwh": None,  # TODO: Parse from response
            "personalized_tips": []
        }
    
    def analyze_performance(self, user_id: str, rag_system) -> Dict[str, Any]:
        """Analyze user's driving performance"""
        
        self._ensure_model_loaded()
        
        # Get user data
        user_profile = rag_system.get_user_profile(user_id)
        global_stats = rag_system.get_global_stats()
        
        if not user_profile:
            return {
                "response": f"No driving data found for user {user_id}",
                "metrics": {},
                "recommendations": []
            }
        
        context = f"""
Analyze this EV driver's performance and provide coaching.

USER METRICS:
- Average efficiency: {user_profile['avg_efficiency']}kWh/100km
- Driving style: {user_profile['driving_style']}
- Battery health: {user_profile['battery_health']}%
- Total trips analyzed: {user_profile['num_trips_analyzed']}

COMMUNITY BENCHMARKS:
- Community average: {global_stats['avg_efficiency']:.2f}kWh/100km
- Best performers: {global_stats['most_efficient']:.2f}kWh/100km
- Worst performers: {global_stats['least_efficient']:.2f}kWh/100km

PROVIDE:
1. Performance rating (1-10)
2. Comparison to community (percentile)
3. Strengths
4. Areas for improvement
5. Top 3 actionable recommendations
6. Potential cost/energy savings

Be encouraging but specific.
"""
        
        response = self.model.generate(context, max_tokens=600, temp=0.4)
        
        return {
            "response": response,
            "metrics": {
                "user_efficiency": user_profile['avg_efficiency'],
                "community_avg": global_stats['avg_efficiency'],
                "percentile": 0  # TODO: Calculate
            },
            "recommendations": []  # TODO: Parse from response
        }
    
    def _build_range_context(self, query: str, user_id: str, rag_results: Dict) -> str:
        """Build context for range prediction"""
        
        context = f"""
You are an EV range prediction expert. Answer the user's question based on real trip data.

SIMILAR TRIPS FROM COMMUNITY:
{rag_results['global']['documents'][:3]}

USER'S PERSONAL PATTERNS:
{rag_results['personal']['documents'][:1] if rag_results['personal']['documents'] else 'No personal history'}

QUESTION: {query}

Provide:
1. Clear answer (can reach / cannot reach)
2. Energy estimate
3. Recommended charging strategy
4. Confidence level
5. Tips based on their driving style
"""
        return context
    
    def _build_route_context(self, query: str, user_id: str, rag_results: Dict) -> str:
        """Build context for route planning"""
        
        context = f"""
You are an EV trip planning expert. Help plan this route.

COMMUNITY ROUTE DATA:
{rag_results['global']['documents'][:4]}

USER PREFERENCES:
{rag_results['personal']['documents'][:1] if rag_results['personal']['documents'] else 'No history'}

REQUEST: {query}

Provide:
1. Recommended route
2. Charging stops with locations
3. Total trip time
4. Energy requirements
5. Cost estimate
6. Tips for efficiency
"""
        return context
