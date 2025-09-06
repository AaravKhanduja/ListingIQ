# backend/app/routers/analyze_streaming.py
from __future__ import annotations
import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator, Dict, Any, Optional
from datetime import datetime

from ..models import (
    ManualPropertyData,
    AnalysisRequest,
)
from ..services.llm_service import LLMService
from ..middleware.auth import require_auth


router = APIRouter()


@router.post("/analyze/stream")
async def analyze_property_streaming(
    request: AnalysisRequest, current_user: dict = Depends(require_auth)
):
    """
    Stream property analysis results as they become available.
    Returns Server-Sent Events (SSE) for real-time updates.
    """
    if not request.property_address:
        raise HTTPException(status_code=400, detail="Property address is required")

    request.user_id = current_user["id"]

    async def generate_analysis_stream() -> AsyncGenerator[str, None]:
        try:
            # Send initial response with analysis ID
            analysis_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{request.user_id[:8]}"

            yield f"data: {json.dumps({'type': 'analysis_started', 'analysis_id': analysis_id})}\n\n"

            llm_service = LLMService()

            # Generate analysis sections progressively
            analysis_sections = await generate_progressive_analysis(
                address=request.property_address,
                title=request.property_title or request.property_address,
                manual_data=request.manual_data,
                user_id=request.user_id,
                llm_service=llm_service,
                analysis_id=analysis_id,
            )

            # Stream each section as it becomes available
            for section_name, section_data in analysis_sections.items():
                yield f"data: {json.dumps({'type': 'section_complete', 'section': section_name, 'data': section_data})}\n\n"
                await asyncio.sleep(0.1)  # Small delay for smooth streaming

            # Send completion signal
            yield f"data: {json.dumps({'type': 'analysis_complete', 'analysis_id': analysis_id})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate_analysis_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )


async def generate_progressive_analysis(
    *,
    address: str,
    title: str,
    manual_data: Optional[ManualPropertyData],
    user_id: str,
    llm_service: LLMService,
    analysis_id: str,
) -> Dict[str, Any]:
    """Generate analysis sections progressively"""

    # Section 1: Property Summary (Fastest - 2-3 seconds)
    summary_prompt = f"""
    Analyze this property and provide a concise summary in JSON format:
    
    Property: {address}
    Type: {manual_data.property_type if manual_data and manual_data.property_type else "Unknown"}
    Price: {manual_data.price if manual_data and manual_data.price else "Not provided"}
    Description: {manual_data.listing_description if manual_data and manual_data.listing_description else "None"}
    
    Return JSON: {{"summary": "2-3 sentence summary", "overall_score": 75}}
    """

    summary_result = await llm_service.generate_analysis(summary_prompt)

    # Section 2: Key Strengths (3-4 seconds)
    strengths_prompt = f"""
    Based on this property information, identify 3-4 key strengths:
    
    {address}
    {manual_data.listing_description if manual_data and manual_data.listing_description else "No description"}
    
    Return JSON: {{"strengths": ["strength1", "strength2", "strength3", "strength4"]}}
    """

    strengths_result = await llm_service.generate_analysis(strengths_prompt)

    # Section 3: Areas to Research (3-4 seconds)
    research_prompt = f"""
    What areas need additional research for this property?
    
    {address}
    {manual_data.listing_description if manual_data and manual_data.listing_description else "No description"}
    
    Return JSON: {{"weaknesses": ["area1", "area2", "area3", "area4"]}}
    """

    research_result = await llm_service.generate_analysis(research_prompt)

    # Section 4: Hidden Risks (3-4 seconds)
    risks_prompt = f"""
    Identify potential hidden risks or issues:
    
    {address}
    {manual_data.listing_description if manual_data and manual_data.listing_description else "No description"}
    
    Return JSON: {{"hidden_risks": ["risk1", "risk2", "risk3", "risk4"]}}
    """

    risks_result = await llm_service.generate_analysis(risks_prompt)

    # Section 5: Questions for Realtor (3-4 seconds)
    questions_prompt = f"""
    Generate 5-6 critical questions to ask the realtor:
    
    {address}
    {manual_data.listing_description if manual_data and manual_data.listing_description else "No description"}
    
    Return JSON: {{"questions": ["question1", "question2", "question3", "question4", "question5", "question6"]}}
    """

    questions_result = await llm_service.generate_analysis(questions_prompt)

    # Return sections in order
    return {
        "summary": {
            "summary": summary_result.get(
                "summary", "Property analysis based on provided information"
            )
            if summary_result
            else "Analysis in progress...",
            "overall_score": summary_result.get("overall_score", 75)
            if summary_result
            else 75,
        },
        "strengths": {
            "strengths": strengths_result.get("strengths", ["Analysis in progress..."])
            if strengths_result
            else ["Analysis in progress..."],
        },
        "research_areas": {
            "weaknesses": research_result.get("weaknesses", ["Analysis in progress..."])
            if research_result
            else ["Analysis in progress..."],
        },
        "hidden_risks": {
            "hidden_risks": risks_result.get(
                "hidden_risks", ["Analysis in progress..."]
            )
            if risks_result
            else ["Analysis in progress..."],
        },
        "questions": {
            "questions": questions_result.get("questions", ["Analysis in progress..."])
            if questions_result
            else ["Analysis in progress..."],
        },
    }
