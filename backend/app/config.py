from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Company OS API"
    debug: bool = False
    api_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./company_os.db"
    redis_url: str = ""

    jwt_secret: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    upload_dir: str = "uploads"
    max_upload_size_mb: int = 50

    ai_provider: str = "openai"
    ai_model: str = "gpt-4"
    ai_api_key: Optional[str] = None
    ai_base_url: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from: str = "noreply@companyos.com"

    rate_limit_per_minute: int = 60

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
