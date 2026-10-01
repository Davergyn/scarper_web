"""
WebIntel AI - FastAPI Application Entry Point

Initializes the FastAPI app, configures CORS middleware,
and includes all API routers.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import router as v1_router

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger(__name__)

# ============================================
# FastAPI App
# ============================================

app = FastAPI(
    title="WebIntel AI",
    description="Smart Web Scraper & Intelligence Agent — Backend API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================
# CORS Middleware (allow frontend at :5173)
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Include Routers
# ============================================

app.include_router(v1_router)


# ============================================
# Health Check
# ============================================

@app.get("/", tags=["health"])
async def root():
    """Health check endpoint."""
    return {
        "service": "WebIntel AI Backend",
        "status": "running",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "debug": settings.DEBUG,
        "frontend_url": settings.FRONTEND_URL,
    }


# ============================================
# Startup Event
# ============================================

@app.on_event("startup")
async def startup_event():
    logger.info("=" * 50)
    logger.info("WebIntel AI Backend starting...")
    logger.info("CORS origin: %s", settings.FRONTEND_URL)
    logger.info("Docs: http://%s:%d/docs", settings.HOST, settings.PORT)
    logger.info("=" * 50)
