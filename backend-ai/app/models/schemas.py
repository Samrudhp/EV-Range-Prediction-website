"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class QueryRequest(BaseModel):
    query: str = Field(..., description="User's question")
    user_id: str = Field(..., description="User identifier")
    include_map: Optional[bool] = Field(False, description="Include map data in response")

class RangePredictionRequest(BaseModel):
    user_id: str
    start_location: str
    end_location: str
    current_battery_percent: float = Field(..., ge=0, le=100)
    weather: Optional[str] = "pleasant"
    traffic: Optional[str] = "moderate"

class TripRequest(BaseModel):
    user_id: str
    start_location: str
    end_location: str
    distance_km: float = Field(..., gt=0)
    energy_used_kwh: float = Field(..., gt=0)
    efficiency_kwh_per_100km: float = Field(..., gt=0)
    weather: str
    traffic: str
    driving_style: str
    start_battery_percent: float = Field(..., ge=0, le=100)
    end_battery_percent: float = Field(..., ge=0, le=100)

class QueryResponse(BaseModel):
    success: bool
    response: str
    query_type: Optional[str] = None
    confidence: Optional[float] = None
    sources_used: Optional[List[str]] = None
    map_data: Optional[Dict[str, Any]] = None

class RangePredictionResponse(BaseModel):
    success: bool
    can_reach: bool
    prediction: str
    recommended_stops: Optional[List[Dict[str, Any]]] = []
    confidence: Optional[float] = None
    energy_estimate: Optional[float] = None
    tips: Optional[List[str]] = []

class UserProfile(BaseModel):
    user_id: str
    ev_model: str
    driving_style: str
    battery_health: float
    avg_efficiency: float
    total_trips: int
    total_distance: float

class ChargingStation(BaseModel):
    name: str
    location: List[float]
    power_kw: int
    available: bool
    price_per_kwh: float
    distance_from_route: Optional[float] = None

class RouteData(BaseModel):
    coordinates: List[List[float]]
    distance_km: float
    duration_hours: float
    elevation_change_m: float
    charging_stations: List[ChargingStation]
