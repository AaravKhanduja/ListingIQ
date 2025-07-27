"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';

interface AnalysisSectionProps {
  title: string;
  description: string;
  icon: typeof Shield;
  iconBg: string;
  bgColor: string;
  borderColor: string;
  items: string[];
  labelIcon: string;
}

export function AnalysisSection({ 
  title, 
  description, 
  icon: Icon, 
  iconBg, 
  bgColor, 
  borderColor, 
  items, 
  labelIcon 
}: AnalysisSectionProps) {
  return (
    <Card className="border-0 shadow-xl h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${iconBg.includes('green') ? 'text-green-600' : 
                                      iconBg.includes('orange') ? 'text-orange-600' : 
                                      iconBg.includes('red') ? 'text-red-600' : 'text-indigo-600'}`} />
          </div>
          <div>
            <CardTitle className="text-xl text-black">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className={`flex items-start space-x-3 p-3 ${bgColor} rounded-lg border ${borderColor}`}>
              <div className={`w-6 h-6 ${iconBg.replace('100', '200')} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className={`${iconBg.includes('green') ? 'text-green-800' : 
                                  iconBg.includes('orange') ? 'text-orange-800' : 
                                  iconBg.includes('red') ? 'text-red-800' : 'text-indigo-800'} text-sm font-bold`}>
                  {labelIcon === 'number' ? index + 1 : labelIcon}
                </span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}