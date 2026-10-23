// Privileged Server-Side Supabase Client (Service Role)
// IMPORTANT: This file must ONLY be imported in server-side API routes or background jobs.
import { createClient } from '@supabase/supabase-js';
import { getInMemoryDb } from './inMemoryStore';

export function createAdminClient(): any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (supabaseUrl && serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  if (process.env.NODE_ENV === 'production' || supabaseUrl || serviceRoleKey) {
    throw new Error('Both NEXT_PUBLIC_SUPABASE_URL and server-only SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  return getInMemoryDb();
}
