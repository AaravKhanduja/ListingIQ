'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  text?: string;
}

export function BackButton({ href = '/', text = 'Back to Analysis' }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button variant="outline" size="sm" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {text}
      </Button>
    </Link>
  );
}
