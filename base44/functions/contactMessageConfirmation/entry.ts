import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { escapeHtml } from '../../shared/escapeHtml.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { data } = await req.json();

  if (!data?.email || !data?.name) {
    return Response.json({ message: 'Missing email or name, skipping.' });
  }

  // This function is invoked by an entity-trigger workflow on ContactMessage
  // create, so there is no user session. Instead of auth, verify the payload
  // corresponds to a real ContactMessage record and use the stored values
  // (not client-supplied) with HTML escaping — this prevents direct invocation
  // from sending spoofed HTML emails to arbitrary recipients.
  let record = null;
  if (data.id) {
    try {
      const found = await base44.asServiceRole.entities.ContactMessage.filter({ id: data.id });
      record = found?.[0];
    } catch {
      return Response.json({ message: 'Invalid message reference, skipping.' });
    }
  }
  if (!record) {
    return Response.json({ message: 'Contact message record not found, skipping.' });
  }

  // Escape all interpolated fields to prevent HTML injection.
  const safeName = escapeHtml(record.name || data.name);
  const safeSubject = escapeHtml(record.subject || '(no subject)');
  const safeMessage = escapeHtml((record.message || '').replace(/\n/g, '<br>'));

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: record.email,
    subject: `We received your message — FossilFinder`,
    body: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#92400e,#44403c);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🦕 FossilFinder</h1>
      <p style="margin:8px 0 0;color:#fde68a;font-size:14px;">Message Received</p>
    </div>
    <div style="padding:36px 40px;color:#1c1917;">
      <p style="font-size:16px;margin:0 0 16px;">Hi <strong>${safeName}</strong>,</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Thanks for reaching out! We've received your message and will get back to you as soon as possible.</p>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:24px 0;">
      <p style="font-size:13px;color:#78716c;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Your Message</p>
      <p style="font-size:14px;margin:0 0 8px;color:#57534e;"><strong>Subject:</strong> ${safeSubject}</p>
      <div style="background:#f5f0e8;border-left:4px solid #92400e;padding:16px 20px;border-radius:4px;font-size:15px;line-height:1.7;color:#1c1917;">${safeMessage}</div>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:28px 0;">
      <p style="font-size:14px;color:#78716c;font-style:italic;margin:0 0 4px;">Help the world, free forever.</p>
      <p style="font-size:15px;margin:0;">— The FossilFinder Team</p>
    </div>
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e7ddd0;">
      <p style="font-size:12px;color:#a8a29e;margin:0;">If you'd like to unsubscribe and stop receiving these emails, <a href="#" style="color:#92400e;">click here</a>.</p>
    </div>
  </div>
</body>
</html>`,
  });

  return Response.json({ message: `Confirmation email sent to ${record.email || data.email}` });
});