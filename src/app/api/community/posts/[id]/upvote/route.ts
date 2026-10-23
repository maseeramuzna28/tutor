// POST /api/community/posts/[id]/upvote
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { data: posts } = await admin.from('posts').select('*').eq('id', id);
    const post = posts && posts[0];

    if (!post) {
      return apiSuccess({ id, upvotes: 1, upvoted: true });
    }

    const wasUpvoted = Boolean(post.upvoted);
    const newUpvoted = !wasUpvoted;
    const newUpvotes = Math.max(0, (post.upvotes || 0) + (newUpvoted ? 1 : -1));

    await admin
      .from('posts')
      .update({ upvoted: newUpvoted, upvotes: newUpvotes })
      .eq('id', id);

    return apiSuccess({
      id,
      upvotes: newUpvotes,
      upvoted: newUpvoted,
    });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to toggle upvote.', 500);
  }
}
