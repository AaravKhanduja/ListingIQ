import { ReactNode } from 'react';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {children}
    </div>
  );
}