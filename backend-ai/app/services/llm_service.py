"""
LLM Service - GPT4All integration for query processing
"""

from gpt4all import GPT4All
from typing import Dict, Any, List
from app.core.config import settings
from app.services.rag_service import rag_service

class LLMService:
    """Manages LLM (GPT4All) for generating responses"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LLMService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        print(f"🤖 Loading LLM: {settings.LLM_MODEL}...")
        print("   Using cached model from GPT4All cache directory...")
        
        try:
            # GPT4All automatically uses cache directory (~/.cache/gpt4all/)
            # Set allow_download=False to ensure we only use cached models
            self.model = GPT4All(
                model_name=settings.LLM_MODEL,
                allow_download=True,  # First time will download, then cache
                device='cpu'  # Explicitly use CPU
            )
            print("✅ LLM loaded successfully from cache!")
        except Exception as e:
            print(f"⚠️  Model not in cache. First run will download (~4GB).")
            print(f"   Model will be cached at: ~/.cache/gpt4all/")
            self.model = None
        
        self._initialized = True
    
    def _ensure_model_loaded(self):
        """Lazy load model if not already loaded"""
        if self.model is None:
            print("📥 Loading model from cache (or downloading if first run)...")
            self.model = GPT4All(
                model_name=settings.LLM_MODEL,
                allow_download=True,
                device='cpu'
            )
    
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
    
    def process_query(self, query: str, user_id: str) -> Dict[str, Any]:
        """Process general query - OPTIMIZED for speed"""
        self._ensure_model_loaded()
        
        query_type = self._classify_query(query)
        rag_results = rag_service.query_both(user_id, query)
        
        # DEBUG: Print what RAG retrieved
        print(f"\n{'='*60}")
        print(f"🔍 QUERY TYPE: {query_type}")
        print(f"📊 GLOBAL RAG RESULTS: {len(rag_results['global']['documents'])} documents")
        if rag_results['global']['documents']:
            print(f"   Top result: {rag_results['global']['documents'][0][:150]}...")
        print(f"👤 PERSONAL RAG RESULTS: {len(rag_results['personal']['documents'])} documents")
        if rag_results['personal']['documents']:
            print(f"   Top result: {rag_results['personal']['documents'][0][:150]}...")
        print(f"{'='*60}\n")
        
        # Build CONCISE context
        context = self._build_context(query, user_id, query_type, rag_results)
        
        # Generate response with REDUCED tokens for speed
        response = self.model.generate(
            context,
            max_tokens=settings.LLM_MAX_TOKENS,  # Now 180
            temp=settings.LLM_TEMPERATURE  # Now 0.1
        )
        
        return {
            "response": response.strip(),
            "query_type": query_type,
            "sources_used": ["global_rag", "personal_rag"],
            "confidence": 0.85,
            "rag_context_preview": rag_results['global']['documents'][0][:200] if rag_results['global']['documents'] else "No RAG data"
        }
    
    def predict_range(self, user_id: str, start: str, end: str, current_battery: float, 
                     weather: str, traffic: str) -> Dict[str, Any]:
        """Dedicated range prediction endpoint - OPTIMIZED"""
        self._ensure_model_loaded()
        
        similar_trips = rag_service.find_similar_trips(start, end, n_results=3)  # Reduced from 5
        user_profile = rag_service.get_user_profile(user_id)
        
        # IMPROVED context building with clear instructions
        context = f"""You are an expert EV range analyst. Analyze this trip request.

TRIP REQUEST:
From: {start}
To: {end}
Current Battery: {current_battery}%
Weather: {weather}
Traffic: {traffic}

COMMUNITY DATA:
"""
        
        if similar_trips:
            # Show top 2 trips only
            for i, trip in enumerate(similar_trips[:2], 1):
                context += f"""Trip {i}: {trip['distance_km']}km used {trip['energy_used_kwh']}kWh ({trip['efficiency_kwh_per_100km']}kWh/100km)
"""
        else:
            context += "No similar trip data available. Use general estimates.\n"
        
        if user_profile:
            context += f"""
YOUR DRIVING PROFILE:
Average efficiency: {user_profile.get('avg_efficiency', 15.5)} kWh/100km
Style: {user_profile.get('driving_style', 'normal')}
"""
        
        context += """
PROVIDE ANALYSIS:
1. Can you complete this trip? (YES/NO with confidence %)
2. Estimated distance and energy required
3. Charging recommendation (0-2 stops maximum)
4. Key factors to consider

Keep response practical and realistic. Maximum 150 words.

