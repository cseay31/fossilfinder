import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // Find users created in the last 20 minutes
  const cutoff = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 50);

  const newExternalUsers = allUsers.filter(u =>
    u.created_date >= cutoff &&
    u.email &&
    !u.email.toLowerCase().endsWith('@ensworth.com')
  );

  if (newExternalUsers.length === 0) {
    return Response.json({ message: 'No new external users found.' });
  }

  const adminEmail = Deno.env.get("ADMIN_NOTIFY_EMAIL");
  if (!adminEmail) {
    return Response.json({ error: 'ADMIN_NOTIFY_EMAIL secret is not set.' }, { status: 500 });
  }

  for (const user of newExternalUsers) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: adminEmail,
      subject: `New external user signed up — FossilFinder`,
      body: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#1e3a5f,#1c1917);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🦕 FossilFinder</h1>
      <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">Admin Alert — New External Signup</p>
    </div>
    <div style="padding:36px 40px;color:#1c1917;">
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">A new user <strong>outside of the ensworth.com domain</strong> has just signed up on FossilFinder.</p>
      <div style="background:#f5f0e8;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#78716c;width:100px;">Name</td><td style="padding:6px 0;font-weight:bold;">${user.full_name || '(not set)'}</td></tr>
          <tr><td style="padding:6px 0;color:#78716c;">Email</td><td style="padding:6px 0;font-weight:bold;">${user.email}</td></tr>
          <tr><td style="padding:6px 0;color:#78716c;">Role</td><td style="padding:6px 0;font-weight:bold;">${user.role || 'user'}</td></tr>
          <tr><td style="padding:6px 0;color:#78716c;">Signed up</td><td style="padding:6px 0;font-weight:bold;">${new Date(user.created_date).toLocaleString('en-US', { timeZone: 'America/Chicago' })} (CST)</td></tr>
        </table>
      </div>
      <p style="font-size:15px;margin:0;">You can manage this user from the <strong>Admin Panel</strong>.</p>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:28px 0;">
      <p style="font-size:14px;color:#78716c;font-style:italic;margin:0;">— FossilFinder Automated Alert</p>
    </div>
  </div>
</body>
</html>`
    });
  }

  return Response.json({ message: `Notified about ${newExternalUsers.length} new external user(s).` });
});