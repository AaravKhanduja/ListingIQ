from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from typing import Optional
from app.services.supabase import supabase_service

security = HTTPBearer()


async def get_current_user(request: Request) -> dict:
    """Dependency to get current authenticated user"""
    import logging

    logger = logging.getLogger(__name__)

    logger.info(
        f"get_current_user called, Supabase configured: {supabase_service.is_configured()}"
    )

    if not supabase_service.is_configured():
        # If Supabase is not configured, allow access (for development)
        logger.info("Supabase not configured, returning dev user")
        return {"id": "dev_user", "email": "dev@example.com"}

    auth_header = request.headers.get("Authorization")
    logger.info(f"Auth header present: {bool(auth_header)}")

    if not auth_header or not auth_header.startswith("Bearer "):
        logger.error("No valid Authorization header found")
        raise HTTPException(status_code=401, detail="Authentication required")

    token = auth_header.replace("Bearer ", "")
    logger.info(f"Token extracted, length: {len(token)}")

    user_data = await supabase_service.verify_jwt_token(token)
    logger.info(f"JWT verification result: {bool(user_data)}")

    if not user_data:
        logger.error("JWT token verification failed")
        raise HTTPException(
            status_code=401, detail="Invalid or expired authentication token"
        )

    # Map Supabase JWT fields to expected format
    user_data["id"] = user_data.get("sub")  # 'sub' is the user ID in Supabase JWT
    logger.info(f"User data mapped, user_id: {user_data.get('id')}")
    return user_data


async def get_optional_user(request: Request) -> Optional[dict]:
    """Dependency to get current user if authenticated, None otherwise"""
    try:
        if not supabase_service.is_configured():
            # If Supabase is not configured, return dev user
            return {"id": "dev_user", "email": "dev@example.com"}

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.replace("Bearer ", "")
        user_data = await supabase_service.verify_jwt_token(token)
        if user_data:
            # Map Supabase JWT fields to expected format
            user_data["id"] = user_data.get(
                "sub"
            )  # 'sub' is the user ID in Supabase JWT
        return user_data
    except Exception:
        return None


async def require_auth(request: Request) -> dict:
    """Dependency to require authentication for endpoints"""
    return await get_current_user(request)


async def optional_auth(request: Request) -> Optional[dict]:
    """Dependency to make authentication optional for endpoints"""
    return await get_optional_user(request)
