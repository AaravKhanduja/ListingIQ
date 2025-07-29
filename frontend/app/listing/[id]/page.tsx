'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { ListingHeader } from '@/components/listing/ListingHeader';
import { AnalysisSection } from '@/components/listing/AnalysisSection';
import { ActionButtons } from '@/components/listing/ActionButtons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, AlertTriangle, Search, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { LoadingState } from '@/components/listing/LoadingState';
import { analyzeListing, AnalyzeRequest } from '@/lib/analyze';

interface ListingData {
  propertyTitle: string;
  summary: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  hiddenIssues: string[];
  questions: string[];
  inputType: 'location' | 'text';
}

export default function ListingPage() {
  const [propertyInput, setPropertyInput] = useState('');
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const storedProperty = localStorage.getItem('currentProperty');
    const inputMode = localStorage.getItem('inputMode') || 'location';

    if (storedProperty) {
      setPropertyInput(storedProperty);
      setLoading(true);

      // Prepare the analysis request based on input type
      const analyzeRequest: AnalyzeRequest = {
        input_type: inputMode as 'location' | 'text',
      };

      if (inputMode === 'text') {
        analyzeRequest.listing_text = storedProperty;
      } else {
        analyzeRequest.location = storedProperty;
      }

      // Start the analysis
      analyzeListing(analyzeRequest)
        .then((data) => {
          const newAnalysis: ListingData = {
            propertyTitle: data.location || 'Unknown',
            summary: data.summary || '',
            overallScore: data.score || 0,
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            hiddenIssues: data.hidden_issues || [],
            questions: data.follow_ups || [],
            inputType: data.input_type || 'location',
          };

          // Simulate progress for better UX
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
              clearInterval(interval);
              setListingData(newAnalysis);
              setLoading(false);

              // Save to localStorage for history
              const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
              savedAnalyses.push({
                id: Date.now(),
                date: new Date().toISOString(),
                title: newAnalysis.propertyTitle,
                propertyInput: storedProperty,
                inputType: inputMode,
                analysis: {
                  overallScore: newAnalysis.overallScore,
                  strengths: newAnalysis.strengths,
                  weaknesses: newAnalysis.weaknesses,
                  hiddenIssues: newAnalysis.hiddenIssues,
                  questions: newAnalysis.questions,
                },
              });
              localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
            } else {
              setAnalysisProgress(progress);
            }
          }, 200);
        })
        .catch((err) => {
          console.error('Analysis failed:', err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError('No property data found. Please go back and try again.');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <LoadingState analysisProgress={analysisProgress} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
          </div>

          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Try Again</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!listingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>

        {/* Input Type Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              listingData.inputType === 'text'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {listingData.inputType === 'text' ? '📄 Text Analysis' : '🌐 API Search'}
          </span>
        </div>

        {/* Property Header */}
        <ListingHeader
          propertyTitle={listingData.propertyTitle}
          summary={listingData.summary}
          overallScore={listingData.overallScore}
          propertyId={id}
        />

        {/* Analysis Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          <AnalysisSection
            title="Strengths"
            description="What makes this property attractive"
            icon={Shield}
            iconBg="bg-green-100"
            bgColor="bg-green-50"
            borderColor="border-green-100"
            items={listingData.strengths}
            labelIcon="number"
          />
          <AnalysisSection
            title="Weaknesses"
            description="Areas that require careful consideration"
            icon={AlertTriangle}
            iconBg="bg-orange-100"
            bgColor="bg-orange-50"
            borderColor="border-orange-100"
            items={listingData.weaknesses}
            labelIcon="!"
          />
          <AnalysisSection
            title="Hidden Issues"
            description="Critical problems not disclosed"
            icon={Search}
            iconBg="bg-red-100"
            bgColor="bg-red-50"
            borderColor="border-red-100"
            items={listingData.hiddenIssues}
            labelIcon="⚠"
          />
          <AnalysisSection
            title="Questions"
            description="Important questions to ask"
            icon={HelpCircle}
            iconBg="bg-indigo-100"
            bgColor="bg-indigo-50"
            borderColor="border-indigo-100"
            items={listingData.questions}
            labelIcon="?"
          />
        </div>

        {/* Action Buttons */}
        <ActionButtons />
      </main>
    </div>
  );
}
