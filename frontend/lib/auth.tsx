'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development mode user type
interface DevUser {
  id: string;
  email: string;
  user_metadata?: { name?: string };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we're in development mode
  const isDevMode = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (isDevMode) {
      // Development mode: use localStorage
      const devUser = localStorage.getItem('dev-user');
      if (devUser) {
        try {
          const parsedUser = JSON.parse(devUser) as DevUser;
          setUser(parsedUser as User);
        } catch {
          localStorage.removeItem('dev-user');
        }
      }
      setLoading(false);
    } else {
      // Production mode: check for existing session
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        // Use Supabase to check session
        const checkSession = async () => {
          try {
            const { getCurrentUser } = await import('@/lib/supabase/auth');
            const user = await getCurrentUser();
            if (user) {
              setUser(user);
            }
          } catch (error) {
            console.error('Error checking session:', error);
          } finally {
            setLoading(false);
          }
        };
        checkSession();
      } else {
        // No Supabase configured, just set loading to false
        setLoading(false);
      }
    }
  }, [isDevMode]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (isDevMode) {
        // Development mode: simulate successful login
        const devUser: DevUser = {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: { name: email.split('@')[0] },
        };
        localStorage.setItem('dev-user', JSON.stringify(devUser));
        setUser(devUser as User);
        return { error: null };
      }

      // Production mode: use Supabase if configured, otherwise redirect
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        // Use Supabase auth
        const { signInWithEmail } = await import('@/lib/supabase/auth');
        return await signInWithEmail(email, password);
      } else {
        // No Supabase configured, redirect to signin page
        window.location.href = '/auth/signin';
        return { error: null };
      }
    },
    [isDevMode]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (isDevMode) {
        // Development mode: simulate successful signup
        const devUser: DevUser = {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: { name: email.split('@')[0] },
        };
        localStorage.setItem('dev-user', JSON.stringify(devUser));
        setUser(devUser as User);
        return { error: null };
      }

      // Production mode: use Supabase if configured, otherwise redirect
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        // Use Supabase auth
        const { signUpWithEmail } = await import('@/lib/supabase/auth');
        return await signUpWithEmail(email, password);
      } else {
        // No Supabase configured, redirect to signup page
        window.location.href = '/auth/signup';
        return { error: null };
      }
    },
    [isDevMode]
  );

  const signInWithGoogle = useCallback(async () => {
    if (isDevMode) {
      // Development mode: simulate Google login
      const devUser: DevUser = {
        id: 'dev-user-' + Date.now(),
        email: 'dev-user@example.com',
        user_metadata: { name: 'Dev User' },
      };
      localStorage.setItem('dev-user', JSON.stringify(devUser));
      setUser(devUser as User);
      return { error: null };
    }

    // Production mode: use Supabase if configured, otherwise redirect
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      // Use Supabase auth
      const { signInWithGoogle } = await import('@/lib/supabase/auth');
      return await signInWithGoogle();
    } else {
      // No Supabase configured, redirect to signin page
      window.location.href = '/auth/signin';
      return { error: null };
    }
  }, [isDevMode]);

  const signOut = useCallback(async () => {
    if (isDevMode) {
      // Development mode: clear localStorage
      localStorage.removeItem('dev-user');
      setUser(null);
      return;
    }

    // Production mode: use Supabase if configured, otherwise redirect
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      // Use Supabase auth
      const { signOut } = await import('@/lib/supabase/auth');
      await signOut();
      setUser(null);
    } else {
      // No Supabase configured, redirect to signin page
      window.location.href = '/auth/signin';
    }
  }, [isDevMode]);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
