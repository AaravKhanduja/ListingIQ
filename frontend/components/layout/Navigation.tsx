'use client';

import { Button } from '@/components/ui/button';
import { Home, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

export function Navigation() {
  const { signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (!user) return;

    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      // Even if signout fails, try to redirect
      window.location.href = '/auth/signin';
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-blue-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
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
          <nav className="flex items-center space-x-3">
            {user && (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Link href="/saved">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    Saved Listings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Button>
              </>
            )}
            {!user && (
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
