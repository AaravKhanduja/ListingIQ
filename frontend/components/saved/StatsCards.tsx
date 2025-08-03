'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Archive, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalCount: number;
  thisWeekCount: number;
}

export function StatsCards({ totalCount, thisWeekCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 font-normal">Total listings</p>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Archive className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-3xl font-bold text-black">{totalCount}</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 font-normal">This week</p>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-3xl font-bold text-black">{thisWeekCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
