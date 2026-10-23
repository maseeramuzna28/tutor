// Unified Authentication and Role Verification Helper for TUTO
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';
import { UserProfile, UserRole } from './types/database';

export interface AuthContext {
  user: {
    id: string;
    email?: string;
  };
  profile: UserProfile;
}

export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  // 1. Try Supabase Auth from cookies or Authorization header
  try {
    const supabase = await createServerSupabaseClient(req);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user && !error) {
      const admin = createAdminClient();
      let { data: profile } = await admin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Auto-provision profile if auth user exists but public profile not yet populated
        const defaultName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Tuto Student';
        const defaultRole: UserRole = 'student';
        const defaultCollege = user.user_metadata?.college || 'National Institute of Technology';

        const { data: newProfile } = await admin
          .from('users')
          .insert({
            id: user.id,
            display_name: defaultName,
            role: defaultRole,
            college: defaultCollege,
            points: 0,
          })
          .select()
          .single();

        profile = newProfile;
      }

      if (profile) {
        return {
          user: { id: user.id, email: user.email },
          profile,
        };
      }
    }
  } catch (err) {
    // Supabase auth lookup failed; continue to dev header check
  }

  // 2. Allow the demo identity header only outside production.
  const devUserId = process.env.NODE_ENV === 'production'
    ? null
    : req.headers.get('x-user-id');
  if (devUserId) {
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from('users')
        .select('*')
        .eq('id', devUserId)
        .single();

      if (profile) {
        return {
          user: { id: profile.id, email: `${profile.display_name.toLowerCase().replace(/\s+/g, '')}@demo.tuto` },
          profile,
        };
      }
    } catch {
      // Ignore
    }
  }

  return null;
}
