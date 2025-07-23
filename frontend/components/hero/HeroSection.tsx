"use client";

import { HeroHeading } from './HeroHeading';
import { ListingInputForm } from './ListingInputForm';

interface HeroSectionProps {
  propertyInput: string;
  setPropertyInput: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function HeroSection({ 
  propertyInput, 
  setPropertyInput, 
  onAnalyze, 
  isAnalyzing 
}: HeroSectionProps) {
  return (
    <>
      <HeroHeading />
      <ListingInputForm
        propertyInput={propertyInput}
        setPropertyInput={setPropertyInput}
        onAnalyze={onAnalyze}
        isAnalyzing={isAnalyzing}
      />
    </>
  );
}