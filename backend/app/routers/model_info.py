from fastapi import APIRouter
from app.services.llm_service import LLMService
from app.config import settings

router = APIRouter(prefix="/model-info", tags=["model-info"])


@router.get("/")
async def get_model_info():
    """
    Get current LLM model information
    """
    # Create LLM service instance when needed (after env vars are loaded)
    llm_service = LLMService()

    return {
        "provider": llm_service.provider.value,
        "model": llm_service.model,
        "environment": settings.ENVIRONMENT,
        "is_production": settings.is_production,
        "is_development": settings.is_development,
    }
