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

// ---------- Fetch helpers (UTC-safe) ----------

const API_BASE =
  process.env.NEXT_PUBLIC_ANALYZE_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

// Epoch helpers (UTC by definition)
const nowEpochSec = () => Math.floor(Date.now() / 1000);

// Decode JWT payload safely in both browser & SSR
function decodeJwtPayload(token: string): unknown | null {
  try {
    const base64 = token.split(".")[1];
    // atob is only in browsers; handle SSR
    const json =
      (typeof atob !== "undefined"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf8"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string, leewaySec = 0): boolean {
  const payload = decodeJwtPayload(token) as { exp?: number };
  if (!payload?.exp) return true; // cannot trust → treat as expired
  const expired = payload.exp <= (nowEpochSec() - leewaySec);
  return expired;
}

function isTokenExpiringSoon(token: string, minutes = 5): boolean {
  const payload = decodeJwtPayload(token) as { exp?: number };
  if (!payload?.exp) return true;
  const remainingMs = payload.exp * 1000 - Date.now(); // both UTC-based
  return remainingMs < minutes * 60 * 1000;
}

async function authorizedFetch(
  url: string,
  init: RequestInit,
  retryCount = 0
): Promise<Response> {
  const res = await fetch(url, init);

  if (res.status === 401 && retryCount === 0) {
    try {
      const { refreshUser, getSession } = await import("@/lib/supabase/auth");
      const { error } = await refreshUser();
      if (!error) {
        const newSession = await getSession();
        const newToken = newSession?.access_token;
        if (newToken && !isTokenExpired(newToken, 0)) {
          const headers = new Headers(init.headers || {});
          headers.set("Authorization", `Bearer ${newToken}`);
          return authorizedFetch(url, { ...init, headers }, retryCount + 1);
        }
      }
      } catch (e) {
    // Silent fail - user will be redirected to signin on next request
  }
  }

  return res;
}

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

export async function analyzeListing(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  let token: string | undefined;

  // 1) Get session & token
  try {
    const { getSession } = await import("@/lib/supabase/auth");
    const session = await getSession();
    token = session?.access_token;
    if (!token) {
      throw new Error("No session found, please sign in again");
    }
  } catch (e) {
    throw e;
  }

  // 2) Hard UTC expiration gate (with small leeway for skew)
  //    NOTE: adjust leeway to your infra; 60s is a common choice
  const LEEWAY_SEC = 60;
  if (isTokenExpired(token, LEEWAY_SEC)) {
    throw new Error("Token expired, please sign in again");
  }

  // 3) Proactive refresh if close to expiry
  if (isTokenExpiringSoon(token, 5)) {
    try {
      const { refreshUser, getSession } = await import("@/lib/supabase/auth");
      const { error } = await refreshUser();
      if (!error) {
        const refreshed = await getSession();
        if (refreshed?.access_token && !isTokenExpired(refreshed.access_token, LEEWAY_SEC)) {
          token = refreshed.access_token;
        }
      }
    } catch (e) {
      // Silent fail - proceed with current token
    }
  }

  // 4) Make request with token; retry once on 401 (server may be stricter)
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await authorizedFetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  return handleJson<AnalyzeResponse>(res);
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