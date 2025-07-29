// lib/analyze.ts

export interface AnalyzeRequest {
  location?: string;
  listing_text?: string;
  input_type?: 'location' | 'text' | 'auto';
}

export interface PropertyDetails {
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  property_type?: string;
  year_built?: number;
}

export interface AnalyzeResponse {
  location: string;
  short_description: string;
  input_type: 'location' | 'text';
  summary: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  hidden_issues: string[];
  follow_ups: string[];
  property_details?: PropertyDetails;
  error?: string;
  suggestion?: string;
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
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

// Convenience functions for different input types
export async function analyzeByLocation(location: string): Promise<AnalyzeResponse> {
  return analyzeListing({ location, input_type: 'location' });
}

export async function analyzeByText(listingText: string): Promise<AnalyzeResponse> {
  return analyzeListing({ listing_text: listingText, input_type: 'text' });
}

export async function analyzeAuto(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  return analyzeListing({ ...request, input_type: 'auto' });
}