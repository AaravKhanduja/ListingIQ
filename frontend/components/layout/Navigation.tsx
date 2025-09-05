'use client';

import { Button } from '@/components/ui/button';
import { Home, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { ProfileOverlay } from '@/components/auth/ProfileOverlay';

export function Navigation() {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="border-b border-blue-100 bg-white/90 sticky top-0 z-50">
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
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user.user_metadata?.full_name?.charAt(0) ||
                        user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <User className="h-4 w-4" />
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

      <ProfileOverlay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  );
}
