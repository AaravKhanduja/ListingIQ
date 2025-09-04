# backend/api/analyze.py
from __future__ import annotations
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
        # Debug logging
        print(f"🔍 Received request: {request}")
        print("🔍 Using dev user for development")

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
        print(f"❌ Error in analyze_property: {e}")
        import traceback

        traceback.print_exc()
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

    TASK: Provide a comprehensive property analysis in the following JSON format. Focus on being practical, actionable, and identifying real risks and opportunities:

    {{
        "summary": "A concise 2-3 sentence summary of the property's overall appeal and key characteristics",
        "strengths": [
            "3-5 key strengths of this property - be specific and actionable",
            "Focus on location, condition, features, market position, etc."
        ],
        "weaknesses": [
            "3-5 areas of concern or limitations - be honest and specific",
            "Include potential red flags, maintenance issues, market risks, etc."
        ],
        "hidden_risks": [
            "3-5 hidden risks or issues that might not be immediately obvious",
            "Think about structural issues, neighborhood changes, market timing, etc."
        ],
        "questions_for_realtor": [
            "5-7 critical questions a buyer should ask their realtor",
            "Focus on verification, due diligence, and decision-making factors"
        ],
        "market_analysis": {{
            "trends": "Current market conditions and trends for this type of property",
            "comparables": "How this property compares to similar properties in the area",
            "appreciation_potential": "Realistic assessment of appreciation potential"
        }},
        "investment_potential": {{
            "rental_income": "Assessment of rental income potential if applicable",
            "cash_flow": "Cash flow considerations for investors",
            "roi_projections": "Realistic ROI expectations",
            "appreciation_timeline": "Expected timeline for appreciation"
        }},
        "risk_assessment": {{
            "market_risks": ["Specific market risks to consider"],
            "property_risks": ["Property-specific risks and concerns"],
            "mitigation_strategies": ["How to mitigate identified risks"]
        }},
        "renovation_analysis": {{
            "estimated_costs": "Estimated renovation costs if needed",
            "priority_improvements": ["Priority improvements that would add value"],
            "renovation_roi": "Expected ROI on renovations"
        }}
    }}

    IMPORTANT GUIDELINES:
    - Be honest and realistic - don't sugar-coat issues
    - Focus on actionable insights that help buyers make informed decisions
    - Consider both immediate and long-term factors
    - Think like an experienced investor who has seen many properties
    - Highlight both opportunities and risks
    - Be specific rather than generic
    """

    try:
        analysis_json = await llm_service.generate_analysis(prompt)
    except Exception as e:
        print(f"❌ LLM analysis failed: {e}")
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
                trends=analysis_json.get("market_analysis", {}).get(
                    "trends", "Based on provided information"
                ),
                comparables=analysis_json.get("market_analysis", {}).get(
                    "comparables", "Based on provided information"
                ),
                appreciation_potential=analysis_json.get("market_analysis", {}).get(
                    "appreciation_potential", "Based on provided information"
                ),
            ),
            investment_potential=InvestmentPotential(
                rental_income=analysis_json.get("investment_potential", {}).get(
                    "rental_income", "Based on provided information"
                ),
                cash_flow=analysis_json.get("investment_potential", {}).get(
                    "cash_flow", "Based on provided information"
                ),
                roi_projections=analysis_json.get("investment_potential", {}).get(
                    "roi_projections", "Based on provided information"
                ),
                appreciation_timeline=analysis_json.get("investment_potential", {}).get(
                    "appreciation_timeline", "Based on provided information"
                ),
            ),
            risk_assessment=RiskAssessment(
                market_risks=analysis_json.get("risk_assessment", {}).get(
                    "market_risks", ["Based on provided information"]
                ),
                property_risks=analysis_json.get("risk_assessment", {}).get(
                    "property_risks", ["Based on provided information"]
                ),
                mitigation_strategies=analysis_json.get("risk_assessment", {}).get(
                    "mitigation_strategies", ["Based on provided information"]
                ),
            ),
            renovation_analysis=RenovationAnalysis(
                estimated_costs=analysis_json.get("renovation_analysis", {}).get(
                    "estimated_costs", "Based on provided information"
                ),
                priority_improvements=analysis_json.get("renovation_analysis", {}).get(
                    "priority_improvements", ["Based on provided information"]
                ),
                renovation_roi=analysis_json.get("renovation_analysis", {}).get(
                    "renovation_roi", "Based on provided information"
                ),
            ),
            investment_recommendation=InvestmentRecommendation(
                recommendation="Consider",
                ideal_buyer="Based on analysis",
                timeline="Based on analysis",
            ),
            strengths=analysis_json.get("strengths", ["Property analysis completed"]),
            weaknesses=analysis_json.get(
                "weaknesses", ["Analysis based on provided information"]
            ),
            hidden_issues=analysis_json.get(
                "hidden_risks", ["Analysis based on provided information"]
            ),
            questions=analysis_json.get(
                "questions_for_realtor", ["What additional information do you need?"]
            ),
            generated_at=datetime.now().isoformat(),
        )

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
            trends="Based on provided information",
            comparables="Based on provided information",
            appreciation_potential="Based on provided information",
        ),
        investment_potential=InvestmentPotential(
            rental_income="Based on provided information",
            cash_flow="Based on provided information",
            roi_projections="Based on provided information",
            appreciation_timeline="Based on provided information",
        ),
        risk_assessment=RiskAssessment(
            market_risks=["Based on provided information"],
            property_risks=["Based on provided information"],
            mitigation_strategies=["Consider additional due diligence"],
        ),
        renovation_analysis=RenovationAnalysis(
            estimated_costs="Based on provided information",
            priority_improvements=["Property condition assessment needed"],
            renovation_roi="Varies by market conditions",
        ),
        investment_recommendation=InvestmentRecommendation(
            recommendation="Consider",
            ideal_buyer="Based on provided information",
            timeline="Based on provided information",
        ),
        strengths=["Property analysis completed"],
        weaknesses=["Analysis based on provided information"],
        hidden_issues=["Property condition unknown", "Additional research recommended"],
        questions=[
            "What is the current property condition?",
            "Are there any recent renovations?",
            "What is the rental history?",
        ],
        generated_at=datetime.now().isoformat(),
    )
