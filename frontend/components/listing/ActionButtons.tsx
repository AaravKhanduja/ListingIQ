"use client";

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export function ActionButtons() {
  return (
    <>
      <Separator className="my-12" />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl shadow-lg">
            Analyze Another Property
          </Button>
        </Link>
        <Link href="/saved">
          <Button variant="outline" size="lg" className="px-8 py-3 rounded-xl border-2">
            View Saved Listings
          </Button>
        </Link>
      </div>
    </>
  );
}