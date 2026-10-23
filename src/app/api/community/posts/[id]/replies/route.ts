// POST /api/community/posts/[id]/replies
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext } from '@/lib/auth';
import { awardPoints, REWARD_AMOUNTS } from '@/lib/points/engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body.', 400);
    }

    const text = typeof body?.body === 'string' ? body.body.trim() : '';
    if (!text) {
      return apiError('Reply text is required.', 400);
    }

    const auth = await getAuthContext(req);
    const authorName = auth?.profile?.display_name || 'Demo Student';
    const admin = createAdminClient();
    const replyId = crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}`;

    const newReply = {
      id: replyId,
      author: authorName,
      body: text,
      createdAt: new Date().toISOString(),
    };

    const { data: posts } = await admin.from('posts').select('*').eq('id', id);
    const post = posts && posts[0];

    if (post) {
      const updatedReplies = [...(post.replies || []), newReply];
      await admin.from('posts').update({ replies: updatedReplies }).eq('id', id);
    }

    if (auth?.user?.id) {
      await awardPoints(auth.user.id, `REPLY_COMMUNITY:${replyId}`, REWARD_AMOUNTS.SUBMIT_ANSWER);
    }

    return apiSuccess(newReply, 201);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to post reply.', 500);
  }
}
