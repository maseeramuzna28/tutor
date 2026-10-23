// GET /api/notifications
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || req.headers.get('x-user-role') || 'student';
    const admin = createAdminClient();

    const { data: notifications } = await admin.from('notifications').select('*');

    const defaultNotifs = [
      {
        id: 'n1',
        audience: 'student',
        type: 'Doubt',
        text: 'Your question about recursion has a worked answer.',
        createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
        read: false,
      },
      {
        id: 'n2',
        audience: 'student',
        type: 'Community',
        text: 'Someone replied to your community post.',
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
        read: false,
      },
      {
        id: 'n3',
        audience: 'student',
        type: 'Curriculum',
        text: 'Syllabus update for Data Structures, Section A.',
        createdAt: new Date(Date.now() - 2880 * 60000).toISOString(),
        read: true,
      },
      {
        id: 'n4',
        audience: 'faculty',
        type: 'Confusion',
        text: 'Semaphores is the most flagged topic in Operating Systems.',
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        read: false,
      },
      {
        id: 'n5',
        audience: 'faculty',
        type: 'Doubt',
        text: 'Three new questions were raised in Data Structures.',
        createdAt: new Date(Date.now() - 190 * 60000).toISOString(),
        read: false,
      },
    ];

    const list = notifications && notifications.length > 0 ? notifications : defaultNotifs;
    const filtered = list.filter((n: any) => !n.audience || n.audience === role);

    return apiSuccess(filtered);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch notifications.', 500);
  }
}
