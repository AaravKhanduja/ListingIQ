// Client-side Supabase instance
export { supabase } from './client';

// Server-side Supabase client creator
export { createClient } from './server';

// Middleware utilities
export { updateSession } from './middleware';

// Auth utilities
export {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
} from './auth';

// Types
export type { User, Session } from '@supabase/supabase-js';
