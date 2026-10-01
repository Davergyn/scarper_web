"""
WebIntel AI - Pydantic Schemas for Scraper API

These schemas are designed to match 100% with the frontend
TypeScript interfaces defined in `src/types/index.ts`.
"""

from __future__ import annotations

from enum import Enum
from typing import Union

from pydantic import BaseModel, Field


# ============================================
# Enums (matching TypeScript union types)
# ============================================

class ScrapingMode(str, Enum):
    """Maps to TS: ScrapingMode"""
    AUTO = "auto"
    GOOGLE_MAPS = "google-maps"
    YOUTUBE = "youtube"
    SOCIAL_MEDIA = "social-media"
    DOCUMENT_HARVESTER = "document-harvester"


class SentimentType(str, Enum):
    """Maps to TS: SentimentType"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class ProcessingStatus(str, Enum):
    """Maps to TS: ProcessingStatus"""
    IDLE = "idle"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"


class ChangeType(str, Enum):
    """Maps to TS: KPIStat.changeType"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


# ============================================
# Request Schemas
# ============================================

class ScrapeRequest(BaseModel):
    """Incoming payload from frontend CommandBar."""
    url: str = Field(..., description="Target URL to scrape")
    mode: ScrapingMode = Field(default=ScrapingMode.AUTO, description="Scraping strategy")
    prompt: str = Field(default="", description="Natural language instruction for AI")


# ============================================
# Response Schemas (matching TS interfaces 1:1)
# ============================================

class KPIStat(BaseModel):
    """Maps to TS: KPIStat"""
    label: str
    value: Union[str, int, float] = Field(description="Can be string or number")
    change: str | None = None
    changeType: ChangeType | None = Field(default=None, alias="changeType")
    icon: str

    model_config = {"populate_by_name": True}


class SentimentData(BaseModel):
    """Maps to TS: SentimentData"""
    name: str
    value: int
    color: str


class ScrapedRow(BaseModel):
    """Maps to TS: ScrapedRow"""
    id: str
    title: str
    source: str
    sentiment: SentimentType
    score: float = Field(ge=0.0, le=1.0)
    date: str = Field(description="Date string in YYYY-MM-DD format")
    content: str
    url: str | None = None


class FileItem(BaseModel):
    """Maps to TS: FileItem"""
    id: str
    name: str
    type: str = Field(description="File type: PDF, Excel, CSV, Image, Word, etc.")
    size: str = Field(description="Human-readable size: e.g. '2.4 MB'")
    url: str


class AIInsight(BaseModel):
    """Maps to TS: AIInsight"""
    summary: str
    keyFindings: list[str] = Field(alias="keyFindings")
    recommendation: str

    model_config = {"populate_by_name": True}


class ScrapingResult(BaseModel):
    """
    Maps to TS: ScrapingResult
    This is the main response body for POST /api/v1/scrape.
    """
    status: ProcessingStatus
    progress: int = Field(ge=0, le=100)
    aiInsight: AIInsight | None = Field(default=None, alias="aiInsight")
    kpiStats: list[KPIStat] = Field(default_factory=list, alias="kpiStats")
    sentimentData: list[SentimentData] = Field(default_factory=list, alias="sentimentData")
    tableData: list[ScrapedRow] = Field(default_factory=list, alias="tableData")
    files: list[FileItem] = Field(default_factory=list)
    processedTime: float = Field(default=0.0, alias="processedTime")

    model_config = {"populate_by_name": True}
