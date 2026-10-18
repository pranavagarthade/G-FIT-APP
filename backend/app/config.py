from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    database_url: str = ""
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""
    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_vision_model: str = "gpt-4o-mini"
    openai_transcription_model: str = "gpt-4o-mini-transcribe"
    openai_embedding_model: str = "text-embedding-3-small"
    chat_rate_limit_per_minute: int = 20
    image_retention_days: int = 30
    allow_unauthenticated: bool = True
    admin_ingest_key: str = ""
    admin_challenge_key: str = ""

    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")


settings = Settings()
