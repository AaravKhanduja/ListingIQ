"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin,
  Download,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

interface ListingHeaderProps {
  propertyTitle: string;
  summary: string;
  overallScore: number;
  propertyId: string;
}

export function ListingHeader({ propertyTitle, summary, overallScore, propertyId }: ListingHeaderProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="mb-8 border-0 shadow-xl">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl text-black">{propertyTitle}</CardTitle>
            </div>
            <CardDescription className="text-base text-slate-600 leading-relaxed mb-4">
              {summary}
            </CardDescription>
            
            
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center flex-shrink-0">
              <div className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold text-lg ${getScoreColor(overallScore)}`}>
                <TrendingUp className="h-5 w-5 mr-2" />
                {overallScore}/100
              </div>
              <p className="text-sm text-slate-600 mt-2">{getScoreLabel(overallScore)} Investment</p>
            </div>
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}