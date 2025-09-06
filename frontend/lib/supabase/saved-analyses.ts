'use client';

import { supabase } from '@/lib/supabase/client';
import {
  ManualPropertyData,
  MarketAnalysis,
  InvestmentPotential,
  RiskAssessment,
  RenovationAnalysis,
} from '@/lib/analyze';

interface ListingData {
  propertyTitle: string;
  summary: string;
  executiveSummary?: string;
  disclaimer?: string;
  manualData?: ManualPropertyData;
  score?: { composite: number };
  marketAnalysis?: MarketAnalysis;
  investmentPotential?: InvestmentPotential;
  riskAssessment?: RiskAssessment;
  renovationAnalysis?: RenovationAnalysis;
  strengths: string[];
  weaknesses: string[];
  hiddenIssues: string[];
  questions: string[];
  generatedAt?: string;
}

interface SavedAnalysis {
  id: string;
  user_id: string;
  property_title: string;
  property_input: string;
  analysis_data: {
    overallScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    hiddenIssues?: string[];
    questions?: string[];
    summary?: string;
    executiveSummary?: string;
    marketAnalysis?: MarketAnalysis;
    investmentPotential?: InvestmentPotential;
    riskAssessment?: RiskAssessment;
    renovationAnalysis?: RenovationAnalysis;
    generatedAt?: string;
  };
  created_at: string;
  updated_at: string;
}

export async function saveAnalysisToSupabase(
  listingData: ListingData,
  propertyInput: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const analysisData = {
      overallScore: listingData.score?.composite,
      strengths: listingData.strengths,
      weaknesses: listingData.weaknesses,
      hiddenIssues: listingData.hiddenIssues,
      questions: listingData.questions,
      summary: listingData.summary,
      executiveSummary: listingData.executiveSummary,
      marketAnalysis: listingData.marketAnalysis,
      investmentPotential: listingData.investmentPotential,
      riskAssessment: listingData.riskAssessment,
      renovationAnalysis: listingData.renovationAnalysis,
      generatedAt: listingData.generatedAt,
    };

    // Check if analysis already exists
    const { data: existingAnalysis, error: checkError } = await supabase
      .from('saved_analyses')
      .select('id')
      .eq('user_id', userId)
      .eq('property_input', propertyInput)
      .eq('property_title', listingData.propertyTitle)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      return { success: false, error: checkError.message };
    }

    if (existingAnalysis) {
      // Update existing analysis
      const { error } = await supabase
        .from('saved_analyses')
        .update({
          analysis_data: analysisData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAnalysis.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Insert new analysis
      const { error } = await supabase
        .from('saved_analyses')
        .insert({
          user_id: userId,
          property_title: listingData.propertyTitle,
          property_input: propertyInput,
          analysis_data: analysisData,
        });

          if (error) {
      return { success: false, error: error.message || 'Failed to save analysis' };
    }
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getSavedAnalysesFromSupabase(
  userId: string
): Promise<{ success: boolean; data?: SavedAnalysis[]; error?: string }> {
  try {
    
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('saved_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message || 'Failed to fetch analyses' };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function deleteAnalysisFromSupabase(
  analysisId: string,
  _userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    // Get the current session to get the access token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { success: false, error: 'No active session found' };
    }

    // Call the backend API to delete the analysis
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/user/analyses/${analysisId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return { success: false, error: errorData.detail || `HTTP ${response.status}` };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function isAnalysisSavedInSupabase(
  propertyInput: string,
  propertyTitle: string,
  userId: string
): Promise<boolean> {
  try {
    if (!supabase) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('saved_analyses')
      .select('id')
      .eq('user_id', userId)
      .eq('property_input', propertyInput)
      .eq('property_title', propertyTitle)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows found

    if (error) {
      return false;
    }

    return !!data;
  } catch {
    return false;
  }
}

// Helper function to convert Supabase data to the format expected by the UI
export function convertSupabaseAnalysisToUI(supabaseAnalysis: SavedAnalysis) {
  return {
    id: supabaseAnalysis.id, // Keep as string UUID
    date: supabaseAnalysis.created_at,
    title: supabaseAnalysis.property_title,
    propertyInput: supabaseAnalysis.property_input,
    analysis: supabaseAnalysis.analysis_data,
  };
}
