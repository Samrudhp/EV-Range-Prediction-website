"""
FastAPI Backend with Dual RAG + GPT4All LLM
Main server for EV Range Prediction with GenAI capabilities
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from datetime import datetime
import json

# Import RAG and LLM modules
from rag_query import RAGQuerySystem
from llm_engine import LLMEngine

# Initialize FastAPI
app = FastAPI(
    title="EV Range Prediction API",
    description="GenAI-powered EV trip planning with dual RAG system",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize systems
print("🚀 Initializing AI systems...")
rag_system = RAGQuerySystem()
llm_engine = LLMEngine()
print("✅ AI systems ready!")

# Security
security = HTTPBearer()


# ==================== Pydantic Models ====================

class QueryRequest(BaseModel):
    query: str
    user_id: str
    include_map: Optional[bool] = False


class RangePredictionRequest(BaseModel):
    user_id: str
    start_location: str
    end_location: str
    current_battery_percent: float
    weather: Optional[str] = "pleasant"
    traffic: Optional[str] = "moderate"


class TripRequest(BaseModel):
    user_id: str
    start_location: str
    end_location: str
    distance_km: float
    energy_used_kwh: float
    efficiency_kwh_per_100km: float
    weather: str
    traffic: str
    driving_style: str
    start_battery_percent: float
    end_battery_percent: float


class UserProfileRequest(BaseModel):
    user_id: str


# ==================== API Endpoints ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "EV Range Prediction API with GenAI",
        "version": "2.0.0",
        "status": "online",
        "features": [
            "Dual RAG System (Global + Personal)",
            "Local LLM (Mistral-7B)",
            "Range Prediction",
            "Route Planning",
            "Efficiency Analysis"
        ]
    }


@app.post("/api/query")
async def process_query(request: QueryRequest):
    """
    General AI query endpoint
    Routes query to appropriate RAG system and generates response
    """
    
    try:
        print(f"\n📝 Query from {request.user_id}: {request.query}")
        
        # Route and process query
        result = llm_engine.process_query(
            query=request.query,
            user_id=request.user_id,
            rag_system=rag_system
        )
        
        # Add map data if requested
        if request.include_map and result.get("query_type") == "route_planning":
            # TODO: Fetch real map coordinates
            result["map_data"] = {
                "route": {
                    "coordinates": [],
                    "start": result.get("start_location"),
                    "end": result.get("end_location")
                },
                "charging_stations": []
            }
        
        return {
            "success": True,
            "response": result["response"],
            "query_type": result.get("query_type"),
            "confidence": result.get("confidence", 0.85),
            "sources_used": result.get("sources_used", ["global_rag", "personal_rag"]),
            "map_data": result.get("map_data")
        }
    
    except Exception as e:
        print(f"❌ Query error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict-range")
async def predict_range(request: RangePredictionRequest):
    """
    Predict if user can reach destination with current battery
    Uses both RAG systems for accurate prediction
    """
    
    try:
        print(f"\n🔮 Range prediction: {request.start_location} → {request.end_location}")
        
        # Build query for LLM
        query = f"""
Can I reach {request.end_location} from {request.start_location} 
with {request.current_battery_percent}% battery?
Weather: {request.weather}, Traffic: {request.traffic}
"""
        
        result = llm_engine.predict_range(
            user_id=request.user_id,
            start=request.start_location,
            end=request.end_location,
            current_battery=request.current_battery_percent,
            weather=request.weather,
            traffic=request.traffic,
            rag_system=rag_system
        )
        
        return {
            "success": True,
            "can_reach": result["can_reach"],
            "prediction": result["response"],
            "recommended_stops": result.get("charging_stops", []),
            "confidence": result.get("confidence"),
            "energy_estimate": result.get("energy_needed_kwh"),
            "tips": result.get("personalized_tips", [])
        }
    
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/trips/add")
async def add_trip(request: TripRequest):
    """
    Add a new trip and update user's personal RAG
    """
    
    try:
        # Add trip to personal RAG (updates last 10 trips)
        rag_system.add_user_trip(
            user_id=request.user_id,
            trip_data=request.dict()
        )
        
        return {
            "success": True,
            "message": "Trip added and personal profile updated",
            "user_id": request.user_id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}/profile")
async def get_user_profile(user_id: str):
    """
    Get user's driving profile and statistics
    """
    
    try:
        profile = rag_system.get_user_profile(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "profile": profile
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}/analysis")
async def analyze_user_performance(user_id: str):
    """
    AI-powered analysis of user's driving performance
    Compares with community average
    """
    
    try:
        query = f"Analyze driving performance and efficiency for user {user_id} compared to community average"
        
        result = llm_engine.analyze_performance(
            user_id=user_id,
            rag_system=rag_system
        )
        
        return {
            "success": True,
            "analysis": result["response"],
            "metrics": result.get("metrics"),
            "recommendations": result.get("recommendations")
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/routes/popular")
async def get_popular_routes():
    """
    Get most popular routes from community data
    """
    
    try:
        routes = rag_system.get_popular_routes(limit=10)
        
        return {
            "success": True,
            "routes": routes
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats/global")
async def get_global_stats():
    """
    Get global statistics from all users
    """
    
    try:
        stats = rag_system.get_global_stats()
        
        return {
            "success": True,
            "stats": stats
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/charging-stations/nearby")
async def find_nearby_charging_stations(
    lat: float,
    lon: float,
    radius_km: Optional[int] = 50
):
    """
    Find charging stations near a location
    TODO: Integrate with real charging station API
    """
    
    return {
        "success": True,
        "stations": [
            {
                "name": "Shell Recharge Station",
                "location": [lat + 0.1, lon + 0.1],
                "power_kw": 150,
                "available": True,
                "price_per_kwh": 12
            }
        ]
    }


# ==================== Startup & Shutdown ====================

@app.on_event("startup")
async def startup_event():
    """Initialize systems on startup"""
    print("\n" + "=" * 70)
    print("🚀 EV Range Prediction API - GenAI Edition")
    print("=" * 70)
    print(f"   RAG System: Ready")
    print(f"   LLM Engine: Ready")
    print(f"   Server: http://localhost:8000")
    print(f"   Docs: http://localhost:8000/docs")
    print("=" * 70 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("\n👋 Shutting down API...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
