// GET & POST /api/community/posts
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext } from '@/lib/auth';
import { awardPoints, REWARD_AMOUNTS } from '@/lib/points/engine';

export async function GET(_req: NextRequest) {
  try {
    const admin = createAdminClient();
    const { data: posts, error } = await admin
      .from('posts')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.warn('Posts fetch error:', error);
    }

    return apiSuccess(posts || []);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch community posts.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body.', 400);
    }

    const postBody = typeof body?.body === 'string' ? body.body.trim() : '';
    const tag = typeof body?.tag === 'string' ? body.tag.trim() : 'Question';
    const anonymous = Boolean(body?.anonymous);

    if (!postBody) {
      return apiError('Post body is required.', 400);
    }

    const auth = await getAuthContext(req);
    const authorName = anonymous ? 'Anonymous' : (auth?.profile?.display_name || 'Demo Student');
    const admin = createAdminClient();
    const postId = crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`;

    const newPost = {
      id: postId,
      author: authorName,
      anonymous,
      tag,
      body: postBody,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvoted: false,
      replies: [],
    };

    await admin.from('posts').insert(newPost);

    if (auth?.user?.id) {
      await awardPoints(auth.user.id, `POST_COMMUNITY:${postId}`, REWARD_AMOUNTS.ASK_QUESTION);
    }

    return apiSuccess(newPost, 201);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to create community post.', 500);
  }
}
