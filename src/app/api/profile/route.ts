// GET & PUT /api/profile
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const role = req.headers.get('x-user-role') || auth?.profile?.role || 'student';

    const defaultProfile = {
      id: auth?.user?.id || (role === 'faculty' ? 'demo_faculty' : 'demo_student'),
      name: auth?.profile?.display_name || (role === 'faculty' ? 'Demo Faculty' : 'Demo Student'),
      role,
      college: auth?.profile?.college || 'Demo College of Engineering',
      department: 'Computer Science',
      year: role === 'student' ? '2nd year' : '',
      bio: '',
      anonymousByDefault: false,
      notifyEmail: true,
      notifyPulse: true,
    };

    return apiSuccess(defaultProfile);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch profile.', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body.', 400);
    }

    if (!body?.name || !body.name.trim()) {
      return apiError('Name is required.', 400);
    }

    const admin = createAdminClient();
    const userId = auth?.user?.id || '00000000-0000-0000-0000-000000000001';

    await admin.from('users').update({
      display_name: body.name.trim(),
      college: body.college || 'Demo College of Engineering',
    }).eq('id', userId);

    const updatedProfile = {
      id: userId,
      name: body.name.trim(),
      role: body.role || auth?.profile?.role || 'student',
      college: body.college || 'Demo College of Engineering',
      department: body.department || 'Computer Science',
      year: body.year || '2nd year',
      bio: body.bio || '',
      anonymousByDefault: Boolean(body.anonymousByDefault),
      notifyEmail: body.notifyEmail !== false,
      notifyPulse: body.notifyPulse !== false,
    };

    return apiSuccess(updatedProfile);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to update profile.', 500);
  }
}
