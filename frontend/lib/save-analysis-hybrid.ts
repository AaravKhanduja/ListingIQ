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

// Check if we're in development mode
const isDevMode = process.env.NODE_ENV === 'development';

// Local storage functions for development mode
function saveAnalysisToLocalStorage(
  listingData: ListingData,
  propertyInput: string,
  userId: string
): { success: boolean; error?: string } {
  try {
    // Generate a more unique ID using timestamp + random number
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const analysisId = `analysis_${timestamp}_${randomSuffix}_${userId}`;
    const savedAnalysis = {
      id: analysisId,
      property_address: propertyInput,
      property_title: listingData.propertyTitle,
      summary: listingData.summary,
      executive_summary: listingData.executiveSummary,
      disclaimer: listingData.disclaimer,
      overall_score: listingData.score?.composite || 75,
      manual_data: listingData.manualData,
      market_analysis: listingData.marketAnalysis,
      investment_potential: listingData.investmentPotential,
      risk_assessment: listingData.riskAssessment,
      renovation_analysis: listingData.renovationAnalysis,
      strengths: listingData.strengths,
      weaknesses: listingData.weaknesses,
      hidden_issues: listingData.hiddenIssues,
      questions: listingData.questions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: userId,
    };

    // Get existing analyses
    const existingAnalyses = JSON.parse(localStorage.getItem('saved_analyses') || '[]');
    
    // Check if this exact analysis already exists (same property address and title for this user)
    const duplicateExists = existingAnalyses.some((existing: { user_id: string; property_address: string; property_title: string }) => 
      existing.user_id === userId &&
      existing.property_address === propertyInput &&
      existing.property_title === listingData.propertyTitle
    );
    
    if (duplicateExists) {
      console.log('Analysis already exists, skipping save');
      return { success: true };
    }
    
    // Add new analysis
    existingAnalyses.push(savedAnalysis);
    
    // Save back to localStorage
    localStorage.setItem('saved_analyses', JSON.stringify(existingAnalyses));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save analysis' };
  }
}

function getSavedAnalysesFromLocalStorage(userId: string) {
  try {
    const analyses = JSON.parse(localStorage.getItem('saved_analyses') || '[]');
    const userAnalyses = analyses.filter((analysis: { user_id: string }) => analysis.user_id === userId);
    
    // Remove duplicates based on property address and title
    const uniqueAnalyses = userAnalyses.filter((analysis: { property_address: string; property_title: string }, index: number, self: { property_address: string; property_title: string }[]) => 
      index === self.findIndex((a: { property_address: string; property_title: string }) => 
        a.property_address === analysis.property_address && 
        a.property_title === analysis.property_title
      )
    );
    
    // If duplicates were found, update localStorage
    if (uniqueAnalyses.length !== userAnalyses.length) {
      const otherUsersAnalyses = analyses.filter((analysis: { user_id: string }) => analysis.user_id !== userId);
      const cleanedAnalyses = [...otherUsersAnalyses, ...uniqueAnalyses];
      localStorage.setItem('saved_analyses', JSON.stringify(cleanedAnalyses));
    }
    
    // Convert to the format expected by the UI
    const convertedAnalyses = uniqueAnalyses.map((analysis: { id: string; created_at: string; property_title: string; property_address: string; overall_score: number; strengths: string[]; weaknesses: string[]; hidden_issues: string[]; questions: string[] }) => ({
      id: analysis.id,
      date: analysis.created_at,
      title: analysis.property_title,
      propertyInput: analysis.property_address,
      analysis: {
        overallScore: analysis.overall_score,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        hiddenIssues: analysis.hidden_issues || [],
        questions: analysis.questions || [],
      }
    }));
    
    return {
      success: true,
      data: convertedAnalyses
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to load analyses'
    };
  }
}

function deleteAnalysisFromLocalStorage(analysisId: string, userId: string): { success: boolean; error?: string } {
  try {
    const analyses = JSON.parse(localStorage.getItem('saved_analyses') || '[]');
    const filteredAnalyses = analyses.filter((analysis: { id: string; user_id: string }) => 
      !(analysis.id === analysisId && analysis.user_id === userId)
    );
    
    localStorage.setItem('saved_analyses', JSON.stringify(filteredAnalyses));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete analysis' };
  }
}

function isAnalysisSavedInLocalStorage(
  propertyInput: string,
  propertyTitle: string,
  userId: string
): boolean {
  try {
    const analyses = JSON.parse(localStorage.getItem('saved_analyses') || '[]');
    return analyses.some((analysis: { user_id: string; property_address: string; property_title: string }) => 
      analysis.user_id === userId &&
      analysis.property_address === propertyInput &&
      analysis.property_title === propertyTitle
    );
  } catch {
    return false;
  }
}

// Hybrid functions that use localStorage in dev mode, Supabase in production
export async function saveAnalysis(
  listingData: ListingData,
  propertyInput: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (isDevMode) {
    return saveAnalysisToLocalStorage(listingData, propertyInput, userId);
  } else {
    const supabaseResult = await saveAnalysisToSupabase(listingData, propertyInput, userId);
    return supabaseResult;
  }
}

export async function getSavedAnalyses(userId: string) {
  if (isDevMode) {
    return getSavedAnalysesFromLocalStorage(userId);
  } else {
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
}

export async function deleteAnalysis(analysisId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  if (isDevMode) {
    return deleteAnalysisFromLocalStorage(analysisId, userId);
  } else {
    const supabaseResult = await deleteAnalysisFromSupabase(analysisId, userId);
    return supabaseResult;
  }
}

export async function isAnalysisSaved(
  propertyInput: string,
  propertyTitle: string,
  userId: string
): Promise<boolean> {
  if (isDevMode) {
    return isAnalysisSavedInLocalStorage(propertyInput, propertyTitle, userId);
  } else {
    const supabaseResult = await isAnalysisSavedInSupabase(propertyInput, propertyTitle, userId);
    return supabaseResult;
  }
}
