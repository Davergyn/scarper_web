"""
WebIntel AI - Scraper API Endpoint

POST /api/v1/scrape
Receives URL, mode, prompt → runs scraper → LLM analysis → returns ScrapingResult JSON.
"""

from __future__ import annotations

import logging
import time

from fastapi import APIRouter, HTTPException

from app.schemas.scraper import (
    ScrapeRequest,
    ScrapingResult,
    ProcessingStatus,
)
from app.core.intent_router import get_scraper
from app.services.llm_service import analyze_with_llm

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/scrape", response_model=ScrapingResult)
async def scrape_and_analyze(request: ScrapeRequest) -> ScrapingResult:
    """
    Main scraping endpoint.

    1. Resolves the appropriate scraper via IntentRouter
    2. Scrapes the target URL
    3. Sends raw data to LLM for analysis
    4. Returns structured ScrapingResult matching frontend types
    """
    start_time = time.time()
    logger.info(
        "Scrape request: url=%s, mode=%s, prompt='%s'",
        request.url, request.mode.value, request.prompt[:50],
    )

    try:
        # Step 1: Get the right scraper
        scraper = get_scraper(request.mode, request.url)
        logger.info("Using scraper: %s", type(scraper).__name__)

        # Step 2: Scrape the URL
        scrape_result = await scraper.scrape(request.url, request.prompt)
        logger.info(
            "Scrape complete: title='%s', %d comments, %d files",
            scrape_result.title[:50] if scrape_result.title else "N/A",
            len(scrape_result.comments),
            len(scrape_result.files),
        )

        # Step 3: Analyze with LLM
        analysis = await analyze_with_llm(scrape_result, request.prompt)

        elapsed = round(time.time() - start_time, 2)
        logger.info("Total processing time: %.2fs", elapsed)

        # Step 4: Build final response
        return ScrapingResult(
            status=ProcessingStatus.COMPLETED,
            progress=100,
            aiInsight=analysis["aiInsight"],
            kpiStats=analysis["kpiStats"],
            sentimentData=analysis["sentimentData"],
            tableData=analysis["tableData"],
            files=analysis["files"],
            processedTime=elapsed,
        )

    except Exception as e:
        elapsed = round(time.time() - start_time, 2)
        logger.error("Scrape failed after %.2fs: %s", elapsed, e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "status": "error",
                "processedTime": elapsed,
            },
        )
