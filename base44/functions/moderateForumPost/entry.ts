import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // This is called by an automation (entity trigger), validate via service role
  // but still verify the request comes with a valid payload
  const body = await req.json();
  const { event, data } = body;

  if (!data?.content || !data?.created_by) {
    return Response.json({ message: 'Missing content or author, skipping.' });
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