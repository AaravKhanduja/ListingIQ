"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { Navigation } from '@/components/layout/Navigation'; 
import { HeroSection } from '@/components/hero/HeroSection';
import { HowItWorks } from '@/components/how-it-works/HowItWorks';

export default function HomePage() {
  const [propertyInput, setPropertyInput] = useState('');
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!propertyInput.trim()) return;

    const listingId = Date.now().toString();
    localStorage.setItem('currentProperty', propertyInput);
    router.push(`/listing/${listingId}`);
  };

  return (
    <LandingLayout>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <HeroSection
          propertyInput={propertyInput}
          setPropertyInput={setPropertyInput}
          onAnalyze={handleAnalyze}
          isAnalyzing={false}
        />
        <HowItWorks />
      </div>
    </LandingLayout>
  );
}