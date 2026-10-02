"""
WebIntel AI - Application Configuration
Loads environment variables using pydantic-settings.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # LLM via OpenRouter
    OPENROUTER_API_KEY: str | None = None
    LLM_MODEL: str = "google/gemini-flash-1.5"

    # LLM (legacy placeholders, kept for reference)
    OPENAI_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None


settings = Settings()
