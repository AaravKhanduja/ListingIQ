# Supabase Utilities

This directory contains all Supabase-related utilities for the ListingIQ application.

## Structure

```
lib/supabase/
├── client.ts      # Client-side Supabase instance
├── server.ts      # Server-side Supabase client creator
├── middleware.ts  # Middleware utilities for auth
├── auth.ts        # Auth utility functions
├── index.ts       # Main exports
└── README.md      # This file
```

## Usage

### Client-side (Browser)

```typescript
import { supabase } from '@/lib/supabase/client';

// Use the client instance directly
const { data, error } = await supabase.from('table').select('*');
```

### Server-side (Server Components/API Routes)

```typescript
import { createClient } from '@/lib/supabase/server';

// Create a server-side client
const supabase = createClient();
const { data, error } = await supabase.from('table').select('*');
```

### Auth Utilities

```typescript
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } from '@/lib/supabase/auth';

// Sign in with email/password
const { user, error } = await signInWithEmail(email, password);

// Sign up with email/password
const { user, error } = await signUpWithEmail(email, password);

// Sign in with Google OAuth
const { data, error } = await signInWithGoogle();

// Sign out
const { error } = await signOut();
```

### Middleware

The middleware automatically handles:

- Session management
- Authentication state
- Redirects for unauthenticated users
- Cookie management

## Environment Variables

Make sure to set these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## OSS Development

The app is designed to work **without Supabase** for open source contributors:

- ✅ **No Supabase required** - App works with development mode auth
- ✅ **Graceful fallback** - Middleware allows all requests when Supabase is not configured
- ✅ **Development mode** - Uses localStorage for auth simulation
- ✅ **Production ready** - Automatically uses Supabase when configured

## Features

- ✅ Client-side authentication
- ✅ Server-side authentication
- ✅ OAuth providers (Google)
- ✅ Middleware protection
- ✅ Session management
- ✅ TypeScript support
- ✅ Error handling
- ✅ OSS-friendly development
