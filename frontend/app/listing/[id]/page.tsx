'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Navigation } from '@/components/layout/Navigation';
import { ActionButtons } from '@/components/listing/ActionButtons';
import { LoadingState } from '@/components/listing/LoadingState';
import { SaveButton } from '@/components/listing/SaveButton';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  Home,
  MapPin,
  FileText,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Users,
} from 'lucide-react';

import { analyzeListing, AnalyzeRequest, ManualPropertyData } from '@/lib/analyze';
import { saveAnalysis } from '@/lib/save-analysis-hybrid';
import { useAuth } from '@/lib/auth';

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
  const { user } = useAuth();

  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['methodology']));

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        setAnalysisProgress(10);

        const propertyAddress = decodeURIComponent(String(id));

        // Get the manual data from localStorage
        setAnalysisProgress(20);
        const currentPropertyData = localStorage.getItem('currentProperty');
        let manualData: ManualPropertyData | undefined;

        if (currentPropertyData) {
          try {
            const parsedData = JSON.parse(currentPropertyData);
            if (parsedData.address === propertyAddress) {
              manualData = parsedData.manualData;
            }
          } catch {
            // Silent fail
          }
        }

        setAnalysisProgress(30);
        const request: AnalyzeRequest = {
          property_address: propertyAddress,
          property_title: propertyAddress,
          manual_data: manualData,
        };

        setAnalysisProgress(40);

        // Simulate progress during LLM processing
        const progressInterval = setInterval(() => {
          setAnalysisProgress((prev) => {
            if (prev < 65) return prev + 2;
            return prev;
          });
        }, 200);

        const response = await analyzeListing(request);
        clearInterval(progressInterval);

        setAnalysisProgress(70);

        if (response.success && response.analysis) {
          const a = response.analysis;

          setAnalysisProgress(85);
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
            generatedAt: a.generated_at || undefined,
          };

          setAnalysisProgress(95);
          setListingData(newAnalysis);

          // Auto-save the analysis
          if (user) {
            const propertyInput = decodeURIComponent(String(id));
            saveAnalysis(newAnalysis, propertyInput, user.id);
          }

          setAnalysisProgress(100);
        } else {
          setError(response.error || 'Failed to load analysis');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';

        // Check if this is an authentication error and redirect to signin
        if (
          errorMessage.includes('Token expired') ||
          errorMessage.includes('No session found') ||
          errorMessage.includes('please sign in again')
        ) {
          window.location.href = '/auth/signin';
          return; // Don't set error state since we're redirecting
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id, user]);

  if (loading) return <LoadingState analysisProgress={analysisProgress} />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Unavailable</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
      </div>
    );
  }

  if (!listingData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Analysis</h1>
          <p className="text-base text-gray-700 leading-relaxed font-medium">
            Expert analysis based on the information you provided. Educational/informational only —
            not real estate, investment, or financial advice.
          </p>
        </div>

        {/* Property Summary Bar */}
        <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm sticky top-4 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900 text-lg">
                {listingData.manualData?.property_type
                  ? `${listingData.manualData.property_type} - `
                  : ''}
                {listingData.propertyTitle}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white shadow-sm">
                Analysis Score: {Math.round((listingData.score?.composite ?? 0) / 20)}/5
              </span>
              {listingData.manualData?.price && (
                <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {listingData.manualData.price}
                </span>
              )}
              {listingData.manualData?.bedrooms && listingData.manualData?.bathrooms && (
                <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  {listingData.manualData.bedrooms} bed, {listingData.manualData.bathrooms} bath
                </span>
              )}
              <SaveButton
                listingData={listingData}
                propertyInput={decodeURIComponent(String(id))}
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        {listingData.manualData && (
          <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listingData.manualData.property_type && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Type:</span>{' '}
                    {listingData.manualData.property_type}
                  </span>
                </div>
              )}
              {listingData.manualData.bedrooms && (
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Bedrooms:</span> {listingData.manualData.bedrooms}
                  </span>
                </div>
              )}
              {listingData.manualData.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Bathrooms:</span>{' '}
                    {listingData.manualData.bathrooms}
                  </span>
                </div>
              )}
              {listingData.manualData.square_feet && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Square Feet:</span>{' '}
                    {listingData.manualData.square_feet.toLocaleString()}
                  </span>
                </div>
              )}
              {listingData.manualData.year_built && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Year Built:</span>{' '}
                    {listingData.manualData.year_built}
                  </span>
                </div>
              )}
              {listingData.manualData.lot_size && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Lot Size:</span> {listingData.manualData.lot_size}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Grid - 2x2 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Key Strengths */}
          {listingData.strengths?.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-emerald-100 rounded-lg">
                  <Shield className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-emerald-800 text-2xl">Key Strengths</h3>
              </div>
              <ul className="space-y-4 mb-5">
                {listingData.strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="text-base text-emerald-700 flex items-start gap-3 leading-relaxed"
                  >
                    <span className="text-emerald-500 mt-0.5 text-xl font-bold flex-shrink-0">
                      ✓
                    </span>
                    <span className="font-medium">{strength}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-emerald-100 rounded-lg p-4 border border-emerald-200">
                <p className="text-base font-semibold text-emerald-800 mb-2">💡 Take Action:</p>
                <p className="text-base text-emerald-700 leading-relaxed font-medium">
                  Consider how these strengths align with your investment goals and lifestyle
                  preferences.
                </p>
              </div>
            </div>
          )}

          {/* Areas to Research */}
          {listingData.weaknesses?.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="font-bold text-amber-800 text-2xl">Areas to Research</h3>
              </div>
              <ul className="space-y-4 mb-5">
                {listingData.weaknesses.map((weakness, i) => (
                  <li
                    key={i}
                    className="text-base text-amber-700 flex items-start gap-3 leading-relaxed"
                  >
                    <span className="text-amber-500 mt-0.5 text-xl font-bold flex-shrink-0">
                      ⚠
                    </span>
                    <span className="font-medium">{weakness}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-amber-100 rounded-lg p-4 border border-amber-200">
                <p className="text-base font-semibold text-amber-800 mb-2">🔍 Research Priority:</p>
                <p className="text-base text-amber-700 leading-relaxed font-medium">
                  Dive deeper into these areas to understand potential impacts on your decision.
                </p>
              </div>
            </div>
          )}

          {/* Hidden Risks */}
          {listingData.hiddenIssues?.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="font-bold text-red-800 text-2xl">Hidden Risks & Issues</h3>
              </div>
              <ul className="space-y-4 mb-5">
                {listingData.hiddenIssues.map((issue, i) => (
                  <li
                    key={i}
                    className="text-base text-red-700 flex items-start gap-3 leading-relaxed"
                  >
                    <span className="text-red-500 mt-0.5 text-xl font-bold flex-shrink-0">🚨</span>
                    <span className="font-medium">{issue}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-red-100 rounded-lg p-4 border border-red-200">
                <p className="text-base font-semibold text-red-800 mb-2">⚠️ Critical:</p>
                <p className="text-base text-red-700 leading-relaxed font-medium">
                  These issues require immediate attention and may significantly impact your
                  decision.
                </p>
              </div>
            </div>
          )}

          {/* Questions for Realtor */}
          {listingData.questions?.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-blue-800 text-2xl">Questions to Ask Your Realtor</h3>
              </div>
              <ul className="space-y-4 mb-5">
                {listingData.questions.map((question, i) => (
                  <li
                    key={i}
                    className="text-base text-blue-700 flex items-start gap-3 leading-relaxed"
                  >
                    <span className="text-blue-500 mt-0.5 text-xl font-bold flex-shrink-0">❓</span>
                    <span className="font-medium">{question}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-base font-semibold text-blue-800 mb-2">💡 Due Diligence:</p>
                <p className="text-base text-blue-700 leading-relaxed font-medium">
                  These questions will help you gather critical information for your decision-making
                  process.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Property Condition Indicators */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-slate-100 rounded-lg">
                <Home className="h-7 w-7 text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-xl">Property Condition Clues</h3>
            </div>
            <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
              <p className="text-base text-slate-700 leading-relaxed font-medium">
                {listingData.marketAnalysis?.trends ||
                  'Analysis based on provided property information only'}
              </p>
            </div>
          </div>

          {/* Location Advantages */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-slate-100 rounded-lg">
                <MapPin className="h-7 w-7 text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-xl">Location Benefits</h3>
            </div>
            <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
              <p className="text-base text-slate-700 leading-relaxed font-medium">
                {listingData.investmentPotential?.cash_flow ||
                  'Based on provided property details only'}
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Methodology */}
        <Card className="mt-8">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection('methodology')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analysis Methodology & Limitations
              </CardTitle>
              {expandedSections.has('methodology') ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('methodology') && (
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What This Analysis Covers</h4>
                  <p className="text-base text-gray-700 leading-relaxed font-medium">
                    This analysis evaluates the property information you provided using AI
                    technology trained on real estate principles. It identifies strengths, research
                    areas, hidden risks, and critical questions without making assumptions about
                    market conditions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Sources</h4>
                  <p className="text-base text-gray-700 leading-relaxed font-medium">
                    • Property details you provided (type, size, features, price)
                    <br />
                    • Listing description and additional notes
                    <br />• AI analysis of property characteristics and potential issues
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What&apos;s NOT Included</h4>
                  <p className="text-base text-gray-700 leading-relaxed font-medium">
                    • Current market trends or comparable sales
                    <br />
                    • Real-time property valuations
                    <br />
                    • Local market conditions or appreciation rates
                    <br />• Investment return projections
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Recommendations for Further Research
                  </h4>
                  <p className="text-base text-gray-700 leading-relaxed font-medium">
                    • Consult with local real estate professionals
                    <br />
                    • Research recent comparable sales in the area
                    <br />
                    • Investigate local market conditions and trends
                    <br />• Conduct thorough property inspections
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Generated At */}
        {listingData.generatedAt && (
          <div className="text-center text-base text-gray-700 leading-relaxed font-medium mt-8">
            Generated on: {listingData.generatedAt}
          </div>
        )}

        {/* Actions */}
        <ActionButtons />

        {/* Footer disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-base text-gray-700 leading-relaxed font-medium">
              Informational only. Please consult licensed professionals.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
