'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Archive, Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  showActionButton?: boolean;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  showActionButton = false,
  actionText = 'Analyze Property',
  actionHref = '/',
  icon = <Archive className="h-8 w-8 text-blue-600" />,
}: EmptyStateProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="text-center py-16">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>
        {showActionButton && (
          <Link href={actionHref}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {actionText}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
