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
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
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

export async function refreshUser() {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured') };
  }

  try {
    const { data, error } = await supabase!.auth.refreshSession();
    if (error) {
      return { error };
    }
    
    if (data.session) {
      return { error: null };
    } else {
      return { error: new Error('No session after refresh') };
    }
  } catch {
    return { error: new Error('Token refresh failed') };
  }
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

export async function deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    // Get the current session to get the access token
    const { data: { session }, error: sessionError } = await supabase!.auth.getSession();
    
    if (sessionError || !session) {
      return { success: false, error: 'No active session found' };
    }

    // Call the backend API to delete the account
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/user/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return { success: false, error: errorData.detail || `HTTP ${response.status}` };
    }

    const result = await response.json();
    
    if (result.success) {
      // Sign out the user after successful deletion
      const { error: signOutError } = await supabase!.auth.signOut();
      if (signOutError) {
        console.error('Error signing out user:', signOutError);
      }
    }

    return result;
  } catch (error) {
    console.error('Error deleting account:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