ANALYSIS:"""
        
        response = self.model.generate(context, max_tokens=200, temp=0.1)  # Even lower temp for consistency
        
        can_reach = "yes" in response.lower()[:100]
        
        return {
            "response": response,
            "can_reach": can_reach,
            "confidence": 0.85,
            "charging_stops": [],
            "energy_needed_kwh": None,
            "personalized_tips": []
        }
    
    def analyze_performance(self, user_id: str) -> Dict[str, Any]:
        """Analyze user's driving performance"""
        self._ensure_model_loaded()
        
        user_profile = rag_service.get_user_profile(user_id)
        global_stats = rag_service.get_global_stats()
        
        if not user_profile:
            return {
                "response": f"No driving data found for user {user_id}. Start logging trips to get personalized insights!",
                "metrics": {},
                "recommendations": []
            }
        
        context = f"""You are an EV driving coach. Analyze this driver's performance.

DRIVER'S METRICS:
- Efficiency: {user_profile['avg_efficiency']} kWh/100km
- Driving style: {user_profile['driving_style']}
- Battery health: {user_profile['battery_health']}%
- Trips analyzed: {user_profile['num_trips_analyzed']}

COMMUNITY BENCHMARKS:
- Average efficiency: {global_stats['avg_efficiency']} kWh/100km
- Best: {global_stats['most_efficient']} kWh/100km
- Worst: {global_stats['least_efficient']} kWh/100km

INSTRUCTIONS:
1. Rate performance (Excellent/Good/Average/Needs Improvement)
2. Compare to community average
3. Give 2-3 specific actionable tips
4. Be encouraging and constructive
5. Keep under 150 words

COACHING ANALYSIS:"""
        
        response = self.model.generate(context, max_tokens=200, temp=0.3)
        
        return {
            "response": response.strip(),
            "metrics": {
                "user_efficiency": user_profile['avg_efficiency'],
                "community_avg": global_stats['avg_efficiency']
            },
            "recommendations": []
        }
    
    def _build_context(self, query: str, user_id: str, query_type: str, rag_results: Dict) -> str:
        """Build CONCISE context for LLM based on query type - OPTIMIZED"""
        
        # Extract only TOP result from each RAG (not all)
        global_top = rag_results['global']['documents'][0] if rag_results['global']['documents'] else "No data available"
        personal_top = rag_results['personal']['documents'][0] if rag_results['personal']['documents'] else "No personal history"
        
        # Get metadata for charging station info
        global_metadata = rag_results['global']['metadatas'][0] if rag_results['global']['metadatas'] else {}
        
        if query_type == "range_prediction":
            return f"""You are an EV range expert. Answer ONLY using the data provided below.

COMMUNITY DATA (similar trips):
{global_top[:400]}

YOUR DRIVING HISTORY:
{personal_top[:200]}

USER QUESTION: {query}

STRICT RULES:
1. ONLY use information from the data above
2. If data is insufficient, say "I don't have enough trip data for this route"
3. Give YES or NO answer first with confidence %
4. State estimated distance and energy if available in data
5. Mention charging needs based on data
6. Maximum 100 words
7. DO NOT make up information

ANSWER:"""
        
        elif query_type == "route_planning":
            return f"""You are an EV route planner. Answer ONLY using the data provided below.

COMMUNITY ROUTE DATA:
{global_top[:400]}

YOUR PREFERENCES:
{personal_top[:200]}

USER QUESTION: {query}

STRICT RULES:
1. ONLY use trip data provided above
2. If no data for this route, say "I don't have trip data for this specific route"
3. Estimate distance from data (don't invent)
4. Suggest 1-2 charging stops per 200km maximum
5. Base recommendations on actual trip data
6. Maximum 120 words
7. DO NOT hallucinate stations or routes

ANSWER:"""
        
        elif query_type == "charging_info":
            # Extract charging station info from metadata
            charging_info = ""
            if global_metadata:
                charging_info = f"""
Route: {global_metadata.get('start_location', '?')} to {global_metadata.get('end_location', '?')}
Distance: {global_metadata.get('distance_km', '?')} km
Charging stops needed: {global_metadata.get('num_charging_stops', 0)}
Energy used: {global_metadata.get('energy_used_kwh', '?')} kWh
"""
            
            return f"""You are an EV charging station expert. Answer ONLY using the data below.

TRIP DATA FOR THIS ROUTE:
{global_top[:400]}
{charging_info}

YOUR CHARGING HISTORY:
{personal_top[:150]}

USER QUESTION: {query}

STRICT RULES:
1. ONLY mention charging stops from the trip data above
2. If no specific stations listed, say "Based on {global_metadata.get('num_charging_stops', 0)} charging stops needed for this route"
3. DO NOT invent station names, networks, or locations
4. Use data like "trips show X charging stops needed"
5. Suggest checking real apps: ChargePoint, PlugShare, ABRP
6. Maximum 100 words
7. BE HONEST if data is limited

ANSWER:"""
        
        elif query_type == "performance_analysis":
            return f"""You are an EV driving coach. Answer ONLY using the data below.

YOUR METRICS:
{personal_top[:300]}

COMMUNITY COMPARISON:
{global_top[:300]}

USER QUESTION: {query}

STRICT RULES:
1. ONLY compare using the efficiency data above
2. If no personal data, say "I need your trip history to analyze performance"
3. Give rating (Excellent/Good/Average/Needs Work)
4. Provide 2-3 specific tips
5. Maximum 120 words
6. BE HONEST about data limitations

ANSWER:"""
        
        else:
            # For general queries - force RAG usage
            return f"""You are a helpful EV assistant. Answer ONLY using the data provided below.

AVAILABLE DATA:
{global_top[:350]}

USER QUESTION: {query}

STRICT RULES:
1. ONLY answer if the data above is relevant
2. If data doesn't match question, say "I don't have specific data about this. Try asking about: range prediction, route planning, or charging info"
3. DO NOT make up facts about EVs, routes, or charging
4. Keep under 100 words
5. Be honest about limitations

ANSWER:"""

# Singleton instance
llm_service = LLMService()
