from fastapi import Request, HTTPException
import re


def validate_request_middleware(request: Request):
    """Request validation middleware for security"""

    # Check for suspicious headers
    suspicious_headers = [
        "x-forwarded-for",
        "x-real-ip",
        "x-forwarded-proto",
        "x-forwarded-host",
    ]

    for header in suspicious_headers:
        if header in request.headers:
            # Log suspicious header (in production, send to monitoring)
            pass

    # Check for SQL injection patterns in query params
    sql_patterns = [
        r"(\b(union|select|insert|update|delete|drop|create|alter)\b)",
        r"(\b(exec|execute|script|javascript)\b)",
        r"(\b(union|select|insert|update|delete|drop|create|alter)\b)",
        r"(\b(union|select|insert|update|delete|drop|create|alter)\b)",
    ]

    query_string = str(request.query_params)
    for pattern in sql_patterns:
        if re.search(pattern, query_string, re.IGNORECASE):
            raise HTTPException(status_code=400, detail="Invalid request parameters")

    # Check request size (prevent large payload attacks)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=413, detail="Request too large")
