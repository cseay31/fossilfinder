import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { escapeHtml } from '../../shared/escapeHtml.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { message_id, response_text } = await req.json();

  if (!message_id || !response_text?.trim()) {
    return Response.json({ error: 'Message ID and response text are required' }, { status: 400 });
  }

  // Look up the contact message by ID using service role.
  const messages = await base44.asServiceRole.entities.ContactMessage.filter({ id: message_id }, { limit: 1 });
  const msg = messages?.items?.[0] || messages?.[0];
  if (!msg) {
    return Response.json({ error: 'Message not found' }, { status: 404 });
  }

  // Escape all attacker-controlled fields before interpolating into HTML.
  const safeName = escapeHtml(msg.name || '');
  const safeSubject = escapeHtml(msg.subject || '(no subject)');
  const safeOriginalMessage = escapeHtml((msg.message || '').replace(/\n/g, '<br>'));
  const safeResponse = escapeHtml(response_text.trim().replace(/\n/g, '<br>'));

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: msg.email,
    subject: `Re: ${msg.subject || 'Your message'}`,
    body: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#92400e,#44403c);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">FossilFinder</h1>
      <p style="margin:8px 0 0;color:#fde68a;font-size:14px;">Response from Admin</p>
    </div>
    <div style="padding:36px 40px;color:#1c1917;">
      <p style="font-size:16px;margin:0 0 16px;">Hello <strong>${safeName}</strong>,</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for contacting us. Here's our response to your message:</p>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:24px 0;">
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">${safeResponse}</p>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:24px 0;">
      <p style="font-size:13px;color:#78716c;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Your Original Message</p>
      <p style="font-size:14px;margin:0 0 8px;color:#57534e;"><strong>Subject:</strong> ${safeSubject}</p>
      <div style="background:#f5f0e8;border-left:4px solid #92400e;padding:16px 20px;border-radius:4px;font-size:15px;line-height:1.7;color:#1c1917;">${safeOriginalMessage}</div>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:28px 0;">
      <p style="font-size:14px;color:#78716c;font-style:italic;margin:0 0 4px;">Help the world, free forever.</p>
      <p style="font-size:15px;margin:0;">— The FossilFinder Team</p>
    </div>
  </div>
</body>
</html>`,
    from_name: 'FossilFinder Admin'
  });

  // Update message status.
  await base44.asServiceRole.entities.ContactMessage.update(message_id, {
    status: 'replied',
    admin_response: response_text.trim(),
    responded_by: user.email,
    responded_at: new Date().toISOString()
  });

  return Response.json({ success: true, message: 'Response sent successfully!' });
});