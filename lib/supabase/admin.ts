// Privileged Server-Side Supabase Client (Service Role)
// IMPORTANT: This file must ONLY be imported in server-side API routes or background jobs.
import { createClient } from '@supabase/supabase-js';
import { getInMemoryDb } from './inMemoryStore';

export function createAdminClient(): any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Use live Supabase client when valid cloud credentials are provided
  if (
    supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    serviceRoleKey &&
    !serviceRoleKey.includes('your-supabase')
  ) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Transparently fallback to seeded in-memory store for local testing/demo resilience
  return getInMemoryDb();
}
