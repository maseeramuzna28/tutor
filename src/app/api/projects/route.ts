// /api/projects - Cross-College Project Hub (GET & POST)
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { awardPoints, REWARD_AMOUNTS } from '@/lib/points/engine';

export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const { data: projects, error } = await admin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Projects query error, returning fallback:', error);
    }

    const defaultProjects = [
      {
        id: 'pr1',
        title: 'Campus bus tracker',
        summary: 'A web app that shows live positions of campus buses on a map.',
        description: 'A web app that shows live positions of campus buses on a map.',
        skills: ['React', 'Maps', 'Node'],
        tags: ['React', 'Maps', 'Node'],
        teamSize: 4,
        members: 2,
        interested: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'pr2',
        title: 'Lab equipment booking',
        summary: 'Let students book lab slots and let staff see usage.',
        description: 'Let students book lab slots and let staff see usage.',
        skills: ['SQL', 'Python', 'Forms'],
        tags: ['SQL', 'Python', 'Forms'],
        teamSize: 3,
        members: 1,
        interested: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'pr3',
        title: 'Study group matcher',
        summary: 'Match students who are weak and strong in complementary topics.',
        description: 'Match students who are weak and strong in complementary topics.',
        skills: ['Python', 'Data', 'React'],
        tags: ['Python', 'Data', 'React'],
        teamSize: 5,
        members: 3,
        interested: false,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    const list = projects && projects.length > 0 ? projects : defaultProjects;

    const formatted = list.map((p: any) => ({
      id: p.id,
      title: p.title,
      summary: p.summary || p.description || '',
      description: p.description || p.summary || '',
      skills: Array.isArray(p.skills) ? p.skills : (Array.isArray(p.tags) ? p.tags : []),
      tags: Array.isArray(p.tags) ? p.tags : (Array.isArray(p.skills) ? p.skills : []),
      teamSize: Number(p.teamSize || p.team_size || 4),
      members: Number(p.members || 1),
      interested: Boolean(p.interested),
      link: p.link || null,
      created_at: p.created_at || new Date().toISOString(),
    }));

    return apiSuccess(formatted);
  } catch (err: any) {
    console.error('API GET /api/projects error:', err);
    return apiError(err?.message || 'Server error loading projects.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON body.', 400);
    }

    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const summary = typeof body?.summary === 'string' ? body.summary.trim() : (body?.description || '');
    const skills = Array.isArray(body?.skills) ? body.skills : (Array.isArray(body?.tags) ? body.tags : []);
    const teamSize = Number(body?.teamSize || body?.team_size || 3);

    if (!title) {
      return apiError('Project title is required.', 400);
    }

    const admin = createAdminClient();
    const projectId = crypto.randomUUID ? crypto.randomUUID() : `pr-${Date.now()}`;

    const newProject = {
      id: projectId,
      owner_id: auth?.user?.id || '00000000-0000-0000-0000-000000000001',
      title,
      summary,
      description: summary,
      skills,
      tags: skills,
      teamSize,
      members: 1,
      interested: false,
      link: body?.link || null,
      created_at: new Date().toISOString(),
    };

    await admin.from('projects').insert(newProject);

    if (auth?.user?.id) {
      await awardPoints(auth.user.id, `POST_PROJECT:${projectId}`, REWARD_AMOUNTS.POST_PROJECT);
    }

    return apiSuccess(newProject, 201);
  } catch (err: any) {
    console.error('API POST /api/projects error:', err);
    return apiError(err?.message || 'Server error posting project.', 500);
  }
}
