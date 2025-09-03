'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

import { Navigation } from '@/components/layout/Navigation';
import { ActionButtons } from '@/components/listing/ActionButtons';
import { LoadingState } from '@/components/listing/LoadingState';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Target,
  Globe,
  ChevronDown,
  ChevronUp,
  Home,
  MapPin,
  FileText,
  DollarSign,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Users,
} from 'lucide-react';

import { analyzeListing, AnalyzeRequest, ManualPropertyData } from '@/lib/analyze';

// -----------------------------
// Types used locally
// -----------------------------
interface ListingData {
  propertyTitle: string;
  summary: string;
  executiveSummary?: string;
  disclaimer?: string;
  manualData?: ManualPropertyData;
  score?: {
    composite: number;
  };
  marketAnalysis?: {
    trends: string;
    comparables: string;
    appreciation_potential: string;
  };
  investmentPotential?: {
    rental_income: string;
    cash_flow: string;
    roi_projections: string;
    appreciation_timeline: string;
  };
  riskAssessment?: {
    market_risks: string[];
    property_risks: string[];
    mitigation_strategies: string[];
  };
  renovationAnalysis?: {
    estimated_costs: string;
    priority_improvements: string[];
    renovation_roi: string;
  };
  strengths: string[];
  weaknesses: string[];
  hiddenIssues: string[];
  questions: string[];
  generatedAt?: string;
}

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['methodology']));

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Check authentication and fetch data
  useEffect(() => {
    // Handle authentication redirect
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    // Only fetch data if authenticated and not loading
    if (!authLoading && user && id) {
      const fetchAnalysis = async () => {
        try {
          setLoading(true);
          setError(null);

          const propertyAddress = decodeURIComponent(String(id));

          // Get the manual data from localStorage
          const currentPropertyData = localStorage.getItem('currentProperty');
          let manualData: ManualPropertyData | undefined;

          if (currentPropertyData) {
            try {
              const parsedData = JSON.parse(currentPropertyData);
              if (parsedData.address === propertyAddress) {
                manualData = parsedData.manualData;
              }
            } catch (e) {
              console.error('Failed to parse stored property data:', e);
            }
          }

          const request: AnalyzeRequest = {
            property_address: propertyAddress,
            property_title: propertyAddress,
            manual_data: manualData,
          };

          const response = await analyzeListing(request);

          if (response.success && response.analysis) {
            const a = response.analysis;

            const newAnalysis: ListingData = {
              propertyTitle: a.property_title || propertyAddress,
              summary: a.summary || '',
              executiveSummary: a.executive_summary,
              disclaimer: a.disclaimer,
              manualData: a.manual_data,
              score: {
                composite: a.overall_score ?? 0,
              },
              marketAnalysis: a.market_analysis || undefined,
              investmentPotential: a.investment_potential || undefined,
              riskAssessment: a.risk_assessment || undefined,
              renovationAnalysis: a.renovation_analysis || undefined,
              strengths: a.strengths || [],
              weaknesses: a.weaknesses || [],
              hiddenIssues: a.hidden_issues || [],
              questions: a.questions || [],
              generatedAt: a.generated_at,
            };

            setListingData(newAnalysis);
          } else {
            setError(response.error || 'Failed to analyze property');
          }
        } catch (err) {
          console.error('Error fetching analysis:', err);
          setError('Failed to fetch property analysis');
        } finally {
          setLoading(false);
        }
      };

      fetchAnalysis();
    }
  }, [user, authLoading, router, id]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return <LoadingState analysisProgress={50} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analysis Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!listingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Analysis Found</h1>
            <p className="text-gray-600 mb-6">Unable to load property analysis.</p>
            <Button onClick={() => router.push('/')}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listingData.propertyTitle}</h1>
          <p className="text-gray-600 text-lg">{listingData.summary}</p>
        </div>

        {/* Action Buttons */}
        <ActionButtons />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Strengths */}
          <Card>
            <CardHeader className="bg-green-50 border-green-200">
              <CardTitle className="flex items-center text-green-800">
                <Shield className="mr-2 h-5 w-5" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {listingData.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas to Research */}
          <Card>
            <CardHeader className="bg-yellow-50 border-yellow-200">
              <CardTitle className="flex items-center text-yellow-800">
                <Target className="mr-2 h-5 w-5" />
                Areas to Research
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {listingData.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Hidden Risks & Issues */}
          <Card>
            <CardHeader className="bg-red-50 border-red-200">
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Hidden Risks & Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {listingData.hiddenIssues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Questions to Ask Realtor */}
          <Card>
            <CardHeader className="bg-blue-50 border-blue-200">
              <CardTitle className="flex items-center text-blue-800">
                <Globe className="mr-2 h-5 w-5" />
                Questions to Ask Realtor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {listingData.questions.map((question, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections */}
        {listingData.marketAnalysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Market Trends</h4>
                  <p className="text-gray-700">{listingData.marketAnalysis.trends}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Comparables</h4>
                  <p className="text-gray-700">{listingData.marketAnalysis.comparables}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Appreciation Potential</h4>
                  <p className="text-gray-700">
                    {listingData.marketAnalysis.appreciation_potential}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {listingData.investmentPotential && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Investment Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rental Income</h4>
                  <p className="text-gray-700">{listingData.investmentPotential.rental_income}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cash Flow</h4>
                  <p className="text-gray-700">{listingData.investmentPotential.cash_flow}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ROI Projections</h4>
                  <p className="text-gray-700">{listingData.investmentPotential.roi_projections}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Appreciation Timeline</h4>
                  <p className="text-gray-700">
                    {listingData.investmentPotential.appreciation_timeline}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        {listingData.disclaimer && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 text-center italic">{listingData.disclaimer}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
