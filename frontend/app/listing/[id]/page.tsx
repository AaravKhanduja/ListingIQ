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

interface MockListing {
  propertyTitle: string;
  summary: string;
  overallScore: number;
  strengths: string[];
  risks: string[];
  hiddenIssues: string[];
  questions: string[];
}

const mockAnalysis: MockListing = {
  propertyTitle: "1247 Maple Street, Oakwood Heights, CA 94102",
  summary: "This 3BR/2BA colonial in Oakwood Heights presents strong investment potential with recent major system updates, but requires careful evaluation of pricing and age-related maintenance factors.",
  overallScore: 78,
  strengths: [
    "Recent major system updates (HVAC 2022, roof 2021) significantly reduce immediate maintenance costs and provide 10-15 years of reliability",
    "Prime location in highly-rated Oakwood Heights school district with excellent walkability score of 89/100",
    "Functional open-concept layout with finished basement adds 400+ sq ft of usable living space"
  ],
  risks: [
    "Asking price of $875K appears 8-12% above recent comparable sales in the immediate neighborhood",
    "Original hardwood floors throughout main level show significant wear and may require $8K-15K refinishing",
    "Home age (circa 1968) suggests potential need for electrical panel upgrade and plumbing modernization within 5-10 years"
  ],
  hiddenIssues: [
    "Foundation inspection critical - no recent structural engineering report available in public records",
    "Previous water damage claims not disclosed - check insurance history and basement moisture levels",
    "Electrical panel appears to be original 1960s vintage - capacity may be insufficient for modern appliances"
  ],
  questions: [
    "Can you provide a comprehensive list of all recent comparable sales within 0.5 miles sold in the last 6 months?",
    "What is the exact age and amperage of the electrical panel, and has it been inspected recently?",
    "Has the basement ever experienced water intrusion, and can you provide moisture readings?"
  ]
};

export default function ListingPage() {
  const [propertyInput, setPropertyInput] = useState('');
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const storedProperty = localStorage.getItem('currentProperty');
    if (storedProperty) {
      setPropertyInput(storedProperty);
    }
    
    // Auto-save analysis
    const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
    const newAnalysis = {
      id: Date.now(),
      date: new Date().toISOString(),
      title: mockAnalysis.propertyTitle,
      propertyInput: storedProperty || '',
      analysis: {
        overallScore: mockAnalysis.overallScore,
        strengths: mockAnalysis.strengths,
        risks: mockAnalysis.risks,
        hiddenIssues: mockAnalysis.hiddenIssues,
        questions: mockAnalysis.questions
      }
    };
    
    savedAnalyses.push(newAnalysis);
    localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
  }, []);

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
          propertyTitle={mockAnalysis.propertyTitle}
          summary={mockAnalysis.summary}
          overallScore={mockAnalysis.overallScore}
          propertyId={id}
        />

        {/* Analysis Sections - 2x2 Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <AnalysisSection
            title="Strengths"
            description="What makes this property attractive"
            icon={Shield}
            iconBg="bg-green-100"
            bgColor="bg-green-50"
            borderColor="border-green-100"
            items={mockAnalysis.strengths}
            labelIcon="number"
          />

          <AnalysisSection
            title="Risks"
            description="Areas that require careful consideration"
            icon={AlertTriangle}
            iconBg="bg-orange-100"
            bgColor="bg-orange-50"
            borderColor="border-orange-100"
            items={mockAnalysis.risks}
            labelIcon="!"
          />

          <AnalysisSection
            title="Hidden Issues"
            description="Critical problems not disclosed"
            icon={Search}
            iconBg="bg-red-100"
            bgColor="bg-red-50"
            borderColor="border-red-100"
            items={mockAnalysis.hiddenIssues}
            labelIcon="⚠"
          />

          <AnalysisSection
            title="Questions"
            description="Important questions to ask"
            icon={HelpCircle}
            iconBg="bg-indigo-100"
            bgColor="bg-indigo-50"
            borderColor="border-indigo-100"
            items={mockAnalysis.questions}
            labelIcon="?"
          />
        </div>

        {/* Action Buttons */}
        <ActionButtons />
      </main>
    </div>
  );
}