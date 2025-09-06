// frontend/lib/analyze-streaming.ts

import { ManualPropertyData } from './analyze';

export interface StreamingAnalysisSection {
  type: 'analysis_started' | 'section_complete' | 'analysis_complete' | 'error';
  analysis_id?: string;
  section?: string;
  data?: Record<string, unknown>;
  message?: string;
}

export interface StreamingAnalysisState {
  analysisId: string | null;
  summary: {
    summary: string;
    overall_score: number;
  } | null;
  strengths: string[];
  weaknesses: string[];
  hiddenRisks: string[];
  questions: string[];
  isComplete: boolean;
  error: string | null;
}

export class StreamingAnalysisClient {
  private onUpdate: (updater: (prev: StreamingAnalysisState) => StreamingAnalysisState) => void;
  private onError: (error: string) => void;

  constructor(
    onUpdate: (updater: (prev: StreamingAnalysisState) => StreamingAnalysisState) => void,
    onError: (error: string) => void
  ) {
    this.onUpdate = onUpdate;
    this.onError = onError;
  }

  async startAnalysis(
    propertyAddress: string,
    propertyTitle: string,
    manualData?: ManualPropertyData,
    userToken?: string
  ): Promise<void> {
    if (!userToken) {
      throw new Error('Authentication token required');
    }

    const requestBody = {
      property_address: propertyAddress,
      property_title: propertyTitle,
      manual_data: manualData,
    };

    // Start with initial state
    this.onUpdate(() => ({
      analysisId: null,
      summary: null,
      strengths: [],
      weaknesses: [],
      hiddenRisks: [],
      questions: [],
      isComplete: false,
      error: null,
    }));

    try {
      // Send the analysis request via POST to start streaming
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = new URL('/api/analyze/stream', baseUrl);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analysis request failed:', {
          status: response.status,
          statusText: response.statusText,
          url: url.toString(),
          error: errorText
        });
        throw new Error(`Analysis request failed: ${response.status} ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available for streaming');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingAnalysisSection = JSON.parse(line.slice(6));
              this.handleStreamEvent(data);
            } catch (error) {
              console.error('Error parsing stream event:', error);
              this.onError('Failed to parse analysis data');
            }
          }
        }
      }

    } catch (error) {
      this.onError(error instanceof Error ? error.message : 'Failed to start analysis');
    }
  }

  private handleStreamEvent(data: StreamingAnalysisSection) {
    console.log('Stream event received:', data);
    switch (data.type) {
      case 'analysis_started':
        console.log('Analysis started with ID:', data.analysis_id);
        this.onUpdate(prev => ({
          ...prev,
          analysisId: data.analysis_id || null,
        }));
        break;

      case 'section_complete':
        console.log('Section completed:', data.section, data.data);
        if (data.section && data.data) {
          // Batch updates to reduce re-renders
          this.onUpdate(prev => {
            const newState = { ...prev };
            
            switch (data.section) {
              case 'summary':
                if (data.data && typeof data.data === 'object' && 'summary' in data.data && 'overall_score' in data.data) {
                  newState.summary = data.data as { summary: string; overall_score: number };
                }
                break;
              case 'strengths':
                if (data.data && typeof data.data === 'object' && 'strengths' in data.data) {
                  const strengths = (data.data as { strengths?: unknown }).strengths;
                  newState.strengths = Array.isArray(strengths) ? strengths.filter(s => typeof s === 'string') : [];
                }
                break;
              case 'research_areas':
                if (data.data && typeof data.data === 'object' && 'weaknesses' in data.data) {
                  const weaknesses = (data.data as { weaknesses?: unknown }).weaknesses;
                  newState.weaknesses = Array.isArray(weaknesses) ? weaknesses.filter(w => typeof w === 'string') : [];
                }
                break;
              case 'hidden_risks':
                if (data.data && typeof data.data === 'object' && 'hidden_risks' in data.data) {
                  const risks = (data.data as { hidden_risks?: unknown }).hidden_risks;
                  newState.hiddenRisks = Array.isArray(risks) ? risks.filter(r => typeof r === 'string') : [];
                }
                break;
              case 'questions':
                if (data.data && typeof data.data === 'object' && 'questions' in data.data) {
                  const questions = (data.data as { questions?: unknown }).questions;
                  newState.questions = Array.isArray(questions) ? questions.filter(q => typeof q === 'string') : [];
                }
                break;
            }
            
            return newState;
          });
        }
        break;

      case 'analysis_complete':
        this.onUpdate(prev => ({
          ...prev,
          isComplete: true,
        }));
        this.cleanup();
        break;

      case 'error':
        this.onError(data.message || 'Analysis failed');
        this.cleanup();
        break;
    }
  }

  cleanup() {
    // No longer using EventSource, so no cleanup needed
    // The fetch stream will be automatically cleaned up when the promise resolves
  }
}

// React hook for streaming analysis
export function useStreamingAnalysis() {
  const [state, setState] = React.useState<StreamingAnalysisState>(() => {
    // Try to restore state from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('streaming_analysis_state');
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch {
          // If parsing fails, use default state
        }
      }
    }
    
    return {
      analysisId: null,
      summary: null,
      strengths: [],
      weaknesses: [],
      hiddenRisks: [],
      questions: [],
      isComplete: false,
      error: null,
    };
  });

  const [client, setClient] = React.useState<StreamingAnalysisClient | null>(null);

  const startAnalysis = React.useCallback(async (
    propertyAddress: string,
    propertyTitle: string,
    manualData?: ManualPropertyData,
    userToken?: string
  ) => {
    // Clear previous state when starting new analysis
    setState({
      analysisId: null,
      summary: null,
      strengths: [],
      weaknesses: [],
      hiddenRisks: [],
      questions: [],
      isComplete: false,
      error: null,
    });

    const newClient = new StreamingAnalysisClient(
      setState,
      (error) => setState(prev => ({ ...prev, error }))
    );
    
    setClient(newClient);
    await newClient.startAnalysis(propertyAddress, propertyTitle, manualData, userToken);
  }, []);

  const stopAnalysis = React.useCallback(() => {
    if (client) {
      client.cleanup();
      setClient(null);
    }
  }, [client]);

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('streaming_analysis_state', JSON.stringify(state));
    }
  }, [state]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (client) {
        client.cleanup();
      }
    };
  }, [client]);

  return {
    state,
    startAnalysis,
    stopAnalysis,
    isAnalyzing: client !== null && !state.isComplete && !state.error,
  };
}

// Import React for the hook
import React from 'react';
