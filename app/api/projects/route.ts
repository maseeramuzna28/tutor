// /api/projects - Cross-College Project Hub (GET & POST)
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { awardPoints, REWARD_AMOUNTS } from '@/lib/points/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const college = searchParams.get('college');

    const admin = createAdminClient();

    let query = admin
      .from('projects')
      .select(`
        id,
        title,
        description,
        tags,
        roles_needed,
        link,
        created_at,
        owner:users (
          id,
          display_name,
          college
        ),
        contributions:contributions (
          id,
          status,
          user:users (
            id,
            display_name,
            college
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (tag && tag.trim() !== '') {
      query = query.contains('tags', [tag.trim()]);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Failed to fetch projects:', error);
      return apiError('Failed to fetch projects.', 500);
    }

    // Format projects and filter by college if requested
    let formatted = (projects || []).map((p: any) => {
      const accepted = (p.contributions || [])
        .filter((c: any) => c.status === 'accepted')
        .map((c: any) => ({
          user_id: c.user?.id,
          display_name: c.user?.display_name,
          college: c.user?.college,
        }));

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        tags: p.tags,
        roles_needed: p.roles_needed,
        link: p.link,
        created_at: p.created_at,
        owner: p.owner
          ? {
              display_name: p.owner.display_name,
              college: p.owner.college,
            }
          : null,
        contributors_count: accepted.length,
        accepted_contributors: accepted,
      };
    });

    if (college && college.trim() !== '') {
      const colFilter = college.trim().toLowerCase();
      formatted = formatted.filter(
        (p: any) => p.owner?.college?.toLowerCase().includes(colFilter)
      );
    }

    return apiSuccess({ projects: formatted }, 200);
  } catch (err: any) {
    console.error('API GET /api/projects error:', err);
    return apiError(err?.message || 'Server error loading projects.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in to post a project.', 401);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON body.', 400);
    }

    const { title, description, tags, roles_needed, link } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return apiError('Project title is required.', 400);
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return apiError('Project description is required.', 400);
    }

    const tagsArray = Array.isArray(tags) ? tags.map((t: string) => String(t).trim()) : [];
    const rolesArray = Array.isArray(roles_needed) ? roles_needed.map((r: string) => String(r).trim()) : [];

    const admin = createAdminClient();

    const { data: newProject, error: insertError } = await admin
      .from('projects')
      .insert({
        owner_id: auth.user.id,
        title: title.trim(),
        description: description.trim(),
        tags: tagsArray,
        roles_needed: rolesArray,
        link: link ? String(link).trim() : null,
      })
      .select('id, title, created_at')
      .single();

    if (insertError || !newProject) {
      console.error('Failed to create project:', insertError);
      return apiError('Failed to create project.', 500);
    }

    // Award +15 points for posting project
    const award = await awardPoints(
      auth.user.id,
      `POST_PROJECT:${newProject.id}`,
      REWARD_AMOUNTS.POST_PROJECT
    );

    return apiSuccess({
      id: newProject.id,
      title: newProject.title,
      created_at: newProject.created_at,
      points_awarded: award.awarded,
      total_points: award.totalPoints,
      message: 'Project posted successfully.',
    }, 201);
  } catch (err: any) {
    console.error('API POST /api/projects error:', err);
    return apiError(err?.message || 'Server error posting project.', 500);
  }
}
