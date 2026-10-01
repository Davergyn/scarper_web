"""
WebIntel AI - Intent Router

Routes incoming scrape requests to the appropriate Scraper Adapter
based on the selected mode or by auto-detecting the URL domain.
"""

from __future__ import annotations

import logging
from urllib.parse import urlparse

from app.schemas.scraper import ScrapingMode
from app.scrapers.base import BaseScraper
from app.scrapers.generic_scraper import GenericScraper
from app.scrapers.youtube_scraper import YouTubeScraper
from app.scrapers.dynamic_scraper import DynamicScraper

logger = logging.getLogger(__name__)

# Domain patterns for auto-detection
YOUTUBE_DOMAINS = {"youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"}
GOOGLE_MAPS_DOMAINS = {"maps.google.com", "www.google.com", "goo.gl"}
SOCIAL_MEDIA_DOMAINS = {
    "twitter.com", "x.com",
    "instagram.com", "www.instagram.com",
    "facebook.com", "www.facebook.com",
    "tiktok.com", "www.tiktok.com",
}
DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx"}


def _detect_mode_from_url(url: str) -> ScrapingMode:
    """Auto-detect the best scraping mode based on URL domain/path."""
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.lower()

    if domain in YOUTUBE_DOMAINS:
        return ScrapingMode.YOUTUBE

    if domain in GOOGLE_MAPS_DOMAINS:
        # Check if it's actually a Maps URL
        if "maps" in domain or "/maps" in path:
            return ScrapingMode.GOOGLE_MAPS

    if domain in SOCIAL_MEDIA_DOMAINS:
        return ScrapingMode.SOCIAL_MEDIA

    # Check for document links
    for ext in DOCUMENT_EXTENSIONS:
        if path.endswith(ext):
            return ScrapingMode.DOCUMENT_HARVESTER

    return ScrapingMode.AUTO  # Fallback to generic


def get_scraper(mode: ScrapingMode, url: str) -> BaseScraper:
    """
    Return the appropriate scraper instance based on mode.
    If mode is AUTO, detect from URL domain first.
    """
    resolved_mode = mode
    if mode == ScrapingMode.AUTO:
        resolved_mode = _detect_mode_from_url(url)
        logger.info("IntentRouter: Auto-detected mode '%s' for URL: %s", resolved_mode.value, url)

    match resolved_mode:
        case ScrapingMode.YOUTUBE:
            return YouTubeScraper(max_comments=100)

        case ScrapingMode.GOOGLE_MAPS | ScrapingMode.SOCIAL_MEDIA:
            # Dynamic pages require Playwright
            return DynamicScraper()

        case ScrapingMode.DOCUMENT_HARVESTER:
            # Use generic scraper for document harvesting (finds links)
            return GenericScraper()

        case _:
            # Default: generic httpx + BS4 scraper
            return GenericScraper()
