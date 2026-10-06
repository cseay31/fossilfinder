import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Shared secret that only the workflow passes — prevents anonymous direct
// HTTP invocation from forging UserModeration records. The workflow definition
// is server-side (base44/workflows/) so this secret is not exposed to clients.
const TRIGGER_SECRET = 'ff_auto_mod_trigger_7c3e9a1f5b2d8e4a';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // This is called by an automation (entity trigger). Validate that the
  // payload corresponds to a real ForumPost before doing any LLM work or
  // writing a UserModeration record, so anonymous direct invocation cannot
  // forge moderation history against arbitrary users.
  const body = await req.json();
  const { data } = body;

  // Verify the invocation carries the workflow trigger secret.
  if (body.trigger_secret !== TRIGGER_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!data?.content || !data?.created_by) {
    return Response.json({ message: 'Missing content or author, skipping.' });
  }

  // Confirm a ForumPost exists matching this author + content.
  const posts = await base44.asServiceRole.entities.ForumPost.filter(
    { created_by: data.created_by, content: data.content },
    { sort: '-created_date', limit: 1 }
  );
  if (!posts?.items?.[0]) {
    return Response.json({ message: 'No matching forum post found, skipping.' });
  }

  // Use LLM to detect flagged language
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a content moderator. Analyze the following forum post for flagged language including: hate speech, harassment, explicit sexual content, threats, slurs, or severe profanity.

Forum Post Title: ${data.title || '(no title)'}
Forum Post Content: ${data.content}

Respond with a JSON object only.`,
    response_json_schema: {
      type: "object",
      properties: {
        flagged: { type: "boolean" },
        reason: { type: "string" },
        severity: { type: "string", enum: ["low", "medium", "high"] }
      }
    }
  });

  if (!result.flagged) {
    return Response.json({ message: 'Post is clean, no action taken.' });
  }

  // Create a UserModeration record
  await base44.asServiceRole.entities.UserModeration.create({
    user_email: data.created_by,
    action_type: 'verbal_warning',
    reason: `Flagged language detected in forum post: "${data.title || data.content.slice(0, 60)}..."`,
    moderator_email: 'system@fossilfinder.app',
    notes: `AI Moderation — Severity: ${result.severity}. Details: ${result.reason}`
  });

  return Response.json({
    message: `Moderation action created for ${data.created_by}`,
    severity: result.severity,
    reason: result.reason
  });
});