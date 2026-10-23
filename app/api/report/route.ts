// POST /api/report - Content reporting and auto-moderation hiding at 3 reports
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { REPORT_THRESHOLD_HIDE } from '@/lib/moderation/profanity';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in to report content.', 401);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON body.', 400);
    }

    const { target_type, target_id, reason } = body;
    if (!target_type || !['question', 'answer'].includes(target_type)) {
      return apiError("target_type must be 'question' or 'answer'.", 400);
    }
    if (!target_id) {
      return apiError('target_id is required.', 400);
    }

    const admin = createAdminClient();

    // Check if user has already reported this target
    const { data: existingReport } = await admin
      .from('reports')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .maybeSingle();

    if (existingReport) {
      return apiError('You have already submitted a report for this item.', 400);
    }

    // Insert report record
    await admin.from('reports').insert({
      user_id: auth.user.id,
      target_type,
      target_id,
      reason: reason || 'Inappropriate or harmful academic content',
    });

    // Increment target report_count and check threshold
    const table = target_type === 'question' ? 'questions' : 'answers';
    const { data: target } = await admin
      .from(table)
      .select('report_count')
      .eq('id', target_id)
      .single();

    const newReportCount = (target?.report_count || 0) + 1;
    const shouldHide = newReportCount >= REPORT_THRESHOLD_HIDE;

    await admin
      .from(table)
      .update({
        report_count: newReportCount,
        is_hidden: shouldHide,
      })
      .eq('id', target_id);

    return apiSuccess({
      message: shouldHide
        ? 'Report received. Content has been automatically hidden due to reaching the community moderation threshold.'
        : 'Report received and logged for review.',
      report_count: newReportCount,
      hidden: shouldHide,
    }, 200);
  } catch (err: any) {
    console.error('API /api/report error:', err);
    return apiError(err?.message || 'Server error submitting report.', 500);
  }
}
