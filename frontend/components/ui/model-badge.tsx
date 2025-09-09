'use client';

import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ModelInfo {
  provider: 'openai' | 'ollama';
  model: string;
  environment: 'development' | 'production';
}

export function ModelBadge() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Only show on app pages (not landing page or auth pages)
  const shouldShow = pathname && !pathname.startsWith('/auth') && pathname !== '/';

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const response = await fetch('/api/model-info');
        if (response.ok) {
          const data = await response.json();
          setModelInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch model info:', error);
        // Fallback to showing unknown
        setModelInfo({
          provider: 'openai',
          model: 'unknown',
          environment: 'development',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchModelInfo();
  }, []);

  if (isLoading || !modelInfo || !shouldShow) {
    return null;
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ollama':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant="outline"
        className={`text-xs font-medium ${getProviderColor(modelInfo.provider)}`}
      >
        {modelInfo.provider.toUpperCase()}: {modelInfo.model}
      </Badge>
    </div>
  );
}
