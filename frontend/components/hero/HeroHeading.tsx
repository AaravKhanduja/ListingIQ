'use client';

import { Shield } from 'lucide-react';

export function HeroHeading() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
        <Shield className="h-4 w-4 mr-2" />
        AI-Powered Property Analysis
      </div>
      <h1 className="text-4xl font-bold text-black mb-4 leading-tight">
        Smart Real Estate Analysis for
        <span className="text-blue-600"> First-Time Buyers</span>
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Get instant insights on property strengths, risks, and hidden issues before you buy.
      </p>
    </div>
  );
}
