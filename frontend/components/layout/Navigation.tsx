"use client";

import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';

export function Navigation() {
  return (
    <header className="border-b border-blue-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">ListingIQ</span>
          </div>
          <nav className="flex items-center">
            <Link href="/saved">
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                Saved Listings
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}