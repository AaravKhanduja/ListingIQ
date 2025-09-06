from fastapi import APIRouter
from app.services.llm_service import LLMService
from app.config import settings

router = APIRouter(prefix="/model-info", tags=["model-info"])

# Create a global LLM service instance to get model info
llm_service = LLMService()


@router.get("/")
async def get_model_info():
    """
    Get current LLM model information
    """
    return {
        "provider": llm_service.provider.value,
        "model": llm_service.model,
        "environment": settings.ENVIRONMENT,
        "is_production": settings.is_production,
        "is_development": settings.is_development,
    }
