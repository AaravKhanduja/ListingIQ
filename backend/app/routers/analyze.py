# backend/api/analyze.py
from __future__ import annotations
import os
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Dict, Any
from datetime import datetime

from ..models import (
    PropertyAnalysis,
    MarketAnalysis,
    InvestmentPotential,
    RiskAssessment,
    RenovationAnalysis,
    InvestmentRecommendation,
    ManualPropertyData,
    AnalysisRequest,
    AnalysisResponse,
)
from ..services.database import DatabaseService
from ..services.llm_service import LLMService
from ..services.supabase import supabase_service
from ..middleware.auth import require_auth, optional_auth


router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_property(
    request: AnalysisRequest, current_user: dict = Depends(require_auth)
):
    """
    Analyze a property based on manual input data and provide expert insights.
    Temporarily using optional auth for testing.
    """
    try:
        # Validate required fields
        if not request.property_address:
            return AnalysisResponse(success=False, error="Property address is required")

        llm_service = LLMService()

        # Set user_id from authenticated user
        request.user_id = current_user["id"]

        analysis = await generate_property_analysis(
            address=request.property_address,
            title=request.property_title or request.property_address,
            manual_data=request.manual_data,
            user_id=request.user_id,
            llm_service=llm_service,
        )

        if not analysis:
            return AnalysisResponse(
                success=False, error="AI analysis unavailable; please try again."
            )

        # Save to Supabase if configured, otherwise use local storage
        if supabase_service.is_configured():
            await supabase_service.save_analysis(
                analysis.model_dump(), current_user["id"]
            )
        else:
            # Fallback to local storage for development
            db_service = DatabaseService()
            await db_service.save_analysis(analysis)

        return AnalysisResponse(success=True, analysis=analysis)

    except Exception as e:
        import traceback
        import logging

        # Log error for debugging (production should use proper logging)
        logging.error(f"Error in analyze_property: {e}")
        logging.error(traceback.format_exc())

        # Return generic error message in production
        if os.getenv("ENVIRONMENT") == "production":
            return AnalysisResponse(
                success=False, error="An error occurred during analysis"
            )
        else:
            return AnalysisResponse(success=False, error=str(e))


@router.get("/analyses", response_model=Dict[str, Any])
async def get_user_analyses(
    current_user: dict = Depends(optional_auth), limit: int = 50
):
    """
    Get all analyses for the authenticated user.
    Temporarily using optional auth for testing.
    """
    try:
        if current_user and supabase_service.is_configured():
            analyses = await supabase_service.get_user_analyses(
                current_user["id"], limit
            )
        else:
            # Fallback to local storage for development
            db_service = DatabaseService()
            analyses = await db_service.get_recent_analyses(limit)
            # Filter by user_id if available
            if current_user:
                analyses = [
                    a
                    for a in analyses
                    if not hasattr(a, "user_id") or a.user_id == current_user["id"]
                ]

        return {
            "success": True,
            "analyses": [
                analysis.model_dump() if hasattr(analysis, "model_dump") else analysis
                for analysis in analyses
            ],
            "count": len(analyses),
        }
    except Exception as e:
        return {"success": False, "error": str(e), "analyses": [], "count": 0}


@router.get("/analyses/{analysis_id}", response_model=Dict[str, Any])
async def get_analysis_by_id(
    analysis_id: str, current_user: dict = Depends(optional_auth)
):
    """
    Get a specific analysis by ID for the authenticated user.
    Temporarily using optional auth for testing.
    """
    try:
        if current_user and supabase_service.is_configured():
            analysis = await supabase_service.get_analysis_by_id(
                analysis_id, current_user["id"]
            )
        else:
            # Fallback to local storage for development
            db_service = DatabaseService()
            analyses = await db_service.get_recent_analyses(1000)  # Get all for search
            analysis = next(
                (
                    a
                    for a in analyses
                    if a.id == analysis_id
                    and (
                        not hasattr(a, "user_id")
                        or (
                            current_user
                            and hasattr(a, "user_id")
                            and a.user_id == current_user["id"]
                        )
                    )
                ),
                None,
            )
            if analysis:
                analysis = analysis.model_dump()

        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        return {"success": True, "analysis": analysis}
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "error": str(e), "analysis": None}


