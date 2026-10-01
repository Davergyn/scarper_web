"""
WebIntel AI - LLM Service

Uses OpenAI-compatible API (via OpenRouter) to analyze scraped data
and produce structured AI insights, sentiment analysis, and KPIs.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import date

from openai import AsyncOpenAI

from app.core.config import settings
from app.scrapers.base import ScrapeResult
from app.schemas.scraper import (
    AIInsight,
    KPIStat,
    SentimentData,
    ScrapedRow,
    FileItem,
    ChangeType,
    SentimentType,
)

logger = logging.getLogger(__name__)

# OpenRouter-compatible client
_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    """Lazy-init the OpenAI client pointing to OpenRouter."""
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
        )
    return _client


ANALYSIS_SYSTEM_PROMPT = """You are WebIntel AI, a data analysis engine. You receive raw scraped web data and must return a JSON analysis.

You MUST respond with ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "aiInsight": {
    "summary": "2-3 sentence executive summary of the data",
    "keyFindings": ["finding 1", "finding 2", "finding 3", "finding 4"],
    "recommendation": "1-2 sentence actionable recommendation"
  },
  "sentimentBreakdown": {
    "positive": <count_number>,
    "negative": <count_number>,
    "neutral": <count_number>
  },
  "items": [
    {
      "title": "short title for this item",
      "sentiment": "positive" | "negative" | "neutral",
      "score": <0.0 to 1.0>,
      "content": "the actual text content (max 200 chars)"
    }
  ]
}

