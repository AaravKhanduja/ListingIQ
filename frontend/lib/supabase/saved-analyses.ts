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
    console.log('saveAnalysisToSupabase called with:', { propertyInput, userId, supabaseConfigured: !!supabase });
    
    if (!supabase) {
      console.error('Supabase client is null/undefined');
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
      console.error('Error checking for existing analysis:', checkError);
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
        console.error('Error updating analysis:', error);
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
      console.error('Error saving analysis:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Failed to save analysis' };
    }
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving analysis to Supabase:', error);
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
    console.log('getSavedAnalysesFromSupabase called with:', { userId, supabaseConfigured: !!supabase });
    
    if (!supabase) {
      console.error('Supabase client is null/undefined');
      return { success: false, error: 'Supabase not configured' };
    }
    
    const { data, error } = await supabase
      .from('saved_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Failed to fetch analyses' };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching analyses from Supabase:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function deleteAnalysisFromSupabase(
  analysisId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    // Delete the analysis directly from Supabase
    const { error } = await supabase
      .from('saved_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
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
      console.log('Supabase not configured, returning false');
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
      console.error('Error checking if analysis is saved:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if analysis is saved in Supabase:', error);
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
