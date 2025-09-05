import os
from dotenv import load_dotenv
import time
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.routers import analyze
from app.middleware.rate_limit import rate_limit_middleware
from app.middleware.validation import validate_request_middleware
from app.services.logger import logger
from app.config import settings

# Load environment variables FIRST
load_dotenv()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered insights for real estate listings",
    version=settings.VERSION,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

# Production security middleware
if settings.is_production:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    allow_credentials=True,
)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    # Add security headers
    for header, value in settings.security_headers.items():
        response.headers[header] = value

    return response


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    # Log request
    user_id = None
    if hasattr(request.state, "user"):
        user_id = request.state.user.get("id")

    logger.log_request(
        method=request.method,
        path=str(request.url.path),
        status_code=response.status_code,
        duration=process_time,
        user_id=user_id,
    )

    response.headers["X-Process-Time"] = str(process_time)
    return response


# Rate limiting middleware
@app.middleware("http")
async def rate_limit(request: Request, call_next):
    await rate_limit_middleware(request)
    return await call_next(request)


# Request validation middleware
@app.middleware("http")
async def validate_request(request: Request, call_next):
    validate_request_middleware(request)
    return await call_next(request)


app.include_router(analyze.router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    import psutil

    # Basic health check
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }

    # Add system metrics in production
    if os.getenv("ENVIRONMENT") == "production":
        try:
            health_data.update(
                {
                    "system": {
                        "cpu_percent": psutil.cpu_percent(interval=1),
                        "memory_percent": psutil.virtual_memory().percent,
                        "disk_percent": psutil.disk_usage("/").percent,
                    }
                }
            )
        except Exception:
            pass  # Don't fail health check if metrics unavailable

    return health_data


@app.get("/metrics")
async def metrics():
    """Prometheus-style metrics endpoint"""
    import psutil

    metrics_data = {
        "listingiq_requests_total": 0,  # Would be incremented by middleware
        "listingiq_requests_duration_seconds": 0.0,
        "listingiq_errors_total": 0,
        "system_cpu_percent": psutil.cpu_percent(interval=1),
        "system_memory_percent": psutil.virtual_memory().percent,
        "system_disk_percent": psutil.disk_usage("/").percent,
    }

    return metrics_data
