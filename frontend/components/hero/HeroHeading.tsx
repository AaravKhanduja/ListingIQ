'use client';

import { Shield } from 'lucide-react';

export function HeroHeading() {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
        <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
        AI-Powered Property Analysis
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 leading-tight px-4 sm:px-0">
        Smart Real Estate Analysis for
        <span className="text-blue-600"> First-Time Buyers</span>
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
        Get instant insights on property strengths, risks, and hidden issues before you buy.
      </p>
    </div>
  );
}
