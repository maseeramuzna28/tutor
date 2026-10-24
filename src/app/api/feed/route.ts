// GET /api/feed?subject=&college= - Public Anonymous Campus Feed
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { REPORT_THRESHOLD_HIDE } from '@/lib/moderation/profanity';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const college = searchParams.get('college');

    const admin = createAdminClient();

    let query = admin
      .from('questions')
      .select(`
        id,
        text,
        spoken_answer,
        steps,
        refresher,
        subject,
        concept,
        root_cause,
        visibility,
        resolution_status,
        college,
        created_at,
        published_at,
        answers:answers (
          id,
          text,
          is_ai,
          is_staff_verified,
          created_at,
          author:users (
            display_name,
            role,
            college
          )
        )
      `)
      .eq('visibility', 'anonymous')
      .eq('is_hidden', false)
      .lt('report_count', REPORT_THRESHOLD_HIDE)
      .order('created_at', { ascending: false });

    if (subject && subject.trim() !== '') {
      query = query.ilike('subject', `%${subject.trim()}%`);
    }

    if (college && college.trim() !== '') {
      query = query.ilike('college', `%${college.trim()}%`);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Failed to query public feed:', error);
      return apiError('Failed to load feed.', 500);
    }

    // STRICT PRIVACY PROTECTION:
    // Strip all author_id, private metadata, and filter out any hidden answers
    const sanitizedFeed = (questions || []).map((q: any) => {
      const sanitizedAnswers = (q.answers || [])
        .filter((ans: any) => !ans.is_hidden && (ans.report_count || 0) < REPORT_THRESHOLD_HIDE)
        .map((ans: any) => ({
          id: ans.id,
          text: ans.text,
          is_ai: ans.is_ai,
          is_staff_verified: ans.is_staff_verified,
          created_at: ans.created_at,
          author: ans.author
            ? {
                display_name: ans.author.display_name,
                role: ans.author.role,
                college: ans.author.college,
              }
            : null,
        }));

      return {
        id: q.id,
        text: q.text,
        spoken_answer: q.spoken_answer,
        steps: q.steps,
        refresher: q.refresher,
        subject: q.subject,
        concept: q.concept,
        root_cause: q.root_cause,
        resolution_status: q.resolution_status,
        college: q.college, // Campus origin is preserved for cross-college learning, but author identity is stripped
        created_at: q.created_at,
        published_at: q.published_at,
        answers_count: sanitizedAnswers.length,
        answers: sanitizedAnswers,
      };
    });

    return apiSuccess({ feed: sanitizedFeed }, 200);
  } catch (err: any) {
    console.error('API /api/feed error:', err);
    return apiError(err?.message || 'Server error loading feed.', 500);
  }
}
