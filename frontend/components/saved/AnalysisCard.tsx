'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Eye, Download, Trash2, MapPin } from 'lucide-react';
import Link from 'next/link';

interface SavedAnalysis {
  id: string;
  date: string;
  title: string;
  propertyInput: string;
  analysis: {
    overallScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    hiddenIssues?: string[];
    questions?: string[];
  };
}

interface AnalysisCardProps {
  analysis: SavedAnalysis;
  onDelete: (id: string) => void;
  getScoreColor: (score: number) => string;
  formatDate: (dateString: string) => string;
  getTimeAgo: (dateString: string) => string;
}

export function AnalysisCard({
  analysis,
  onDelete,
  getScoreColor,
  formatDate,
  getTimeAgo,
}: AnalysisCardProps) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        {/* Header with icon and title */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-black truncate">{analysis.title}</h3>
              {analysis.analysis?.overallScore && (
                <Badge
                  variant="outline"
                  className={`${getScoreColor(analysis.analysis.overallScore)}`}
                >
                  {Math.round(analysis.analysis.overallScore / 20)}/5
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(analysis.date)}</span>
              </span>
              <span>{getTimeAgo(analysis.date)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-2">
          <Link href={`/listing/${encodeURIComponent(analysis.propertyInput)}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this analysis? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(analysis.id)}
                  className="bg-red-600 hover:text-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
