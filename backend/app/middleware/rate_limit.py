import time
from collections import defaultdict
from fastapi import Request, HTTPException
from typing import Dict
from app.config import settings


class RateLimiter:
    def __init__(self, requests_per_minute: int = 60, burst_limit: int = 120):
        self.requests_per_minute = requests_per_minute
        self.burst_limit = burst_limit
        self.requests: Dict[str, list] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        minute_ago = now - 60

        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip] if req_time > minute_ago
        ]

        # Check burst limit first (more lenient)
        if len(self.requests[client_ip]) >= self.burst_limit:
            return False

        # Check regular rate limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return False

        # Add current request
        self.requests[client_ip].append(now)
        return True


# Global rate limiter instance - will be configured by settings
rate_limiter = None


def initialize_rate_limiter():
    """Initialize rate limiter with settings"""
    global rate_limiter
    config = settings.rate_limit_config
    rate_limiter = RateLimiter(
        requests_per_minute=config["requests_per_minute"],
        burst_limit=config["burst_limit"],
    )


async def rate_limit_middleware(request: Request):
    """Rate limiting middleware"""
    global rate_limiter

    # Initialize if not done yet
    if rate_limiter is None:
        initialize_rate_limiter()

    client_ip = request.client.host

    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": "60"},
        )
