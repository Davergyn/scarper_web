"""
WebIntel AI - YouTube Scraper

Uses yt-dlp to extract video metadata, comments,
and engagement data from YouTube URLs.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime

from app.scrapers.base import BaseScraper, ScrapeResult

logger = logging.getLogger(__name__)


class YouTubeScraper(BaseScraper):
    """
    Scraper for YouTube videos using yt-dlp.
    Extracts:
    - Video title, description, channel info
    - View/like/comment counts
    - Top-level comments (up to max_comments)
    """

    def __init__(self, max_comments: int = 100):
        self.max_comments = max_comments

    async def scrape(self, url: str, prompt: str = "") -> ScrapeResult:
        """Extract video info and comments from a YouTube URL."""
        logger.info("YouTubeScraper: Extracting from %s", url)

        # Run yt-dlp in a thread pool (it's synchronous)
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, self._extract_info, url)

        if info is None:
            logger.error("YouTubeScraper: Failed to extract info from %s", url)
            return ScrapeResult(
                title="Extraction Failed",
                description=f"Could not extract data from {url}",
                source_type="youtube",
            )

        # Parse video metadata
        title = info.get("title", "Unknown Title")
        description = info.get("description", "")
        channel = info.get("channel", info.get("uploader", "Unknown"))
        view_count = info.get("view_count", 0)
        like_count = info.get("like_count", 0)
        comment_count = info.get("comment_count", 0)
        upload_date = info.get("upload_date", "")
        duration = info.get("duration", 0)

        # Format upload date
        formatted_date = ""
        if upload_date:
            try:
                dt = datetime.strptime(upload_date, "%Y%m%d")
                formatted_date = dt.strftime("%Y-%m-%d")
            except ValueError:
                formatted_date = upload_date

        # Parse comments
        raw_comments = info.get("comments", []) or []
        comments = []
        for i, comment in enumerate(raw_comments[: self.max_comments]):
            comments.append({
                "id": str(i + 1),
                "author": comment.get("author", "Anonymous"),
                "text": comment.get("text", ""),
                "likes": comment.get("like_count", 0),
                "date": comment.get("timestamp", ""),
                "is_favorited": comment.get("is_favorited", False),
            })

        logger.info(
            "YouTubeScraper: Extracted '%s' by %s — %d views, %d comments fetched",
            title, channel, view_count, len(comments),
        )

        return ScrapeResult(
            title=title,
            description=description,
            text_content=description,
            comments=comments,
            links=[url],
            files=[],
            metadata={
                "channel": channel,
                "view_count": view_count,
                "like_count": like_count,
                "comment_count": comment_count,
                "upload_date": formatted_date,
                "duration_seconds": duration,
                "comments_fetched": len(comments),
            },
            source_type="youtube",
        )

    def _extract_info(self, url: str) -> dict | None:
        """Synchronous yt-dlp extraction (runs in thread pool)."""
        try:
            import yt_dlp

            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "skip_download": True,
                "getcomments": True,
                "extractor_args": {
                    "youtube": {
                        "max_comments": [str(self.max_comments)],
                        "comment_sort": ["top"],
                    }
                },
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(url, download=False)

        except Exception as e:
            logger.error("YouTubeScraper: yt-dlp error — %s", e)
            return None
