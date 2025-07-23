"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, MapPin, Search, HelpCircle } from 'lucide-react';

interface ListingInputFormProps {
  propertyInput: string;
  setPropertyInput: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function ListingInputForm({ 
  propertyInput, 
  setPropertyInput, 
  onAnalyze, 
  isAnalyzing 
}: ListingInputFormProps) {
  return (
    <Card className="shadow-2xl border-0 bg-white mb-8">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl text-black flex items-center">
          <MapPin className="h-6 w-6 mr-3 text-blue-600" />
          Property Analysis
        </CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Enter a property address, MLS number, or listing URL to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="property-input" className="text-base font-semibold text-slate-800">
            Property Location or Listing URL
          </Label>
          <div className="relative">
            <Input
              id="property-input"
              type="text"
              placeholder="e.g., 123 Oak Street, San Francisco, CA or https://zillow.com/homedetails/..."
              value={propertyInput}
              onChange={(e) => setPropertyInput(e.target.value)}
              className="h-14 text-base pl-12 pr-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-colors"
              disabled={isAnalyzing}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 flex items-center">
            <HelpCircle className="h-4 w-4 mr-1" />
            Supports addresses, MLS numbers, Zillow, Redfin, and Realtor.com URLs
          </p>
        </div>

        <Button 
          onClick={onAnalyze} 
          disabled={!propertyInput.trim() || isAnalyzing}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl"
        >
          {isAnalyzing ? (
            <>
              Analyzing Property...
            </>
          ) : (
            <>
              Analyze This Property
              <ArrowRight className="h-5 w-5 ml-3" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}