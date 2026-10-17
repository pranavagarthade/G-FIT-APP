from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_vision_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    chat_rate_limit_per_minute: int = 20
    image_retention_days: int = 30
    allow_unauthenticated: bool = True
    admin_ingest_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
