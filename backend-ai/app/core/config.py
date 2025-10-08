"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "EV Range Prediction API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    # RAG System
    CHROMA_DB_PATH: str = "./chroma_db"
    # 🚀 OPTIMIZED: all-MiniLM-L6-v2 is fast (384 dims) & accurate for semantic similarity
    # Alternatives: "all-mpnet-base-v2" (slower, 768 dims, +2% accuracy)
    #               "paraphrase-MiniLM-L3-v2" (faster, 384 dims, -3% accuracy)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # LLM (Using cached Orca Mini 3B model)
    LLM_MODEL: str = "orca-mini-3b-gguf2-q4_0.gguf"
    LLM_MAX_TOKENS: int = 180  # Reduced for concise, focused responses
    LLM_TEMPERATURE: float = 0.1  # Very low = consistent, factual output
    
    # Data
    DATASET_PATH: str = "./data"
    USERS_FILE: str = "dataset_users.json"
    TRIPS_FILE: str = "dataset_trips.json"
    
    # OpenRouteService
    ORS_API_KEY: Optional[str] = None
    ORS_BASE_URL: str = "https://api.openrouteservice.org"
    
    # Weather API (optional)
    WEATHER_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
