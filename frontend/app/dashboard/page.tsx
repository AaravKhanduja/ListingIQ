'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { Navigation } from '@/components/layout/Navigation';
import { HeroSection } from '@/components/hero/HeroSection';
import { HowItWorks } from '@/components/how-it-works/HowItWorks';
import { useAuth } from '@/lib/auth';

export default function DashboardPage() {
  const [propertyInput, setPropertyInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const handleAnalyze = async () => {
    const currentPropertyData = localStorage.getItem('currentProperty');

    if (!currentPropertyData || !currentPropertyData.trim()) {
      return;
    }

    try {
      const parsedData = JSON.parse(currentPropertyData);
      const { address, manualData } = parsedData;

      if (!address || !manualData?.listing_description) {
        return;
      }

      setIsAnalyzing(true);

      // Use the property address as the listing ID (URL-encoded)
      const listingId = encodeURIComponent(address.trim());
      router.push(`/listing/${listingId}`);
    } catch {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <LandingLayout>
      <Navigation />
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-12 lg:space-y-16">
        <HeroSection
          propertyInput={propertyInput}
          setPropertyInput={setPropertyInput}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
        <HowItWorks />
      </div>

      {/* Footer Banner */}
      <div className="bg-amber-50 border-t border-amber-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-amber-800">
            ⚡ ListingIQ is experimental and for informational purposes only. Not financial, legal,
            or real estate advice.
          </p>
        </div>
      </div>
    </LandingLayout>
  );
}
