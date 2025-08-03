// lib/analyze.ts

export interface AnalyzeRequest {
  property_address: string;
  property_title?: string;
}

export interface PropertyAnalysis {
  id?: string;
  property_address: string;
  property_title: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  hidden_issues: string[];
  questions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: PropertyAnalysis;
  error?: string;
}

export async function analyzeListing(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await fetch('http://localhost:8000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

// Convenience functions for different input types
export async function analyzeByAddress(address: string, title?: string): Promise<AnalyzeResponse> {
  return analyzeListing({ 
    property_address: address, 
    property_title: title || address 
  });
}

// Legacy functions for backward compatibility
export async function analyzeByLocation(location: string): Promise<AnalyzeResponse> {
  return analyzeByAddress(location);
}

export async function analyzeByText(listingText: string): Promise<AnalyzeResponse> {
  return analyzeByAddress(listingText);
}

interface LegacyRequest {
  location?: string;
  listing_text?: string;
  property_address?: string;
  property_title?: string;
}

export async function analyzeAuto(request: LegacyRequest): Promise<AnalyzeResponse> {
  const address = request.location || request.listing_text || request.property_address || '';
  const title = request.property_title || address;
  return analyzeByAddress(address, title);
}