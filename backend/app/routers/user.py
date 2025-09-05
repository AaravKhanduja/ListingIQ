from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.services.supabase import supabase_service
from app.middleware.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["user"])


@router.delete("/account")
async def delete_account(
    authorization: Optional[str] = Header(None),
    current_user: dict = Depends(get_current_user),
):
    """
    Delete user account and all associated data.
    This endpoint requires authentication and will:
    1. Delete all user's saved analyses
    2. Delete the user account from Supabase Auth
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid user data")

    try:
        # First, delete all user's saved analyses
        logger.info(f"Deleting analyses for user {user_id}")

        # Delete from saved_analyses table
        supabase_service.client.table("saved_analyses").delete().eq(
            "user_id", user_id
        ).execute()

        # Also delete from analyses table if it exists
        try:
            supabase_service.client.table("analyses").delete().eq(
                "user_id", user_id
            ).execute()
        except Exception as e:
            logger.warning(f"Could not delete from analyses table: {e}")

        # Delete the user account using admin privileges
        logger.info(f"Deleting user account {user_id}")
        delete_user_response = supabase_service.client.auth.admin.delete_user(user_id)

        if delete_user_response.get("error"):
            logger.error(
                f"Failed to delete user account: {delete_user_response['error']}"
            )
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete user account: {delete_user_response['error']['message']}",
            )

        logger.info(f"Successfully deleted user account {user_id}")

        return {
            "success": True,
            "message": "Account and all associated data have been deleted successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while deleting your account",
        )


@router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: str, current_user: dict = Depends(get_current_user)
):
    """
    Delete a specific analysis for the authenticated user.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid user data")

    try:
        # Delete from saved_analyses table
        delete_response = (
            supabase_service.client.table("saved_analyses")
            .delete()
            .eq("id", analysis_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not delete_response.data:
            raise HTTPException(
                status_code=404,
                detail="Analysis not found or you don't have permission to delete it",
            )

        return {"success": True, "message": "Analysis deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error deleting analysis {analysis_id} for user {user_id}: {str(e)}"
        )
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while deleting the analysis",
        )
