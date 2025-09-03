'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        if (supabase) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('Auth: Session found, setting user:', session.user.email);
            setUser(session.user);
          } else {
            console.log('Auth: No session found');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { error: new Error('Supabase not configured') };
      }

      console.log('Auth: Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Auth: Sign in error:', error.message);
        return { error };
      }

      if (data.user) {
        console.log('Auth: Sign in successful, setting user:', data.user.email);
        setUser(data.user);
        return { error: null };
      }

      return { error: new Error('Sign in failed') };
    } catch (error: any) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { error: new Error('Supabase not configured') };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        return { error: null };
      }

      return { error: new Error('Sign up failed') };
    } catch (error: any) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (!supabase) {
        return { error: new Error('Supabase not configured') };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error instanceof Error ? error : new Error('Google sign in failed') };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

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
