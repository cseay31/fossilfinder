import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { article_id, title, slug, content, category, tags } = await req.json();

  if (!title?.trim() || !slug?.trim() || !content?.trim()) {
    return Response.json({ error: 'Title, slug, and content are required' }, { status: 400 });
  }

  // Server-side AI moderation gate.
  const moderationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a content moderator for an archaeology education wiki. Review this article for inappropriate content.

Title: ${title.trim()}
Content: ${content.trim()}

Check for:
- Spam or promotional content
- Offensive language or hate speech
- Misinformation or harmful content
- Content unrelated to archaeology/paleontology/education
- Vandalism or gibberish

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
    return Response.json({ error: `Content rejected: ${moderationResult.reason}` }, { status: 422 });
  }

  const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];

  const articleData = {
    title: title.trim(),
    slug: slug.trim(),
    category: category || 'getting-started',
    tags: tagArray,
    content: content.trim(),
    last_edited_by: user.email || 'anonymous',
  };

  if (article_id) {
    // Update existing article.
    const existing = await base44.asServiceRole.entities.WikiArticle.filter({ id: article_id }, { limit: 1 });
    const article = existing?.items?.[0] || existing?.[0];
    if (article) {
      articleData.version = (article.version || 1) + 1;
      const updated = await base44.entities.WikiArticle.update(article_id, articleData);
      return Response.json({ success: true, article: updated });
    }
  }

  articleData.version = 1;
  const article = await base44.entities.WikiArticle.create(articleData);
  return Response.json({ success: true, article });
});