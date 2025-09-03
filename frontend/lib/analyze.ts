// web/lib/analyze.ts

// ---------- Shared DTOs (align with backend) ----------

export interface ManualPropertyData {
  listing_description: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  year_built?: number;
  lot_size?: string;
  price?: string;
  location_details?: string;
  additional_notes?: string;
}

export interface MarketAnalysis {
  trends: string;
  comparables: string;
  appreciation_potential: string;
}

export interface InvestmentPotential {
  rental_income: string;
  cash_flow: string;
  roi_projections: string;
  appreciation_timeline: string;
}

export interface RiskAssessment {
  market_risks: string[];
  property_risks: string[];
  mitigation_strategies: string[];
}

export interface RenovationAnalysis {
  estimated_costs: string;
  priority_improvements: string[];
  renovation_roi: string;
}

export interface InvestmentRecommendation {
  recommendation: string; // "Consider" | "Hold" | "Buy" | "Sell" (we keep flexible)
  ideal_buyer: string;
  timeline: string;
}

export interface PropertyAnalysis {
  id?: string;
  property_address: string;
  property_title: string;
  price?: string;
  overall_score: number;
  score_breakdown?: {
    location: number;
    condition: number;
    market_potential: number;
    investment_value: number;
  };
  summary: string;
  executive_summary?: string;
  disclaimer?: string;
  
  // Manual property data
  manual_data?: ManualPropertyData;

  // Market and Investment Analysis
  market_analysis?: MarketAnalysis;
  investment_potential?: InvestmentPotential;
  risk_assessment?: RiskAssessment;
  renovation_analysis?: RenovationAnalysis;
  investment_recommendation?: InvestmentRecommendation;

  // Property Details
  strengths: string[];
  weaknesses: string[];
  hidden_issues: string[];
  questions: string[];

  // Metadata
  created_at?: string;
  updated_at?: string;
  generated_at?: string;
}

export interface AnalyzeRequest {
  property_address: string;
  property_title?: string;
  manual_data?: ManualPropertyData;
  user_id?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: PropertyAnalysis;
  error?: string;
}

// ---------- Fetch helpers ----------

const API_BASE =
  process.env.NEXT_PUBLIC_ANALYZE_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid JSON from API: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    const errorData = json as { error?: string };
    throw new Error(`API ${res.status}: ${errorData?.error || res.statusText}`);
  }
  return json as T;
}

export async function analyzeListing(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const data = await handleJson<AnalyzeResponse>(res);
  return data;
}

// Convenience functions
export async function analyzeByAddress(address: string, title?: string, manualData?: ManualPropertyData): Promise<AnalyzeResponse> {
  return analyzeListing({
    property_address: address,
    property_title: title || address,
    manual_data: manualData,
  });
}

// Legacy compatibility
interface LegacyRequest {
  location?: string;
  listing_text?: string;
  property_address?: string;
  property_title?: string;
  manual_data?: ManualPropertyData;
}

export async function analyzeAuto(request: LegacyRequest): Promise<AnalyzeResponse> {
  const address = request.location || request.listing_text || request.property_address || "";
  const title = request.property_title || address;
  return analyzeByAddress(address, title, request.manual_data);
}