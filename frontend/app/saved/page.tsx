'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  StatsCards,
  SearchBar,
  EmptyState,
  AnalysisCard,
  AddNewButton,
  LoadingState,
  BackButton,
  formatDate,
  getScoreColor,
  getTimeAgo,
} from '@/components/saved';

interface SavedAnalysis {
  id: number;
  date: string;
  title: string;
  propertyInput: string;
  analysis: {
    overallScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    hiddenIssues?: string[];
    questions?: string[];
  };
}

export default function SavedPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<SavedAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAnalyses = localStorage.getItem('savedAnalyses');
    if (savedAnalyses) {
      const parsed = JSON.parse(savedAnalyses);
      setAnalyses(parsed);
      setFilteredAnalyses(parsed);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const filtered = analyses.filter(
      (analysis) =>
        analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.propertyInput.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnalyses(filtered);
  }, [searchTerm, analyses]);

  const handleDelete = (id: number) => {
    const updatedAnalyses = analyses.filter((analysis) => analysis.id !== id);
    setAnalyses(updatedAnalyses);
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses));
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Saved Analyses</h1>
            <p className="text-slate-600">Your saved property analyses</p>
          </div>

          <StatsCards totalCount={analyses.length} thisWeekCount={getThisWeekCount(analyses)} />

          <div className="mt-8">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>

          {filteredAnalyses.length === 0 ? (
            <EmptyState
              title={analyses.length === 0 ? 'No saved analyses' : 'No results found'}
              description={
                analyses.length === 0
                  ? 'Start analyzing properties to build your research history'
                  : 'Try adjusting your search terms'
              }
              showActionButton={analyses.length === 0}
              actionText="Analyze Property"
              actionHref="/"
            />
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          <AddNewButton />
        </div>
      </div>
    </ProtectedRoute>
  );
}

function getThisWeekCount(analyses: SavedAnalysis[]): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return analyses.filter((analysis) => {
    const createdAt = new Date(analysis.date);
    return createdAt >= oneWeekAgo;
  }).length;
}
