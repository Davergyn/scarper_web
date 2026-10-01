"""
WebIntel AI - API v1 Router

Aggregates all v1 endpoint routers under /api/v1 prefix.
"""

from fastapi import APIRouter

from app.api.v1.endpoints.scraper import router as scraper_router

router = APIRouter(prefix="/api/v1")

router.include_router(scraper_router, tags=["scraper"])
