from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment-specific defaults"""

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "ListingIQ API"
    VERSION: str = "1.0.0"

    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # Production Security
    REQUIRE_HTTPS: bool = False
    SECURE_COOKIES: bool = False
    SESSION_COOKIE_SECURE: bool = False
    CSRF_PROTECTION: bool = True

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    ALLOWED_HOSTS: list = ["*"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Database
    DATABASE_URL: str = "sqlite:///./local_analyses.db"

    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None

    # LLM Configuration
    LLM_PROVIDER: str = "ollama"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    OLLAMA_MODEL: str = "llama3.2:3b"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json or text

    # Monitoring
    ENABLE_METRICS: bool = True
    ENABLE_HEALTH_CHECKS: bool = True

    # Performance
    MAX_WORKERS: int = 4
    REQUEST_TIMEOUT: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    @property
    def cors_origins(self) -> list:
        """Get CORS origins based on environment"""
        if self.is_production:
            return [self.FRONTEND_ORIGIN] if self.FRONTEND_ORIGIN else []
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    @property
    def allowed_hosts(self) -> list:
        """Get allowed hosts based on environment"""
        if self.is_production:
            # In production, allow specific hosts or all if explicitly set
            if self.ALLOWED_HOSTS == ["*"]:
                return ["*"]  # Allow all hosts in production if explicitly set
            return self.ALLOWED_HOSTS
        return ["*"]  # Allow all hosts in development

    @property
    def security_headers(self) -> dict:
        """Get security headers based on environment"""
        headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        }

        if self.is_production:
            headers.update(
                {
                    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
                    "Content-Security-Policy": "default-src 'self'",
                    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
                }
            )

        return headers

    @property
    def rate_limit_config(self) -> dict:
        """Get rate limiting configuration"""
        if self.is_production:
            return {
                "requests_per_minute": self.RATE_LIMIT_PER_MINUTE,
                "burst_limit": self.RATE_LIMIT_PER_MINUTE * 2,
                "window_size": 60,
            }
        return {
            "requests_per_minute": 1000,  # More lenient in development
            "burst_limit": 2000,
            "window_size": 60,
        }


# Global settings instance
settings = Settings()
