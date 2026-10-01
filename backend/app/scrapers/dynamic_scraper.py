"""
WebIntel AI - Dynamic Page Scraper (Playwright)

Uses Playwright async API for scraping JavaScript-rendered
pages such as Google Maps, SPAs, and social media.
"""

from __future__ import annotations

import logging
from urllib.parse import urljoin, urlparse

from app.scrapers.base import BaseScraper, ScrapeResult

logger = logging.getLogger(__name__)

# File extensions considered as downloadable documents
DOCUMENT_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv",
}

EXTENSION_TYPE_MAP = {
    ".pdf": "PDF",
    ".doc": "Word",
    ".docx": "Word",
    ".xls": "Excel",
    ".xlsx": "Excel",
    ".csv": "CSV",
}


class DynamicScraper(BaseScraper):
    """
    Scraper for JavaScript-rendered pages using Playwright.
    Uses headless Chromium to:
    - Wait for full page render
    - Extract text content from rendered DOM
    - Collect links and downloadable files
    """

    TIMEOUT_MS = 30_000
    WAIT_AFTER_LOAD_MS = 3_000

    async def scrape(self, url: str, prompt: str = "") -> ScrapeResult:
        """Launch headless browser and scrape rendered page content."""
        logger.info("DynamicScraper: Launching Playwright for %s", url)

        try:
            from playwright.async_api import async_playwright
        except ImportError as e:
            logger.error(
                "DynamicScraper: Playwright not installed. "
                "Run: pip install playwright && playwright install chromium"
            )
            raise RuntimeError(
                "Playwright is not installed. "
                "Run: pip install playwright && playwright install chromium"
            ) from e

        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/130.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1920, "height": 1080},
                locale="en-US",
            )
            page = await context.new_page()

            try:
                # Navigate and wait for network idle
                await page.goto(url, wait_until="networkidle", timeout=self.TIMEOUT_MS)
                await page.wait_for_timeout(self.WAIT_AFTER_LOAD_MS)

                # Extract page title
                title = await page.title() or ""

                # Extract meta description
                description = ""
                meta_el = await page.query_selector('meta[name="description"]')
                if meta_el:
                    description = await meta_el.get_attribute("content") or ""

                # Extract visible text content
                text_content = await page.evaluate("""
                    () => {
                        const elements = document.querySelectorAll(
                            'p, h1, h2, h3, h4, h5, h6, li, td, th, span, div'
                        );
                        const texts = new Set();
                        elements.forEach(el => {
                            const text = el.innerText?.trim();
                            if (text && text.length > 15 && text.length < 2000) {
                                texts.add(text);
                            }
                        });
                        return [...texts].slice(0, 100).join('\\n\\n');
                    }
                """)

                # Extract all links
                all_links = await page.evaluate("""
                    () => {
                        return [...document.querySelectorAll('a[href]')]
                            .map(a => a.href)
                            .filter(href => href.startsWith('http'));
                    }
                """)

                # Identify downloadable files from links
                files: list[dict] = []
                for link in all_links:
                    parsed = urlparse(link)
                    path_lower = parsed.path.lower()
                    for ext in DOCUMENT_EXTENSIONS:
                        if path_lower.endswith(ext):
                            filename = parsed.path.split("/")[-1] or f"document{ext}"
                            files.append({
                                "name": filename,
                                "type": EXTENSION_TYPE_MAP.get(ext, "File"),
                                "url": link,
                                "size": "Unknown",
                            })
                            break

                logger.info(
                    "DynamicScraper: Extracted title='%s', %d links, %d files from %s",
                    title[:50], len(all_links), len(files), url,
                )

                return ScrapeResult(
                    title=title,
                    description=description,
                    text_content=text_content or "",
                    comments=[],
                    links=all_links,
                    files=files,
                    metadata={
                        "rendered": True,
                        "link_count": len(all_links),
                        "file_count": len(files),
                    },
                    source_type="dynamic",
                )

            except Exception as e:
                logger.error("DynamicScraper: Error scraping %s — %s", url, e)
                raise

            finally:
                await browser.close()
