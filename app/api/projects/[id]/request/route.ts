// POST /api/projects/:id/request - Request to join a project
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in to join a project.', 401);
    }

    if (!projectId) {
      return apiError('Project ID is required.', 400);
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Message is optional or can have a default
    }

    const message = (body.message && typeof body.message === 'string')
      ? body.message.trim()
      : "I'd love to collaborate on this project!";

    const admin = createAdminClient();

    // 1. Fetch project to ensure existence and prevent owner self-request
    const { data: project, error: pError } = await admin
      .from('projects')
      .select('id, owner_id, title')
      .eq('id', projectId)
      .single();

    if (pError || !project) {
      return apiError('Project not found.', 404);
    }

    if (project.owner_id === auth.user.id) {
      return apiError('You are the owner of this project and cannot request to join your own project.', 400);
    }

    // 2. Check for duplicate request
    const { data: existing } = await admin
      .from('contributions')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (existing) {
      return apiError(`You have already submitted a join request for this project (current status: ${existing.status}).`, 400);
    }

    // 3. Insert contribution request
    const { data: contribution, error: insertError } = await admin
      .from('contributions')
      .insert({
        project_id: projectId,
        user_id: auth.user.id,
        message,
        status: 'pending',
      })
      .select('id, project_id, status, created_at')
      .single();

    if (insertError || !contribution) {
      console.error('Failed to submit contribution request:', insertError);
      return apiError('Failed to submit join request.', 500);
    }

    return apiSuccess({
      id: contribution.id,
      project_id: contribution.project_id,
      status: contribution.status,
      created_at: contribution.created_at,
      message: 'Join request sent to the project owner.',
    }, 201);
  } catch (err: any) {
    console.error('API /api/projects/[id]/request error:', err);
    return apiError(err?.message || 'Server error submitting join request.', 500);
  }
}
