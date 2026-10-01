"""
WebIntel AI - Base Scraper Abstract Class

All scraper adapters must inherit from BaseScraper
and implement the `scrape()` async method.
"""

from __future__ import annotations

import abc
from dataclasses import dataclass, field


@dataclass
class ScrapeResult:
    """
    Raw scrape output before being transformed into
    the final ScrapingResult Pydantic response.
    """
    title: str = ""
    description: str = ""
    text_content: str = ""
    comments: list[dict] = field(default_factory=list)
    links: list[str] = field(default_factory=list)
    files: list[dict] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)
    source_type: str = "general"


class BaseScraper(abc.ABC):
    """Abstract base class for all scraper adapters."""

    @abc.abstractmethod
    async def scrape(self, url: str, prompt: str = "") -> ScrapeResult:
        """
        Scrape the given URL and return raw structured data.

        Args:
            url: The target URL to scrape.
            prompt: Optional natural language instruction to guide
                    extraction (for future LLM-assisted filtering).

        Returns:
            ScrapeResult with extracted data.
        """
        ...

    @staticmethod
    def _generate_id(index: int) -> str:
        """Generate a simple string ID for scraped items."""
        return str(index + 1)
