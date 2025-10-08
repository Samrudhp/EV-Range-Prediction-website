"""
API Routes for AI queries and predictions
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    QueryRequest, QueryResponse,
    RangePredictionRequest, RangePredictionResponse
)
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["AI"])

@router.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    General AI query endpoint
    Routes query to appropriate RAG system and generates response
    """
    try:
        result = llm_service.process_query(
            query=request.query,
            user_id=request.user_id
        )
        
        return QueryResponse(
            success=True,
            response=result["response"],
            query_type=result.get("query_type"),
            confidence=result.get("confidence", 0.85),
            sources_used=result.get("sources_used", ["global_rag", "personal_rag"]),
            map_data=None
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict-range", response_model=RangePredictionResponse)
async def predict_range(request: RangePredictionRequest):
    """
    Predict if user can reach destination with current battery
    Uses both RAG systems for accurate prediction
    """
    try:
        result = llm_service.predict_range(
            user_id=request.user_id,
            start=request.start_location,
            end=request.end_location,
            current_battery=request.current_battery_percent,
            weather=request.weather,
            traffic=request.traffic
        )
        
        return RangePredictionResponse(
            success=True,
            can_reach=result["can_reach"],
            prediction=result["response"],
            recommended_stops=result.get("charging_stops", []),
            confidence=result.get("confidence"),
            energy_estimate=result.get("energy_needed_kwh"),
            tips=result.get("personalized_tips", [])
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/analysis")
async def analyze_user_performance(user_id: str):
    """
    AI-powered analysis of user's driving performance
    Compares with community average
    """
    try:
        result = llm_service.analyze_performance(user_id=user_id)
        
        return {
            "success": True,
            "analysis": result["response"],
            "metrics": result.get("metrics"),
            "recommendations": result.get("recommendations")
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/profile")
async def get_user_profile(user_id: str):
    """
    Get user's driving profile and statistics
    """
    try:
        profile = rag_service.get_user_profile(user_id)
        
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
