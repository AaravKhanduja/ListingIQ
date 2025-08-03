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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 font-normal">Total listings</p>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Archive className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-3xl font-bold text-black">{totalCount}</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 font-normal">This week</p>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
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
