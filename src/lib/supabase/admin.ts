// Privileged Server-Side Supabase Client (Service Role)
// IMPORTANT: This file must ONLY be imported in server-side API routes or background jobs.
import { createClient } from '@supabase/supabase-js';
import { getInMemoryDb } from './inMemoryStore';

export function createAdminClient(): any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const isRealSupabase =
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project') &&
    serviceRoleKey.length > 20 &&
    !serviceRoleKey.includes('your-');

  if (isRealSupabase) {
    try {
      return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client, falling back to in-memory store:', e);
    }
  }

  return getInMemoryDb();
}
