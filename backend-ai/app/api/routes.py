"""
Routes for routes and statistics
"""

from fastapi import APIRouter, HTTPException
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["Routes & Stats"])

@router.get("/routes/popular")
async def get_popular_routes():
    """
    Get most popular routes from community data
    """
    try:
        routes = rag_service.get_popular_routes(limit=10)
        
        return {
            "success": True,
            "routes": routes
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/global")
async def get_global_stats():
    """
    Get global statistics from all users
    """
    try:
        stats = rag_service.get_global_stats()
        
        return {
            "success": True,
            "stats": stats
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/charging-stations/nearby")
async def find_nearby_charging_stations(
    lat: float,
    lon: float,
    radius_km: int = 50
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
