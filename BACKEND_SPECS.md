# Backend Specification & Blueprint: WebIntel AI Core

## 1. Executive Overview
Backend `WebIntel AI` adalah REST API & WebSocket service berkinerja tinggi berbasis **Python FastAPI**.
Backend ini bertindak sebagai Orchestrator yang menerima instruksi *natural language* dan URL dari frontend, menentukan strategi *scraping* yang tepat, mengolah data mentah melalui LLM (OpenAI/Gemini API), dan mengembalikan response berformat JSON yang selaras dengan TypeScript interfaces di `src/types/index.ts`.

---

## 2. Tech Stack & Environment
- **Framework:** FastAPI (Python 3.11+)
- **ASGI Server:** Uvicorn
- **Scraping Engines:**
  - `Playwright` (Async): Untuk SPA, Google Maps, & Social Media (Instagram, TikTok, X).
  - `httpx` + `BeautifulSoup4`: Untuk scraping situs statis & pengunduhan dokumen cepat.
  - `yt-dlp`: Untuk ekstraksi metadata & komentar YouTube.
- **AI / LLM Integration:** `langchain-core` / `google-genai` / `openai` (Menggunakan Structured Outputs / Pydantic JSON parser).
- **Data Validation & Schemas:** Pydantic v2.
- **Async Task Queue (Optional for heavy batching):** `Celery` / `BackgroundTasks` bawaan FastAPI.

---

## 3. Recommended Directory Structure
```text
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── scraper.py       # Main scraping & processing API
│   │   │   │   ├── chat.py          # Follow-up conversational API
│   │   │   │   └── export.py        # CSV/ZIP generation
│   │   │   └── router.py
│   ├── core/
│   │   ├── config.py                # Environment variables & settings
│   │   └── security.py              # Stealth browser configurations & cookies
│   ├── schemas/
│   │   ├── request.py               # Incoming payload schemas
│   │   └── response.py              # Outgoing payload schemas (Sync with frontend types)
│   ├── services/
│   │   ├── router_service.py        # Intent Router & URL Domain Classifier
│   │   ├── llm_service.py           # LLM analysis (Sentiment, Summary, Filter)
│   │   └── scrapers/
│   │       ├── base.py              # Base Scraper Interface
│   │       ├── generic_scraper.py   # BS4 / Fast Async Scraper
│   │       ├── playwright_scraper.py# Headless Playwright Worker (Maps & Social)
│   │       ├── youtube_scraper.py   # yt-dlp Core Wrapper
│   │       └── document_scraper.py  # PDF/Doc Harvester
│   └── main.py                      # FastAPI App Initialization & CORS Setup
├── requirements.txt
└── .env.example