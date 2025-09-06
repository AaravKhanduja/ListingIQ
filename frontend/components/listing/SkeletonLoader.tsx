'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonSectionProps {
  title: string;
  icon: React.ReactNode;
  itemCount?: number;
  bgColor?: string;
  borderColor?: string;
}

export function SkeletonSection({
  icon,
  itemCount = 4,
  bgColor = 'bg-slate-50',
  borderColor = 'border-slate-200',
}: SkeletonSectionProps) {
  return (
    <Card className="border-0 shadow-xl h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 ${bgColor} rounded-lg border ${borderColor}`}
            >
              <Skeleton className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalysisSkeletonLoader() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Key Strengths Skeleton */}
      <SkeletonSection
        title="Key Strengths"
        icon={<div className="h-6 w-6 bg-emerald-200 rounded" />}
        itemCount={4}
        bgColor="bg-emerald-50"
        borderColor="border-emerald-200"
      />

      {/* Areas to Research Skeleton */}
      <SkeletonSection
        title="Areas to Research"
        icon={<div className="h-6 w-6 bg-amber-200 rounded" />}
        itemCount={4}
        bgColor="bg-amber-50"
        borderColor="border-amber-200"
      />

      {/* Hidden Risks Skeleton */}
      <SkeletonSection
        title="Hidden Risks & Issues"
        icon={<div className="h-6 w-6 bg-red-200 rounded" />}
        itemCount={4}
        bgColor="bg-red-50"
        borderColor="border-red-200"
      />

      {/* Questions Skeleton */}
      <SkeletonSection
        title="Questions to Ask Your Realtor"
        icon={<div className="h-6 w-6 bg-blue-200 rounded" />}
        itemCount={6}
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
      />
    </div>
  );
}

export function PropertyDetailsSkeleton() {
  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SummarySkeleton() {
  return (
    <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  );
}
