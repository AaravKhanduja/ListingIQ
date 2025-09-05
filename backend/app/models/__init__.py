from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


class MarketAnalysis(BaseModel):
    trends: Optional[str] = None
    comparables: Optional[str] = None
    appreciation_potential: Optional[str] = None


class InvestmentPotential(BaseModel):
    rental_income: Optional[str] = None
    cash_flow: Optional[str] = None
    roi_projections: Optional[str] = None
    appreciation_timeline: Optional[str] = None


class RiskAssessment(BaseModel):
    market_risks: Optional[List[str]] = None
    property_risks: Optional[List[str]] = None
    mitigation_strategies: Optional[List[str]] = None


class RenovationAnalysis(BaseModel):
    estimated_costs: Optional[str] = None
    priority_improvements: Optional[List[str]] = None
    renovation_roi: Optional[str] = None


class InvestmentRecommendation(BaseModel):
    recommendation: Optional[str] = None  # Buy, Hold, Sell
    ideal_buyer: Optional[str] = None
    timeline: Optional[str] = None


class ManualPropertyData(BaseModel):
    """Manual property data provided by user"""

    listing_description: Optional[str] = None
    property_type: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    square_feet: Optional[int] = None
    year_built: Optional[int] = None
    lot_size: Optional[str] = None
    price: Optional[str] = None
    location_details: Optional[str] = None
    additional_notes: Optional[str] = None


class PropertyAnalysis(BaseModel):
    id: Optional[str] = None
    property_address: str
    property_title: str
    price: Optional[str] = None
    overall_score: int
    score_breakdown: Optional[Dict[str, int]] = None
    summary: str
    executive_summary: Optional[str] = None
    disclaimer: str = "This report is automatically generated from the information you provided and is for educational/informational purposes only. It is not real estate, investment, or financial advice. Please consult licensed professionals before making decisions."

    # Manual property data
    manual_data: Optional[ManualPropertyData] = None

    # Market and Investment Analysis
    market_analysis: Optional[MarketAnalysis] = None
    investment_potential: Optional[InvestmentPotential] = None
    risk_assessment: Optional[RiskAssessment] = None
    renovation_analysis: Optional[RenovationAnalysis] = None
    investment_recommendation: Optional[InvestmentRecommendation] = None

    # Property Details
    strengths: List[str]
    weaknesses: List[str]
    hidden_issues: List[str]
    questions: List[str]

    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    generated_at: Optional[str] = None


class AnalysisRequest(BaseModel):
    property_address: str
    property_title: Optional[str] = None
    manual_data: Optional[ManualPropertyData] = None
    user_id: Optional[str] = None


class AnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[PropertyAnalysis] = None
    error: Optional[str] = None
