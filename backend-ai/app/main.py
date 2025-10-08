"""
Main FastAPI application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import ai_routes, routes

# Initialize FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="GenAI-powered EV trip planning with dual RAG system",
    version=settings.APP_VERSION
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai_routes.router)
app.include_router(routes.router)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": f"{settings.APP_NAME} with GenAI",
        "version": settings.APP_VERSION,
        "status": "online",
        "features": [
            "Dual RAG System (Global + Personal)",
            "Local LLM (Mistral-7B)",
            "Range Prediction",
            "Route Planning",
            "Efficiency Analysis"
        ]
    }

@app.on_event("startup")
async def startup_event():
    """Initialize systems on startup"""
    print("\n" + "=" * 70)
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION}")
    print("=" * 70)
    print(f"   Server: http://{settings.HOST}:{settings.PORT}")
    print(f"   Docs: http://{settings.HOST}:{settings.PORT}/docs")
    print("=" * 70 + "\n")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("\n👋 Shutting down API...")


if __name__ == "__main__":
    """Run with: python -m app.main"""
    import uvicorn
    
    print("\n" + "=" * 70)
    print("🚀 Starting EV Range Prediction API")
    print("=" * 70)
    print(f"   Using cached models:")
    print(f"   - LLM: ~/.cache/gpt4all/{settings.LLM_MODEL}")
    print(f"   - Embeddings: ~/.cache/torch/sentence_transformers/")
    print("=" * 70 + "\n")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
