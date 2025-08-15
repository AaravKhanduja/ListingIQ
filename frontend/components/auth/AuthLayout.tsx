'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">ListingIQ</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12">{children}</main>
    </div>
  );
}
