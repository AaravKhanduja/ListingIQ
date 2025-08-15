'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { Navigation } from '@/components/layout/Navigation';
import { HeroSection } from '@/components/hero/HeroSection';
import { HowItWorks } from '@/components/how-it-works/HowItWorks';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
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
    console.log('🏠 Home page handleAnalyze called');

    // Check if we have valid input based on the mode stored in localStorage
    const inputMode = localStorage.getItem('inputMode') || 'location';
    const currentProperty = localStorage.getItem('currentProperty');

    console.log('📝 Input mode from localStorage:', inputMode);
    console.log('📍 Current property from localStorage:', currentProperty);

    if (!currentProperty || !currentProperty.trim()) {
      console.error('❌ No property data found for analysis');
      return;
    }

    console.log('✅ Proceeding with analysis');
    setIsAnalyzing(true);

    try {
      const listingId = Date.now().toString();
      console.log('🆔 Generated listing ID:', listingId);
      router.push(`/listing/${listingId}`);
    } catch (error) {
      console.error('❌ Navigation error:', error);
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
