"use client";

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

interface ListingData {
  propertyTitle: string;
  summary: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  hiddenIssues: string[];
  questions: string[];
}

export default function ListingPage() {
  const [propertyInput, setPropertyInput] = useState('');
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const storedProperty = localStorage.getItem('currentProperty');

    if (storedProperty) {
      setPropertyInput(storedProperty);
      setLoading(true);

      fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: storedProperty }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('API error:', data.error);
            return;
          }

          const newAnalysis: ListingData = {
            propertyTitle: data.location || 'Unknown',
            summary: data.summary || '',
            overallScore: data.score || 0,
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            hiddenIssues: data.hidden_issues || [],
            questions: data.follow_ups || [],
          };

          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
              clearInterval(interval);
              setListingData(newAnalysis);
              setLoading(false);

              const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
              savedAnalyses.push({
                id: Date.now(),
                date: new Date().toISOString(),
                title: newAnalysis.propertyTitle,
                propertyInput: storedProperty,
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
        .catch(err => {
          console.error('Request failed:', err);
          setLoading(false);
        });
    }
  }, []);

  if (loading || !listingData) {
    return <LoadingState analysisProgress={analysisProgress} />;
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