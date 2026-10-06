import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { escapeHtml } from '../../shared/escapeHtml.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, subject, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // Cap message length to prevent abuse.
  if (message.length > 5000) {
    return Response.json({ error: 'Message is too long' }, { status: 400 });
  }

  // Create the contact message record.
  const record = await base44.entities.ContactMessage.create({
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: 'new'
  });

  // Send confirmation email in the same server-side flow that creates the
  // record — no public re-send endpoint.
  const safeName = escapeHtml(record.name || '');
  const safeSubject = escapeHtml(record.subject || '(no subject)');
  const safeMessage = escapeHtml((record.message || '').slice(0, 2000).replace(/\n/g, '<br>'));

  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: record.email,
      subject: `We received your message — FossilFinder`,
      body: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#92400e,#44403c);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">FossilFinder</h1>
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
  </div>
</body>
</html>`,
    });

    // Mark as sent to prevent re-sending.
    await base44.asServiceRole.entities.ContactMessage.update(record.id, {
      confirmation_email_sent: true
    });
  } catch (err) {
    console.error('Failed to send confirmation email:', err);
    // Don't fail the request — the message was still saved.
  }

  return Response.json({ success: true });
});