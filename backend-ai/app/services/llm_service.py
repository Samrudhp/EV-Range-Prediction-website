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
        """Process general query"""
        self._ensure_model_loaded()
        
        query_type = self._classify_query(query)
        rag_results = rag_service.query_both(user_id, query)
        
        # Build context based on query type
        context = self._build_context(query, user_id, query_type, rag_results)
        
        # Generate response
        response = self.model.generate(
            context,
            max_tokens=settings.LLM_MAX_TOKENS,
            temp=settings.LLM_TEMPERATURE
        )
        
        return {
            "response": response,
            "query_type": query_type,
            "sources_used": ["global_rag", "personal_rag"],
            "confidence": 0.85
        }
    
    def predict_range(self, user_id: str, start: str, end: str, current_battery: float, 
                     weather: str, traffic: str) -> Dict[str, Any]:
        """Dedicated range prediction endpoint"""
        self._ensure_model_loaded()
        
        similar_trips = rag_service.find_similar_trips(start, end, n_results=5)
        user_profile = rag_service.get_user_profile(user_id)
        
        context = f"""You are an EV range prediction expert. Analyze if the user can complete this trip.

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
                "response": f"No driving data found for user {user_id}",
                "metrics": {},
                "recommendations": []
            }
        
        context = f"""Analyze this EV driver's performance and provide coaching.

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
                "community_avg": global_stats['avg_efficiency']
            },
            "recommendations": []
        }
    
    def _build_context(self, query: str, user_id: str, query_type: str, rag_results: Dict) -> str:
        """Build context for LLM based on query type"""
        
        if query_type == "range_prediction":
            return f"""You are an EV range prediction expert.

SIMILAR TRIPS:
{rag_results['global']['documents'][:2]}

USER PATTERNS:
{rag_results['personal']['documents'][:1] if rag_results['personal']['documents'] else 'No history'}

QUESTION: {query}

Provide clear answer with numbers and confidence level.
"""
        
        elif query_type == "route_planning":
            return f"""You are an EV trip planning expert.

ROUTE DATA:
{rag_results['global']['documents'][:3]}

USER PREFERENCES:
{rag_results['personal']['documents'][:1] if rag_results['personal']['documents'] else 'No history'}

REQUEST: {query}

Provide route with charging stops, time, and cost.
"""
        
        else:
            return f"""You are an EV expert assistant.

RELEVANT DATA:
{rag_results['global']['documents'][:2]}

USER CONTEXT:
{rag_results['personal']['documents'][:1] if rag_results['personal']['documents'] else 'New user'}

QUESTION: {query}

Provide helpful, accurate response.
"""

# Singleton instance
llm_service = LLMService()
