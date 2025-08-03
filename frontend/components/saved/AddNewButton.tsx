'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface AddNewButtonProps {
  href?: string;
  text?: string;
}

export function AddNewButton({ href = '/', text = 'Analyze another property' }: AddNewButtonProps) {
  return (
    <div className="mt-8 pt-6 border-t border-blue-200">
      <Link href={href}>
        <Button
          variant="outline"
          className="w-full h-12 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          {text}
        </Button>
      </Link>
    </div>
  );
}
