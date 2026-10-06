import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { discovery_id, content } = await req.json();

  if (!discovery_id || !content?.trim()) {
    return Response.json({ error: 'Discovery ID and content are required' }, { status: 400 });
  }

  // Server-side AI moderation gate.
  const moderationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a content moderator. Check if this comment contains any inappropriate content that should be blocked. ONLY block comments that contain:
- Hate speech, slurs, or discrimination
- Explicit sexual content
- Graphic violence
- Harassment or personal attacks
- Spam or advertisements

Do NOT block comments just because they are off-topic, casual, or unrelated to archaeology. Users are free to discuss whatever they want as long as it's not harmful.

Comment: "${content.trim()}"

Return is_appropriate=true unless the comment contains genuinely harmful/inappropriate content.`,
    response_json_schema: {
      type: "object",
      properties: {
        is_appropriate: { type: "boolean" },
        reason: { type: "string" }
      }
    }
  });

  if (!moderationResult.is_appropriate) {
    return Response.json({ error: `Comment not allowed: ${moderationResult.reason}` }, { status: 422 });
  }

  const comment = await base44.entities.DiscoveryComment.create({
    discovery_id: discovery_id,
    content: content.trim(),
    author_name: user.display_name || user.full_name || 'Anonymous',
    likes: 0,
    liked_by: []
  });

  // Update comment count on the discovery.
  const discoveries = await base44.asServiceRole.entities.Discovery.filter({ id: discovery_id }, { limit: 1 });
  const discovery = discoveries?.items?.[0] || discoveries?.[0];
  if (discovery) {
    await base44.asServiceRole.entities.Discovery.update(discovery_id, {
      comment_count: (discovery.comment_count || 0) + 1
    });
  }

  return Response.json({ success: true, comment });
});