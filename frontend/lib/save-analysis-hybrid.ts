'use client';

import {
  ManualPropertyData,
  MarketAnalysis,
  InvestmentPotential,
  RiskAssessment,
  RenovationAnalysis,
} from '@/lib/analyze';
import { 
  saveAnalysisToSupabase, 
  getSavedAnalysesFromSupabase, 
  deleteAnalysisFromSupabase, 
  isAnalysisSavedInSupabase,
  convertSupabaseAnalysisToUI
} from '@/lib/supabase/saved-analyses';

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

// Type conflicts resolved with type assertions

// localStorage functions removed - using Supabase only for debugging

// Supabase-only functions (localStorage disabled for debugging)
export async function saveAnalysis(
  listingData: ListingData,
  propertyInput: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Only try Supabase - no fallback
  const supabaseResult = await saveAnalysisToSupabase(listingData, propertyInput, userId);
  
  if (!supabaseResult.success) {
  }
  
  return supabaseResult;
}

export async function getSavedAnalyses(userId: string) {
  // Only try Supabase - no fallback
  const supabaseResult = await getSavedAnalysesFromSupabase(userId);
  
  if (!supabaseResult.success) {
    return supabaseResult;
  }
  
  // Convert Supabase data to UI format
  const convertedData = supabaseResult.data?.map(convertSupabaseAnalysisToUI) || [];
  
  return {
    success: true,
    data: convertedData
  };
}

export async function deleteAnalysis(analysisId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  // Only try Supabase - no fallback
  const supabaseResult = await deleteAnalysisFromSupabase(analysisId, userId);
  
  if (!supabaseResult.success) {
  }
  
  return supabaseResult;
}

export async function isAnalysisSaved(
  propertyInput: string,
  propertyTitle: string,
  userId: string
): Promise<boolean> {
  // Only try Supabase - no fallback
  const supabaseResult = await isAnalysisSavedInSupabase(propertyInput, propertyTitle, userId);
  
  if (supabaseResult === false) {
  }
  
  return supabaseResult;
}
