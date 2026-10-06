import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { post_id, content } = await req.json();

  if (!post_id || !content?.trim()) {
    return Response.json({ error: 'Post ID and content are required' }, { status: 400 });
  }

  // Fetch the parent post to check if it's locked.
  const posts = await base44.asServiceRole.entities.ForumPost.filter({ id: post_id }, { limit: 1 });
  const post = posts?.items?.[0] || posts?.[0];
  if (!post) {
    return Response.json({ error: 'Post not found' }, { status: 404 });
  }
  if (post.is_locked) {
    return Response.json({ error: 'This post is locked and cannot receive new replies.' }, { status: 422 });
  }

  // Server-side AI moderation gate.
  const moderationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a content moderator for an archaeology community forum. Review this reply for inappropriate content.

Reply content: ${content.trim()}

Check for:
- Spam or promotional content
- Offensive language, hate speech, or personal attacks
- Completely off-topic or nonsensical content
- Harassment or bullying

Be reasonable - allow genuine responses even if brief.

Return your assessment.`,
    response_json_schema: {
      type: "object",
      properties: {
        is_appropriate: { type: "boolean" },
        reason: { type: "string" }
      }
    }
  });

  if (!moderationResult.is_appropriate) {
    return Response.json({ error: `Reply rejected: ${moderationResult.reason}` }, { status: 422 });
  }

  const reply = await base44.entities.ForumReply.create({
    post_id: post_id,
    content: content.trim(),
    author_name: user.full_name || user.email?.split('@')[0] || 'Anonymous',
    likes: 0,
    liked_by: []
  });

  // Update reply count.
  await base44.asServiceRole.entities.ForumPost.update(post_id, {
    reply_count: (post.reply_count || 0) + 1
  });

  return Response.json({ success: true, reply });
});