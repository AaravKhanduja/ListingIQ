'use client';

import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Download, Loader2 } from 'lucide-react';
import { downloadTextPDF } from '@/lib/pdf-utils';

interface ListingHeaderProps {
  propertyTitle: string;
  summary: string;
  propertyId: string;
}

export function ListingHeader({ propertyTitle, summary, propertyId }: ListingHeaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const filename = `${propertyTitle.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.pdf`;

      console.log('Generating PDF...');
      await downloadTextPDF(filename);
      console.log('PDF generation successful');
    } catch (error) {
      console.error('Download failed:', error);

      // User-friendly error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`PDF generation failed: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
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
            <Button
              className="bg-black hover:bg-gray-800 text-white"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              data-download-pdf
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? 'Generating...' : 'PDF'}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
