'use client';

import { Progress } from '@/components/ui/progress';

interface LoadingStateProps {
  analysisProgress: number;
}

export function LoadingState({ analysisProgress }: LoadingStateProps) {
  const getProgressMessage = (progress: number) => {
    if (progress < 20) return 'Fetching property data...';
    if (progress < 40) return 'Analyzing listing details...';
    if (progress < 70) return 'Identifying potential risks...';
    if (progress < 90) return 'Generating insights...';
    return 'Analysis complete!';
  };

  // Custom loading animation component
  const LoadingDots = () => (
    <div className="flex space-x-1 justify-center items-center">
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mb-4">
              <LoadingDots />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Analyzing Property</h2>
            <p className="text-slate-600">{getProgressMessage(analysisProgress)}</p>
          </div>

          <div className="space-y-3">
            <Progress value={analysisProgress} className="w-full" />
            <p className="text-sm text-slate-500">{analysisProgress}% complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
