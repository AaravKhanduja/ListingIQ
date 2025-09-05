'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { User, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface ProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileOverlay({ isOpen, onClose }: ProfileOverlayProps) {
  const { user, signOut, deleteAccount } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeletingAccount(true);
    try {
      const result = await deleteAccount();
      if (!result.success) {
        console.error('Failed to delete account:', result.error);
        // You could show a toast notification here
        alert(`Failed to delete account: ${result.error}`);
      }
      // If successful, the user will be redirected automatically
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An unexpected error occurred while deleting your account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!isOpen || !user) return null;

  const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[28rem] max-w-[calc(100vw-2rem)]"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Account
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.user_metadata?.full_name?.charAt(0) ||
                      user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700">Name</span>
                  <span className="text-sm text-gray-900">
                    {user.user_metadata?.full_name || 'Not provided'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <span className="text-sm text-gray-900 truncate max-w-[180px]">{user.email}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700">Environment</span>
                  <span className="text-sm text-gray-900">{environment}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions Section */}
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-600">Danger Zone</h3>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and
                      remove all your saved analyses from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
