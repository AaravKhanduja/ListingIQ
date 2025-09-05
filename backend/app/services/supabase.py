import os
from typing import Optional, Dict, Any
from supabase import create_client
import jwt
from datetime import datetime, timezone


class SupabaseService:
    @staticmethod
    def utc_now() -> datetime:
        """Get current UTC time with timezone awareness"""
        return datetime.now(timezone.utc)

    @staticmethod
    def utc_timestamp() -> float:
        """Get current UTC timestamp (seconds since epoch)"""
        return datetime.now(timezone.utc).timestamp()

    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        self.jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

        if not all(
            [self.supabase_url, self.supabase_service_key, self.supabase_anon_key]
        ):
            self.client = None
        else:
            self.client = create_client(self.supabase_url, self.supabase_service_key)

    def is_configured(self) -> bool:
        """Check if Supabase is properly configured"""
        return self.client is not None

    async def verify_jwt_token(
        self, token: str, check_expiring_soon: bool = False
    ) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return user data"""
        if not self.is_configured():
            return None

        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith("Bearer "):
                token = token[7:]

            # Verify the token
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
                leeway=60,  # Allow 60 seconds of clock skew
            )

            # Check if token is expired using direct timestamp comparison (UTC)
            current_timestamp = self.utc_timestamp()
            token_exp_timestamp = payload["exp"]

            if token_exp_timestamp <= current_timestamp:
                return None

            # Check if token is expiring soon (within 5 minutes)
            if check_expiring_soon:
                time_until_expiry = token_exp_timestamp - current_timestamp
                if time_until_expiry <= 300:  # 5 minutes = 300 seconds
                    pass  # Could log this in production if needed

            return payload
        except jwt.InvalidTokenError:
            return None
        except Exception:
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user data by ID"""
        if not self.is_configured():
            return None

        try:
            response = (
                self.client.table("users").select("*").eq("id", user_id).execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception:
            return None

    async def create_user_profile(
        self, user_id: str, email: str, **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Create a user profile in the users table"""
        if not self.is_configured():
            return None

        try:
            user_data = {
                "id": user_id,
                "email": email,
                "created_at": self.utc_now().isoformat(),
                "updated_at": self.utc_now().isoformat(),
                **kwargs,
            }

            response = self.client.table("users").insert(user_data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception:
            return None

    async def save_analysis(
        self, analysis_data: Dict[str, Any], user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Save analysis to Supabase database"""
        if not self.is_configured():
            return None

        try:
            analysis_data["user_id"] = user_id
            analysis_data["created_at"] = self.utc_now().isoformat()
            analysis_data["updated_at"] = self.utc_now().isoformat()

            response = self.client.table("analyses").insert(analysis_data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception:
            return None

    async def get_user_analyses(self, user_id: str, limit: int = 50) -> list:
        """Get analyses for a specific user"""
        if not self.is_configured():
            return []

        try:
            response = (
                self.client.table("analyses")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )

            return response.data or []
        except Exception:
            return []

    async def get_analysis_by_id(
        self, analysis_id: str, user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get analysis by ID for a specific user"""
        if not self.is_configured():
            return None

        try:
            response = (
                self.client.table("analyses")
                .select("*")
                .eq("id", analysis_id)
                .eq("user_id", user_id)
                .execute()
            )

            if response.data:
                return response.data[0]
            return None
        except Exception:
            return None

    async def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        """Delete analysis by ID for a specific user"""
        if not self.is_configured():
            return False

        try:
            response = (
                self.client.table("analyses")
                .delete()
                .eq("id", analysis_id)
                .eq("user_id", user_id)
                .execute()
            )

            return len(response.data) > 0
        except Exception:
            return False


# Global instance
supabase_service = SupabaseService()
