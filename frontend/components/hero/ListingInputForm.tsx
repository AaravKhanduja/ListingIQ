'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, MapPin, Search, HelpCircle, FileText, Globe, AlertCircle } from 'lucide-react';

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
  isAnalyzing,
}: ListingInputFormProps) {
  const [inputMode, setInputMode] = useState<'location' | 'text'>('location');
  const [listingText, setListingText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAnalyze = () => {
    console.log('🔍 handleAnalyze called');
    console.log('📝 Input mode:', inputMode);
    console.log('📍 Property input:', propertyInput);
    console.log('📄 Listing text:', listingText);
    console.log('📏 Text length:', listingText.length);

    setValidationError(null);

    if (inputMode === 'location' && propertyInput.trim()) {
      console.log('✅ Location mode - proceeding with analysis');
      // Store the location input and trigger analysis
      localStorage.setItem('currentProperty', propertyInput);
      localStorage.setItem('inputMode', 'location');
      onAnalyze();
    } else if (inputMode === 'text' && listingText.trim()) {
      console.log('✅ Text mode - checking length');
      if (listingText.trim().length < 50) {
        console.log('❌ Text too short:', listingText.trim().length);
        setValidationError('Please provide at least 50 characters for accurate analysis.');
        return;
      }
      console.log('✅ Text mode - proceeding with analysis');
      // Store the text input and trigger analysis
      localStorage.setItem('currentProperty', listingText);
      localStorage.setItem('inputMode', 'text');
      onAnalyze();
    } else {
      console.log('❌ Invalid input');
      setValidationError('Please provide valid input before analyzing.');
    }
  };

  const isInputValid = () => {
    if (inputMode === 'location') {
      return propertyInput.trim().length > 0;
    } else {
      return listingText.trim().length >= 50;
    }
  };

  const handleInputModeChange = (mode: 'location' | 'text') => {
    setInputMode(mode);
    setValidationError(null);
  };

  return (
    <Card className="shadow-2xl border-0 bg-white mb-8">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl text-black flex items-center">
          <MapPin className="h-6 w-6 mr-3 text-blue-600" />
          Property Analysis
        </CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Enter a property address or paste listing description to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Mode Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleInputModeChange('location')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
              inputMode === 'location'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Address Search</span>
          </button>
          <button
            onClick={() => handleInputModeChange('text')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
              inputMode === 'text'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Paste Listing</span>
          </button>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{validationError}</p>
          </div>
        )}

        {/* Location Input */}
        {inputMode === 'location' && (
          <div className="space-y-3">
            <Label htmlFor="property-input" className="text-base font-semibold text-slate-800">
              Property Address or MLS Number
            </Label>
            <div className="relative">
              <Input
                id="property-input"
                type="text"
                placeholder="e.g., 123 Oak Street, San Francisco, CA or MLS# 123456"
                value={propertyInput}
                onChange={(e) => setPropertyInput(e.target.value)}
                className="h-14 text-base pl-12 pr-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-colors"
                disabled={isAnalyzing}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              We'll search Zillow, Redfin, and MLS databases
            </p>
          </div>
        )}

        {/* Text Input */}
        {inputMode === 'text' && (
          <div className="space-y-3">
            <Label htmlFor="listing-text" className="text-base font-semibold text-slate-800">
              Listing Description
            </Label>
            <div className="relative">
              <Textarea
                id="listing-text"
                placeholder="Paste the full listing description, property details, or any real estate listing text here..."
                value={listingText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setListingText(e.target.value)
                }
                className="min-h-[120px] text-base pl-4 pr-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-colors resize-none"
                disabled={isAnalyzing}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                Minimum 50 characters for accurate analysis
              </p>
              <p
                className={`text-sm ${
                  listingText.length >= 50 ? 'text-green-600' : 'text-slate-400'
                }`}
              >
                {listingText.length}/50 characters
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!isInputValid() || isAnalyzing}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl"
        >
          {isAnalyzing ? (
            <>Analyzing Property...</>
          ) : (
            <>
              {inputMode === 'location' ? 'Search & Analyze' : 'Analyze Listing Text'}
              <ArrowRight className="h-5 w-5 ml-3" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
