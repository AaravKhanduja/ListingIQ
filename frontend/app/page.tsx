"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { Navigation } from '@/components/layout/Navigation'; 
import { HeroSection } from '@/components/hero/HeroSection';
import { HowItWorks } from '@/components/how-it-works/HowItWorks';
import { LoadingState } from '@/components/homepage/LoadingState';

export default function HomePage() {
  const [propertyInput, setPropertyInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!propertyInput.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate realistic analysis progress
    const progressSteps = [
      { progress: 15, message: "Fetching property data..." },
      { progress: 35, message: "Analyzing listing details..." },
      { progress: 60, message: "Identifying potential risks..." },
      { progress: 85, message: "Generating insights..." },
      { progress: 100, message: "Analysis complete!" }
    ];
    
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(progressSteps[i].progress);
    }
    
    // Store the property input for the results page
    localStorage.setItem('currentProperty', propertyInput);
    router.push('/analysis');
  };

  if (isAnalyzing) {
    return <LoadingState analysisProgress={analysisProgress} />;
  }

  return (
    <LandingLayout>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <HeroSection
          propertyInput={propertyInput}
          setPropertyInput={setPropertyInput}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
        <HowItWorks />
      </div>
    </LandingLayout>
  );
}