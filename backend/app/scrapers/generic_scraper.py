"""
WebIntel AI - Generic Web Scraper

Uses httpx + BeautifulSoup4 for scraping static web pages,
extracting text content, links, and downloadable documents.
"""

from __future__ import annotations

import logging
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from app.scrapers.base import BaseScraper, ScrapeResult

logger = logging.getLogger(__name__)

# File extensions considered as downloadable documents
DOCUMENT_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx",
    ".csv", ".ppt", ".pptx", ".txt", ".zip",
}

# Approximate file type labels for common extensions
EXTENSION_TYPE_MAP = {
    ".pdf": "PDF",
    ".doc": "Word",
    ".docx": "Word",
    ".xls": "Excel",
    ".xlsx": "Excel",
    ".csv": "CSV",
    ".ppt": "PowerPoint",
    ".pptx": "PowerPoint",
    ".txt": "Text",
    ".zip": "Archive",
    ".png": "Image",
    ".jpg": "Image",
    ".jpeg": "Image",
    ".gif": "Image",
    ".webp": "Image",
}


class GenericScraper(BaseScraper):
    """
    Scraper for static web pages using httpx + BeautifulSoup.
    Extracts:
    - Page title and meta description
    - Main text content (paragraphs)
    - All links on the page
    - Downloadable document links (PDF, DOCX, etc.)
    """

    TIMEOUT = 30.0
    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/130.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
    }

    async def scrape(self, url: str, prompt: str = "") -> ScrapeResult:
        """Fetch and parse a static web page."""
        logger.info("GenericScraper: Fetching %s", url)

        async with httpx.AsyncClient(
            timeout=self.TIMEOUT,
            headers=self.HEADERS,
            follow_redirects=True,
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")

        # Extract title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        # Extract meta description
        description = ""
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            description = meta_desc["content"].strip()

        # Extract main text content (paragraphs)
        paragraphs = []
        for p in soup.find_all("p"):
            text = p.get_text(strip=True)
            if text and len(text) > 20:  # Filter very short paragraphs
                paragraphs.append(text)
        text_content = "\n\n".join(paragraphs[:50])  # Limit to 50 paragraphs

        # Extract all links
        all_links: list[str] = []
        files: list[dict] = []

        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            absolute_url = urljoin(url, href)
            all_links.append(absolute_url)

            # Check if link is a downloadable document
            parsed = urlparse(absolute_url)
            path_lower = parsed.path.lower()
            for ext in DOCUMENT_EXTENSIONS:
                if path_lower.endswith(ext):
                    filename = parsed.path.split("/")[-1] or f"document{ext}"
                    files.append({
                        "name": filename,
                        "type": EXTENSION_TYPE_MAP.get(ext, "File"),
                        "url": absolute_url,
                        "size": "Unknown",
                    })
                    break

        logger.info(
            "GenericScraper: Extracted %d paragraphs, %d links, %d files from %s",
            len(paragraphs), len(all_links), len(files), url,
        )

        return ScrapeResult(
            title=title,
            description=description,
            text_content=text_content,
            comments=[],
            links=all_links,
            files=files,
            metadata={
                "status_code": response.status_code,
                "content_type": response.headers.get("content-type", ""),
                "paragraph_count": len(paragraphs),
                "link_count": len(all_links),
            },
            source_type="general",
        )
