'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Search } from 'lucide-react';
import {
  StatsCards,
  SearchBar,
  EmptyState,
  AnalysisCard,
  AddNewButton,
  LoadingState,
  formatDate,
  getScoreColor,
  getTimeAgo,
  getThisWeekCount,
} from '@/components/saved';

interface SavedAnalysis {
  id: number;
  date: string;
  title: string;
  propertyInput: string;
  analysis: {
    overallScore?: number;
    strengths?: string[];
    risks?: string[];
    hiddenIssues?: string[];
    questions?: string[];
  };
}

export default function SavedAnalysesPage() {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAnalyses, setFilteredAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const loadData = async () => {
      setIsLoading(true);
      try {
        const saved = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
        setSavedAnalyses(saved);
        setFilteredAnalyses(saved);
      } catch (error) {
        console.error('Error loading saved analyses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = savedAnalyses.filter(
      (analysis) =>
        analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.propertyInput.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by date (newest first)
    filtered = filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFilteredAnalyses(filtered);
  }, [searchTerm, savedAnalyses]);

  const handleDelete = (id: number) => {
    const updated = savedAnalyses.filter((analysis) => analysis.id !== id);
    setSavedAnalyses(updated);
    localStorage.setItem('savedAnalyses', JSON.stringify(updated));
  };

  const thisWeekCount = getThisWeekCount(savedAnalyses);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Saved Listings</h1>
            <p className="text-slate-600">Your analyzed properties and insights</p>
          </div>
          <LoadingState />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Saved Listings</h1>
          <p className="text-slate-600">Your analyzed properties and insights</p>
        </div>

        {/* Stats */}
        <StatsCards totalCount={savedAnalyses.length} thisWeekCount={thisWeekCount} />

        {/* Search */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Empty State */}
        {filteredAnalyses.length === 0 && searchTerm === '' && (
          <EmptyState
            title="No saved listings"
            description="Start analyzing properties to build your research history"
            showActionButton={true}
            actionText="Analyze Property"
            actionHref="/"
          />
        )}

        {/* No Search Results */}
        {filteredAnalyses.length === 0 && searchTerm !== '' && (
          <EmptyState
            title="No results found"
            description="Try adjusting your search terms"
            showActionButton={false}
            icon={<Search className="h-8 w-8 text-blue-600" />}
          />
        )}

        {/* Listings */}
        {filteredAnalyses.length > 0 && (
          <div className="space-y-4">
            {filteredAnalyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onDelete={handleDelete}
                getScoreColor={getScoreColor}
                formatDate={formatDate}
                getTimeAgo={getTimeAgo}
              />
            ))}
          </div>
        )}

        {/* Add New Button */}
        {filteredAnalyses.length > 0 && <AddNewButton />}
      </main>
    </div>
  );
}
