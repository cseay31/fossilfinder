import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { escapeHtml } from '../../shared/escapeHtml.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { data } = await req.json();

  if (!data?.discovery_id || !data?.content) {
    return Response.json({ message: 'Missing discovery_id or content, skipping.' });
  }

  // This function is invoked by an entity-trigger workflow on DiscoveryComment
  // create, so there is no user session. Instead of auth, verify the payload
  // corresponds to a real DiscoveryComment record and use the stored values
  // (not client-supplied) — this prevents anonymous direct invocation from
  // forging phishing emails with arbitrary content/author_name.
  let comment = null;
  if (data.id) {
    try {
      const found = await base44.asServiceRole.entities.DiscoveryComment.filter({ id: data.id });
      comment = found?.[0];
    } catch {
      return Response.json({ message: 'Invalid comment reference, skipping.' });
    }
  }
  if (!comment) {
    return Response.json({ message: 'Comment record not found, skipping.' });
  }

  // Fetch the parent discovery
  const discoveries = await base44.asServiceRole.entities.Discovery.filter({ id: comment.discovery_id || data.discovery_id });
  if (!discoveries || discoveries.length === 0) {
    return Response.json({ message: 'Discovery not found, skipping.' });
  }

  const discovery = discoveries[0];
  const ownerEmail = discovery.created_by;

  if (!ownerEmail) {
    return Response.json({ message: 'Discovery has no owner email, skipping.' });
  }

  // Don't notify if the comment author IS the discovery owner
  if (comment.created_by && comment.created_by === ownerEmail) {
    return Response.json({ message: 'Owner commented on their own discovery, skipping.' });
  }

  // Use stored, escaped values — never raw client input in the HTML body.
  const commenterName = escapeHtml(comment.author_name || comment.created_by || 'Someone');
  const discoveryName = escapeHtml(discovery.common_name || discovery.classification || 'your discovery');
  const commentContent = escapeHtml(comment.content || '');

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: ownerEmail,
    subject: `New comment on ${discovery.common_name || discovery.classification || 'your discovery'} — FossilFinder`,
    body: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#92400e,#44403c);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🦕 FossilFinder</h1>
      <p style="margin:8px 0 0;color:#fde68a;font-size:14px;">New Comment on Your Discovery</p>
    </div>
    <div style="padding:36px 40px;color:#1c1917;">
      <p style="font-size:16px;margin:0 0 16px;">Hi there,</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;"><strong>${commenterName}</strong> just commented on your discovery <strong>"${discoveryName}"</strong>:</p>
      <div style="background:#f5f0e8;border-left:4px solid #92400e;padding:16px 20px;border-radius:4px;font-size:15px;line-height:1.7;color:#1c1917;font-style:italic;">"${commentContent}"</div>
      <p style="font-size:15px;line-height:1.7;margin:24px 0 0;">Log in to FossilFinder to view and reply to the comment.</p>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:28px 0;">
      <p style="font-size:14px;color:#78716c;font-style:italic;margin:0 0 4px;">Help the world, free forever.</p>
      <p style="font-size:15px;margin:0;">— The FossilFinder Team</p>
    </div>
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e7ddd0;">
      <p style="font-size:12px;color:#a8a29e;margin:0;">If you'd like to unsubscribe and stop receiving these emails, <a href="#" style="color:#92400e;">click here</a>.</p>
    </div>
  </div>
</body>
</html>`
  });

  return Response.json({ message: `Notification sent to ${ownerEmail}` });
});