// POST /api/auth/signup
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body.', 400);
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const role = body?.role === 'faculty' ? 'faculty' : 'student';
    const college = typeof body?.college === 'string' && body.college.trim() ? body.college.trim() : 'National Institute of Technology';

    if (!name || name.length < 2) {
      return apiError('Valid name is required.', 400);
    }
    if (!email || !email.includes('@')) {
      return apiError('Valid email is required.', 400);
    }
    if (!password || password.length < 6) {
      return apiError('Password must be at least 6 characters.', 400);
    }

    const admin = createAdminClient();
    const newUserId = crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`;

    const newUser = {
      id: newUserId,
      display_name: name,
      name,
      email,
      role,
      college,
      department: 'Computer Science',
      points: 20,
      streak: 1,
      created_at: new Date().toISOString(),
    };

    await admin.from('users').insert(newUser);

    return apiSuccess({
      connected: true,
      user: newUser,
      token: 'jwt-session-active',
    });
  } catch (err: any) {
    return apiError(err?.message || 'Signup failed.', 500);
  }
}
