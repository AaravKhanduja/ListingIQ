'use client';

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

export function saveAnalysisToLocalStorage(
  listingData: ListingData,
  propertyInput: string,
  user: { id: string }
): boolean {
  if (!user || typeof window === 'undefined') return false;

  try {
    const savedAnalyses = localStorage.getItem('savedAnalyses');
    const analyses = savedAnalyses ? JSON.parse(savedAnalyses) : [];

    // Check if this analysis already exists
    const existingIndex = analyses.findIndex(
      (analysis: { propertyInput: string; title: string }) =>
        analysis.propertyInput === propertyInput && analysis.title === listingData.propertyTitle
    );

    if (existingIndex !== -1) {
      // Update existing analysis
      analyses[existingIndex] = {
        id: analyses[existingIndex].id,
        date: new Date().toISOString(),
        title: listingData.propertyTitle,
        propertyInput: propertyInput,
        analysis: {
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
        },
      };
    } else {
      // Add new analysis
      const newAnalysis = {
        id: Date.now(),
        date: new Date().toISOString(),
        title: listingData.propertyTitle,
        propertyInput: propertyInput,
        analysis: {
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
        },
      };

      analyses.unshift(newAnalysis); // Add to beginning
    }

    // Keep only the last 50 analyses to prevent localStorage from getting too large
    const trimmedAnalyses = analyses.slice(0, 50);
    localStorage.setItem('savedAnalyses', JSON.stringify(trimmedAnalyses));
    
    return true;
  } catch (error) {
    console.error('Error saving analysis:', error);
    return false;
  }
}

export function isAnalysisSaved(
  propertyInput: string,
  propertyTitle: string,
  user: { id: string }
): boolean {
  if (!user || typeof window === 'undefined') return false;

  try {
    const savedAnalyses = localStorage.getItem('savedAnalyses');
    if (!savedAnalyses) return false;

    const parsed = JSON.parse(savedAnalyses);
    return parsed.some(
      (analysis: { propertyInput: string; title: string }) =>
        analysis.propertyInput === propertyInput && analysis.title === propertyTitle
    );
  } catch (error) {
    console.error('Error checking if analysis is saved:', error);
    return false;
  }
}
