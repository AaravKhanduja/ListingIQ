'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  ManualPropertyData,
  MarketAnalysis,
  InvestmentPotential,
  RiskAssessment,
  RenovationAnalysis,
} from '@/lib/analyze';
import {
  saveAnalysis,
  isAnalysisSaved,
  deleteAnalysis,
  getSavedAnalyses,
} from '@/lib/save-analysis-hybrid';

interface SaveButtonProps {
  listingData: {
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
  };
  propertyInput: string;
}

export function SaveButton({ listingData, propertyInput }: SaveButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        // Remove from saved - we need to find the analysis ID first
        const result = await getSavedAnalyses(user.id);
        if (result.success && result.data) {
          const analysisToDelete = result.data.find(
            (analysis: { propertyInput: string; title: string; id: string }) =>
              analysis.propertyInput === propertyInput &&
              analysis.title === listingData.propertyTitle
          );

          if (analysisToDelete) {
            const result = await deleteAnalysis(analysisToDelete.id, user.id);
            if (result.success) {
              setIsSaved(false);
            }
          }
        }
      } else {
        // Add to saved
        const result = await saveAnalysis(listingData, propertyInput, user.id);
        if (result.success) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize saved state
  useEffect(() => {
    if (user) {
      isAnalysisSaved(propertyInput, listingData.propertyTitle, user.id).then(setIsSaved);
    }
  }, [user, propertyInput, listingData.propertyTitle]);

  if (!user) return null;

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${
        isSaved
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      }`}
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Analysis'}
        </>
      )}
    </Button>
  );
}
