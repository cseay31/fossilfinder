import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { title, category, tags, content } = await req.json();

  if (!title?.trim() || !content?.trim()) {
    return Response.json({ error: 'Title and content are required' }, { status: 400 });
  }

  // Server-side AI moderation gate — cannot be bypassed by direct API calls.
  const moderationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a content moderator for an archaeology community forum. Review this post for inappropriate content.

Title: ${title.trim()}
Content: ${content.trim()}

Check for:
- Spam or promotional content
- Offensive language, hate speech, or personal attacks
- Misinformation or harmful content
- Content completely unrelated to archaeology/paleontology/fossils
- Vandalism, gibberish, or low-effort posts
- Harassment or bullying

Be reasonable - allow genuine questions, discussions, and sharing even if imperfect.

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
    return Response.json({ error: `Post rejected: ${moderationResult.reason}` }, { status: 422 });
  }

  const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];

  const post = await base44.entities.ForumPost.create({
    title: title.trim(),
    category: category || 'general',
    tags: tagArray,
    content: content.trim(),
    author_name: user.full_name || user.email?.split('@')[0] || 'Anonymous',
    views: 0,
    likes: 0,
    liked_by: [],
    reply_count: 0,
    is_pinned: false,
    is_locked: false
  });

  return Response.json({ success: true, post });
});