from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class PropertyAnalysis(BaseModel):
    id: Optional[str] = None
    property_address: str
    property_title: str
    overall_score: int
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    hidden_issues: List[str]
    questions: List[str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AnalysisRequest(BaseModel):
    property_address: str
    property_title: Optional[str] = None


class AnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[PropertyAnalysis] = None
    error: Optional[str] = None