Rules:
- Analyze ALL items provided, classify sentiment for each
- Score: 0.0 = very negative, 0.5 = neutral, 1.0 = very positive
- Summary and findings should be in Bahasa Indonesia
- keyFindings must have exactly 4 items
- items array should contain analysis of each piece of content
- If user provides a prompt/instruction, follow it to filter or focus the analysis"""


async def analyze_with_llm(
    scrape_result: ScrapeResult,
    prompt: str = "",
) -> dict:
    """
    Send scraped data to LLM for analysis and return structured results.

    Returns a dict with keys: aiInsight, kpiStats, sentimentData, tableData
    """
    client = _get_client()

    # Build the content to analyze
    content_parts = []
    if scrape_result.title:
        content_parts.append(f"Page Title: {scrape_result.title}")
    if scrape_result.description:
        content_parts.append(f"Description: {scrape_result.description}")

    # Add comments (YouTube, social media)
    if scrape_result.comments:
        content_parts.append(f"\n--- {len(scrape_result.comments)} Comments/Reviews ---")
        for i, comment in enumerate(scrape_result.comments[:50]):  # Limit to 50
            text = comment.get("text", comment.get("content", ""))
            author = comment.get("author", "Unknown")
            content_parts.append(f"[{i+1}] @{author}: {text[:300]}")

    # Add text content if no comments
    if not scrape_result.comments and scrape_result.text_content:
        # Split into chunks for analysis
        paragraphs = scrape_result.text_content.split("\n\n")[:30]
        content_parts.append(f"\n--- {len(paragraphs)} Text Sections ---")
        for i, para in enumerate(paragraphs):
            content_parts.append(f"[{i+1}] {para[:300]}")

    raw_content = "\n".join(content_parts)

    # Build user message
    user_message = f"Analyze this scraped data:\n\n{raw_content}"
    if prompt:
        user_message += f"\n\nUser instruction: {prompt}"

    logger.info("LLM Service: Sending %d chars to LLM for analysis", len(user_message))

    try:
        response = await client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        raw_json = response.choices[0].message.content.strip()
        # Clean markdown code blocks if present
        if raw_json.startswith("```"):
            raw_json = raw_json.split("\n", 1)[1]
            raw_json = raw_json.rsplit("```", 1)[0]

        analysis = json.loads(raw_json)
        logger.info("LLM Service: Analysis complete")
        return _transform_analysis(analysis, scrape_result)

    except json.JSONDecodeError as e:
        logger.error("LLM Service: Failed to parse LLM JSON — %s", e)
        return _build_fallback_result(scrape_result)
    except Exception as e:
        logger.error("LLM Service: LLM API error — %s", e)
        return _build_fallback_result(scrape_result)


def _transform_analysis(analysis: dict, scrape_result: ScrapeResult) -> dict:
    """Transform raw LLM JSON output into our schema-compatible structures."""
    today = date.today().isoformat()
    source_label = _get_source_label(scrape_result.source_type)

    # AI Insight
    ai_raw = analysis.get("aiInsight", {})
    ai_insight = AIInsight(
        summary=ai_raw.get("summary", "Analisis selesai."),
        keyFindings=ai_raw.get("keyFindings", ["Data berhasil dianalisis"])[:4],
        recommendation=ai_raw.get("recommendation", "Lakukan analisis lebih lanjut."),
    )

    # Sentiment breakdown
    sentiment_raw = analysis.get("sentimentBreakdown", {})
    pos_count = sentiment_raw.get("positive", 0)
    neg_count = sentiment_raw.get("negative", 0)
    neu_count = sentiment_raw.get("neutral", 0)
    total = pos_count + neg_count + neu_count or 1

    sentiment_data = [
        SentimentData(name="Positive", value=pos_count, color="#10b981"),
        SentimentData(name="Negative", value=neg_count, color="#ef4444"),
        SentimentData(name="Neutral", value=neu_count, color="#6366f1"),
    ]

    # KPI Stats
    pos_pct = round((pos_count / total) * 100, 1)
    neg_pct = round((neg_count / total) * 100, 1)

    kpi_stats = [
        KPIStat(label="Total Data Extracted", value=str(total), icon="database",
                change=f"{total} items", changeType=ChangeType.POSITIVE),
        KPIStat(label="Positive Sentiment", value=f"{pos_pct}%", icon="trending-up",
                change=f"+{pos_count}", changeType=ChangeType.POSITIVE),
        KPIStat(label="Negative Sentiment", value=f"{neg_pct}%", icon="trending-down",
                change=f"{neg_count}", changeType=ChangeType.NEGATIVE if neg_count > 0 else ChangeType.NEUTRAL),
        KPIStat(label="Source", value=source_label, icon="clock",
                changeType=ChangeType.NEUTRAL),
    ]

    # Table data from LLM items
    items_raw = analysis.get("items", [])
    table_data: list[ScrapedRow] = []
    for i, item in enumerate(items_raw):
        sentiment_str = item.get("sentiment", "neutral")
        try:
            sentiment = SentimentType(sentiment_str)
        except ValueError:
            sentiment = SentimentType.NEUTRAL

        table_data.append(ScrapedRow(
            id=str(i + 1),
            title=item.get("title", f"Item {i+1}"),
            source=source_label,
            sentiment=sentiment,
            score=max(0.0, min(1.0, item.get("score", 0.5))),
            date=today,
            content=item.get("content", "")[:500],
            url=scrape_result.links[0] if scrape_result.links else None,
        ))

    # Files from scraper
    files: list[FileItem] = []
    for i, f in enumerate(scrape_result.files):
        files.append(FileItem(
            id=str(i + 1),
            name=f.get("name", f"file_{i+1}"),
            type=f.get("type", "File"),
            size=f.get("size", "Unknown"),
            url=f.get("url", "#"),
        ))

    return {
        "aiInsight": ai_insight,
        "kpiStats": kpi_stats,
        "sentimentData": sentiment_data,
        "tableData": table_data,
        "files": files,
    }


def _build_fallback_result(scrape_result: ScrapeResult) -> dict:
    """Build a basic result when LLM analysis fails."""
    today = date.today().isoformat()
    source_label = _get_source_label(scrape_result.source_type)

    # Build table data from raw content
    table_data: list[ScrapedRow] = []

    if scrape_result.comments:
        for i, comment in enumerate(scrape_result.comments[:20]):
            text = comment.get("text", comment.get("content", ""))
            table_data.append(ScrapedRow(
                id=str(i + 1),
                title=text[:60] + "..." if len(text) > 60 else text,
                source=source_label,
                sentiment=SentimentType.NEUTRAL,
                score=0.5,
                date=today,
                content=text[:500],
                url=scrape_result.links[0] if scrape_result.links else None,
            ))
    elif scrape_result.text_content:
        paragraphs = [p for p in scrape_result.text_content.split("\n\n") if p.strip()]
        for i, para in enumerate(paragraphs[:20]):
            table_data.append(ScrapedRow(
                id=str(i + 1),
                title=para[:60] + "..." if len(para) > 60 else para,
                source=source_label,
                sentiment=SentimentType.NEUTRAL,
                score=0.5,
                date=today,
                content=para[:500],
            ))

    total = len(table_data)

    files: list[FileItem] = []
    for i, f in enumerate(scrape_result.files):
        files.append(FileItem(
            id=str(i + 1),
            name=f.get("name", f"file_{i+1}"),
            type=f.get("type", "File"),
            size=f.get("size", "Unknown"),
            url=f.get("url", "#"),
        ))

    return {
        "aiInsight": AIInsight(
            summary=f"Berhasil mengekstrak {total} item dari {scrape_result.title or 'halaman web'}. Analisis AI tidak tersedia (fallback mode).",
            keyFindings=[
                f"Total {total} item berhasil diekstrak",
                f"Sumber: {source_label}",
                f"Ditemukan {len(scrape_result.files)} file",
                "Analisis sentimen memerlukan koneksi LLM",
            ],
            recommendation="Pastikan koneksi ke LLM API aktif untuk mendapatkan analisis sentimen penuh.",
        ),
        "kpiStats": [
            KPIStat(label="Total Data Extracted", value=str(total), icon="database",
                    changeType=ChangeType.POSITIVE),
            KPIStat(label="Positive Sentiment", value="N/A", icon="trending-up",
                    changeType=ChangeType.NEUTRAL),
            KPIStat(label="Negative Sentiment", value="N/A", icon="trending-down",
                    changeType=ChangeType.NEUTRAL),
            KPIStat(label="Source", value=source_label, icon="clock",
                    changeType=ChangeType.NEUTRAL),
        ],
        "sentimentData": [
            SentimentData(name="Positive", value=0, color="#10b981"),
            SentimentData(name="Negative", value=0, color="#ef4444"),
            SentimentData(name="Neutral", value=total, color="#6366f1"),
        ],
        "tableData": table_data,
        "files": files,
    }


def _get_source_label(source_type: str) -> str:
    """Map scraper source_type to a human-readable label."""
    return {
        "youtube": "YouTube Comment",
        "dynamic": "Dynamic Page",
        "general": "Web Page",
    }.get(source_type, "Web Page")