@router.delete("/analyses/{analysis_id}", response_model=Dict[str, Any])
async def delete_analysis(
    analysis_id: str, current_user: dict = Depends(optional_auth)
):
    """
    Delete a specific analysis by ID for the authenticated user.
    Temporarily using optional auth for testing.
    """
    try:
        if current_user and supabase_service.is_configured():
            success = await supabase_service.delete_analysis(
                analysis_id, current_user["id"]
            )
        else:
            # Fallback to local storage for development
            db_service = DatabaseService()
            success = await db_service.delete_analysis(analysis_id)

        if not success:
            raise HTTPException(
                status_code=404, detail="Analysis not found or access denied"
            )

        return {"success": True, "message": "Analysis deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "error": str(e)}


async def generate_property_analysis(
    *,
    address: str,
    title: str,
    manual_data: Optional[ManualPropertyData],
    user_id: str,
    llm_service: LLMService,
) -> PropertyAnalysis:
    """Generate comprehensive property analysis using expert LLM analysis"""

    # Create a comprehensive prompt for the LLM
    prompt = f"""
    You are an expert real estate investment analyst. Analyze this property based on the information provided and give your professional assessment.

    PROPERTY DETAILS:
    Address: {address}
    Title: {title}
    {f"Property Type: {manual_data.property_type}" if manual_data and manual_data.property_type else ""}
    {f"Bedrooms: {manual_data.bedrooms}" if manual_data and manual_data.bedrooms else ""}
    {f"Bathrooms: {manual_data.bathrooms}" if manual_data and manual_data.bathrooms else ""}
    {f"Square Feet: {manual_data.square_feet}" if manual_data and manual_data.square_feet else ""}
    {f"Year Built: {manual_data.year_built}" if manual_data and manual_data.year_built else ""}
    {f"Lot Size: {manual_data.lot_size}" if manual_data and manual_data.lot_size else ""}
    {f"Price: {manual_data.price}" if manual_data and manual_data.price else ""}
    {f"Location Details: {manual_data.location_details}" if manual_data and manual_data.location_details else ""}

    LISTING DESCRIPTION:
    {manual_data.listing_description if manual_data and manual_data.listing_description else "No description provided"}

    {f"ADDITIONAL NOTES: {manual_data.additional_notes}" if manual_data and manual_data.additional_notes else ""}

    TASK: Provide a concise property analysis in JSON format. Focus only on what you can determine from the provided information:

    {{
        "summary": "2-3 sentence summary of key property characteristics",
        "key_strengths": [
            "3-4 key strengths based on provided data"
        ],
        "areas_to_research": [
            "3-4 areas needing additional research"
        ],
        "hidden_risks": [
            "3-4 potential risks based on provided info"
        ],
        "questions_for_realtor": [
            "5-6 critical questions for the realtor"
        ]
    }}

    GUIDELINES:
    - Only analyze provided information
    - No market speculation or made-up data
    - Be concise and factual
    - Focus on actionable insights
    """

    try:
        import asyncio

        # Add timeout to prevent hanging
        analysis_json = await asyncio.wait_for(
            llm_service.generate_analysis(prompt),
            timeout=45.0,  # 45 second timeout
        )
    except (Exception, asyncio.TimeoutError):
        analysis_json = None

    if analysis_json:
        # Use LLM-generated analysis
        return PropertyAnalysis(
            property_address=address,
            property_title=title,
            user_id=user_id,
            overall_score=75,  # Default score for manual analysis
            summary=analysis_json.get(
                "summary", "Property analysis based on provided information"
            ),
            disclaimer="This report is generated from the information you provided and is for educational/informational purposes only. It is not real estate, investment, or financial advice. Please consult licensed professionals before making decisions.",
            manual_data=manual_data,
            market_analysis=MarketAnalysis(
                trends="Analysis based on provided property information only",
                comparables="No comparable market data available",
                appreciation_potential="Market analysis requires additional research",
            ),
            investment_potential=InvestmentPotential(
                rental_income="Requires market research and property condition assessment",
                cash_flow="Based on provided property details only",
                roi_projections="Market analysis needed for accurate projections",
                appreciation_timeline="Requires local market research",
            ),
            risk_assessment=RiskAssessment(
                market_risks=["Market conditions require local research"],
                property_risks=analysis_json.get(
                    "hidden_risks", ["Analysis based on provided information"]
                ),
                mitigation_strategies=[
                    "Conduct thorough due diligence and inspections"
                ],
            ),
            renovation_analysis=RenovationAnalysis(
                estimated_costs="Property condition assessment needed",
                priority_improvements=["Based on property details provided"],
                renovation_roi="Requires local market analysis",
            ),
            investment_recommendation=InvestmentRecommendation(
                recommendation="Research",
                ideal_buyer="Based on property characteristics",
                timeline="Requires market research",
            ),
            strengths=analysis_json.get(
                "key_strengths", ["Property analysis completed"]
            ),
            weaknesses=analysis_json.get(
                "areas_to_research", ["Analysis based on provided information"]
            ),
            hidden_issues=analysis_json.get(
                "hidden_risks", ["Analysis based on provided information"]
            ),
            questions=analysis_json.get(
                "questions_for_realtor", ["What additional information do you need?"]
            ),
            generated_at=datetime.now().isoformat(),
        )
    else:
        # Fallback if LLM fails
        return PropertyAnalysis(
            property_address=address,
            property_title=title,
            user_id=user_id,
            overall_score=70,
            summary="Property analysis based on provided information. AI analysis was unavailable.",
            disclaimer="This report is generated from the information you provided and is for educational/informational purposes only. It is not real estate, investment, or financial advice. Please consult licensed professionals before making decisions.",
            manual_data=manual_data,
            market_analysis=MarketAnalysis(
                trends="Analysis based on provided property information only",
                comparables="No comparable market data available",
                appreciation_potential="Market analysis requires additional research",
            ),
            investment_potential=InvestmentPotential(
                rental_income="Requires market research and property condition assessment",
                cash_flow="Based on provided property details only",
                roi_projections="Market analysis needed for accurate projections",
                appreciation_timeline="Requires local market research",
            ),
            risk_assessment=RiskAssessment(
                market_risks=["Market conditions require local research"],
                property_risks=[
                    "Property condition unknown",
                    "Additional research recommended",
                ],
                mitigation_strategies=[
                    "Conduct thorough due diligence and inspections"
                ],
            ),
            renovation_analysis=RenovationAnalysis(
                estimated_costs="Property condition assessment needed",
                priority_improvements=["Based on property details provided"],
                renovation_roi="Requires local market analysis",
            ),
            investment_recommendation=InvestmentRecommendation(
                recommendation="Research",
                ideal_buyer="Based on property characteristics",
                timeline="Requires market research",
            ),
            strengths=["Property analysis completed"],
            weaknesses=["Areas requiring additional research"],
            hidden_issues=[
                "Property condition unknown",
                "Additional research recommended",
            ],
            questions=[
                "What is the current property condition?",
                "Are there any recent renovations?",
                "What is the rental history?",
                "What are the local market conditions?",
                "What comparable properties have sold recently?",
            ],
            generated_at=datetime.now().isoformat(),
        )
