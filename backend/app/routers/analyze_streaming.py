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
            print(f"🚀 Starting analysis {analysis_id} for {request.property_address}")

            yield f"data: {json.dumps({'type': 'analysis_started', 'analysis_id': analysis_id})}\n\n"

            llm_service = LLMService()

            # Generate analysis sections with real-time streaming
            print(f"🔄 Starting streaming analysis for {request.property_address}")
            try:
                async for (
                    section_name,
                    section_data,
                ) in generate_progressive_analysis_stream(
                    address=request.property_address,
                    title=request.property_title or request.property_address,
                    manual_data=request.manual_data,
                    user_id=request.user_id,
                    llm_service=llm_service,
                    analysis_id=analysis_id,
                ):
                    print(f"✅ Section {section_name} completed")
                    yield f"data: {json.dumps({'type': 'section_complete', 'section': section_name, 'data': section_data})}\n\n"
            except Exception as stream_error:
                print(f"❌ Streaming error: {stream_error}")
                yield f"data: {json.dumps({'type': 'error', 'message': str(stream_error)})}\n\n"

            # Send completion signal
            yield f"data: {json.dumps({'type': 'analysis_complete', 'analysis_id': analysis_id})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate_analysis_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )


async def generate_progressive_analysis_stream(
    *,
    address: str,
    title: str,
    manual_data: Optional[ManualPropertyData],
    user_id: str,
    llm_service: LLMService,
    analysis_id: str,
) -> AsyncGenerator[tuple[str, Dict[str, Any]], None]:
    """Generate analysis sections with real-time streaming as each section completes"""

    print(f"🚀 Starting progressive analysis for {address}")

    from ..services.optimized_prompts import OptimizedPrompts

    # Get optimized prompts
    prompts = OptimizedPrompts.get_all_prompts(address, manual_data)
    print(f"📝 Generated {len(prompts)} prompts")

    # Create tasks for parallel execution
    tasks = {
        "summary": llm_service.generate_analysis(prompts["summary"]),
        "strengths": llm_service.generate_analysis(prompts["strengths"]),
        "research_areas": llm_service.generate_analysis(prompts["research_areas"]),
        "risks": llm_service.generate_analysis(prompts["risks"]),
        "questions": llm_service.generate_analysis(prompts["questions"]),
    }
    print(f"🔄 Created {len(tasks)} LLM tasks")

    # Track which sections have been yielded
    yielded_sections = set()

    # Use asyncio.gather with return_when=FIRST_COMPLETED to get results as they finish
    pending_tasks = {name: asyncio.create_task(coro) for name, coro in tasks.items()}

    while pending_tasks:
        # Wait for the first task to complete
        done, pending = await asyncio.wait(
            pending_tasks.values(), return_when=asyncio.FIRST_COMPLETED
        )

        for completed_task in done:
            # Find which section this task belongs to
            section_name = None
            for name, task in pending_tasks.items():
                if task == completed_task:
                    section_name = name
                    break

            print(f"🔍 Section identified: {section_name}")

            try:
                result = completed_task.result()
                print(f"🔍 LLM result received: {result}")

                if section_name and section_name not in yielded_sections:
                    yielded_sections.add(section_name)

                    # Format the section data
                    section_data = format_section_data(section_name, result)
                    print(
                        f"🔍 Yielding section: {section_name} with data: {section_data}"
                    )
                    yield section_name, section_data

                    # Add a small delay to create gradual progress effect
                    if len(yielded_sections) < len(tasks):
                        await asyncio.sleep(0.4)  # 400ms delay between completions

            except Exception as e:
                print(f"❌ Error in analysis section {section_name}: {e}")

                if section_name and section_name not in yielded_sections:
                    yielded_sections.add(section_name)
                    section_data = format_section_data(section_name, None)
                    yield section_name, section_data

            # Remove completed task from pending
            if section_name:
                del pending_tasks[section_name]


def format_section_data(
    section_name: str, result: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    """Format section data for streaming response"""

    if section_name == "summary":
        return {
            "summary": result.get(
                "summary", "Property analysis based on provided information"
            )
            if result
            else "Analysis in progress...",
            "overall_score": result.get("overall_score", 75) if result else 75,
        }
    elif section_name == "strengths":
        return {
            "strengths": result.get("strengths", ["Analysis in progress..."])
            if result
            else ["Analysis in progress..."],
        }
    elif section_name == "research_areas":
        return {
            "weaknesses": result.get("weaknesses", ["Analysis in progress..."])
            if result
            else ["Analysis in progress..."],
        }
    elif section_name == "risks":
        return {
            "hidden_risks": result.get("hidden_risks", ["Analysis in progress..."])
            if result
            else ["Analysis in progress..."],
        }
    elif section_name == "questions":
        return {
            "questions": result.get("questions", ["Analysis in progress..."])
            if result
            else ["Analysis in progress..."],
        }
    else:
        return {}
