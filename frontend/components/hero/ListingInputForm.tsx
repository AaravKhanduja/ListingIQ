'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  MapPin,
  AlertCircle,
  Home,
  Bed,
  Bath,
  Ruler,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';
import { ManualPropertyData } from '@/lib/analyze';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [manualData, setManualData] = useState<Partial<ManualPropertyData>>({
    listing_description: '',
    property_type: '',
    bedrooms: undefined,
    bathrooms: undefined,
    square_feet: undefined,
    year_built: undefined,
    lot_size: '',
    price: '',
    location_details: '',
    additional_notes: '',
  });

  const handleAnalyze = () => {
    setValidationError(null);

    if (propertyInput.trim() && (manualData.listing_description || '').trim()) {

      // Store both the address and manual data
      const analysisData = {
        address: propertyInput,
        manualData: {
          ...manualData,
          listing_description: manualData.listing_description || '',
        } as ManualPropertyData,
      };

      localStorage.setItem('currentProperty', JSON.stringify(analysisData));
      onAnalyze();
    } else {
      console.log('❌ Invalid input');
      if (!propertyInput.trim()) {
        setValidationError('Please provide a valid property address.');
      } else if (!(manualData.listing_description || '').trim()) {
        setValidationError('Please provide a listing description.');
      }
    }
  };

  const isInputValid = () => {
    return (
      propertyInput.trim().length > 0 && (manualData.listing_description || '').trim().length > 0
    );
  };

  const updateManualData = (
    field: keyof ManualPropertyData,
    value: string | number | undefined
  ) => {
    setManualData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  return (
    <Card className="shadow-2xl border-0 bg-white mb-8">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl text-black flex items-center">
          <Home className="h-6 w-6 mr-3 text-blue-600" />
          Property Analysis
        </CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Paste a listing description and add property details for expert analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation Error */}
        {validationError && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{validationError}</p>
          </div>
        )}

        {/* Property Address */}
        <div className="space-y-3">
          <Label htmlFor="property-input" className="text-base font-semibold text-slate-800">
            Property Address
          </Label>
          <div className="relative">
            <Input
              id="property-input"
              type="text"
              placeholder="e.g., 123 Oak Street, San Francisco, CA"
              value={propertyInput}
              onChange={(e) => setPropertyInput(e.target.value)}
              className="h-14 text-base pl-12 pr-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-colors"
              disabled={isAnalyzing}
            />
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Listing Description */}
        <div className="space-y-3">
          <Label htmlFor="listing-description" className="text-base font-semibold text-slate-800">
            Listing Description <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Textarea
              id="listing-description"
              placeholder="Paste the full listing description here. Include details about features, condition, neighborhood, etc."
              value={manualData.listing_description || ''}
              onChange={(e) => updateManualData('listing_description', e.target.value)}
              className="min-h-32 text-base pl-12 pr-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-colors resize-none"
              disabled={isAnalyzing}
            />
            <FileText className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">
            The more detailed the description, the better the analysis will be.
          </p>
        </div>

        {/* Advanced Fields Toggle */}
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvancedFields(!showAdvancedFields)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            {showAdvancedFields ? 'Hide' : 'Show'} Additional Property Details
          </Button>
        </div>

        {/* Advanced Fields */}
        {showAdvancedFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="property-type" className="text-sm font-medium text-slate-700">
                Property Type
              </Label>
              <Input
                id="property-type"
                placeholder="e.g., Single Family, Condo, Townhouse"
                value={manualData.property_type || ''}
                onChange={(e) => updateManualData('property_type', e.target.value)}
                className="border-slate-200"
                disabled={isAnalyzing}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-slate-700">
                Price
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  placeholder="e.g., $750,000"
                  value={manualData.price || ''}
                  onChange={(e) => updateManualData('price', e.target.value)}
                  className="pl-8 border-slate-200"
                  disabled={isAnalyzing}
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="text-sm font-medium text-slate-700">
                Bedrooms
              </Label>
              <div className="relative">
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="3"
                  value={manualData.bedrooms || ''}
                  onChange={(e) =>
                    updateManualData(
                      'bedrooms',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="pl-8 border-slate-200"
                  disabled={isAnalyzing}
                />
                <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="text-sm font-medium text-slate-700">
                Bathrooms
              </Label>
              <div className="relative">
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="2.5"
                  value={manualData.bathrooms || ''}
                  onChange={(e) =>
                    updateManualData(
                      'bathrooms',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="pl-8 border-slate-200"
                  disabled={isAnalyzing}
                />
                <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Square Feet */}
            <div className="space-y-2">
              <Label htmlFor="square-feet" className="text-sm font-medium text-slate-700">
                Square Feet
              </Label>
              <div className="relative">
                <Input
                  id="square-feet"
                  type="number"
                  placeholder="2,100"
                  value={manualData.square_feet || ''}
                  onChange={(e) =>
                    updateManualData(
                      'square_feet',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="pl-8 border-slate-200"
                  disabled={isAnalyzing}
                />
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Year Built */}
            <div className="space-y-2">
              <Label htmlFor="year-built" className="text-sm font-medium text-slate-700">
                Year Built
              </Label>
              <div className="relative">
                <Input
                  id="year-built"
                  type="number"
                  placeholder="1995"
                  value={manualData.year_built || ''}
                  onChange={(e) =>
                    updateManualData(
                      'year_built',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="pl-8 border-slate-200"
                  disabled={isAnalyzing}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Lot Size */}
            <div className="space-y-2">
              <Label htmlFor="lot-size" className="text-sm font-medium text-slate-700">
                Lot Size
              </Label>
              <Input
                id="lot-size"
                placeholder="e.g., 0.25 acres, 8,000 sq ft"
                value={manualData.lot_size || ''}
                onChange={(e) => updateManualData('lot_size', e.target.value)}
                className="border-slate-200"
                disabled={isAnalyzing}
              />
            </div>

            {/* Location Details */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location-details" className="text-sm font-medium text-slate-700">
                Location Details
              </Label>
              <Input
                id="location-details"
                placeholder="e.g., Near downtown, close to schools, quiet neighborhood"
                value={manualData.location_details || ''}
                onChange={(e) => updateManualData('location_details', e.target.value)}
                className="border-slate-200"
                disabled={isAnalyzing}
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="additional-notes" className="text-sm font-medium text-slate-700">
                Additional Notes
              </Label>
              <Textarea
                id="additional-notes"
                placeholder="Any other relevant information about the property, neighborhood, or market conditions"
                value={manualData.additional_notes || ''}
                onChange={(e) => updateManualData('additional_notes', e.target.value)}
                className="min-h-20 border-slate-200 resize-none"
                disabled={isAnalyzing}
              />
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
              Get Expert Analysis
              <ArrowRight className="h-5 w-5 ml-3" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
