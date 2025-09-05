'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const description = searchParams.get('description');

  const getErrorMessage = () => {
    switch (error) {
      case 'config':
        return 'Supabase is not properly configured. Please check your environment variables.';
      case 'exchange':
        return 'Failed to exchange authorization code for session. This might be a temporary issue.';
      case 'no_code':
        return 'No authorization code was provided. Please try signing in again.';
      case 'unexpected':
        return 'An unexpected error occurred during authentication.';
      case 'not_authenticated':
        return 'Authentication failed. Please try signing in again.';
      default:
        return 'There was an error during the authentication process.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="text-gray-600 mt-2">{getErrorMessage()}</p>
          {description && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs text-gray-600 font-mono break-all">{description}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            Please try signing in again or contact support if the problem persists.
          </p>
          <div className="flex space-x-3">
            <Link href="/auth/signin" className="flex-1">
              <Button className="w-full">Try Again</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
              <p className="text-gray-600 mt-2">Loading...</p>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <AuthCodeErrorContent />
    </Suspense>
  );
}
