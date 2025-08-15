import { supabase } from './client';
import type { User } from '@supabase/supabase-js';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return supabase !== null;
};

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { user: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase!.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, error };
}

export async function signUpWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { user: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
  });
  return { user: data.user, error };
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase!.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured') };
  }

  const { error } = await supabase!.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase!.auth.getUser();
  return user;
}

export async function getSession() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { session } } = await supabase!.auth.getSession();
  return session;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!isSupabaseConfigured()) {
    // Return a dummy unsubscribe function
    return { data: { subscription: null } };
  }

  return supabase!.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
