import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // Find users who haven't received a welcome email yet
  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 100);
  const unwelcomed = allUsers.filter(u => !u.welcome_email_sent && u.email);

  if (unwelcomed.length === 0) {
    return Response.json({ message: 'No new users to welcome.' });
  }

  let sent = 0;
  for (const user of unwelcomed) {
    const userName = user.display_name || user.full_name || 'Explorer';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'Connor Seay & The Fossil Finder Team',
      subject: 'Welcome to the Fossil Finder Network! 🦕',
      body: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#92400e,#44403c);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:1px;">🦕 Fossil Finder Network</h1>
      <p style="margin:8px 0 0;color:#fde68a;font-size:14px;">Welcome to the Community</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;color:#1c1917;">
      <p style="font-size:16px;margin:0 0 24px;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size:16px;margin:0 0 24px;">Welcome to the <strong>Fossil Finder Network!</strong></p>

      <hr style="border:none;border-top:2px solid #d6cfc4;margin:28px 0;">

      <h2 style="font-size:15px;letter-spacing:1px;color:#92400e;text-transform:uppercase;margin:0 0 12px;">From a 12-Year-Old's Vision to a Global Reality</h2>
      <p style="font-size:15px;line-height:1.7;margin:0 0 12px;">Every great innovation starts with a single question. For this platform, that question was asked by <strong>Connor Seay</strong> at just 12 years old.</p>
      <p style="font-size:15px;line-height:1.7;margin:0;">What began as a <strong>FIRST LEGO League (FLL)</strong> project during the "Unearthed" season has transformed from a student inquiry into a professional-grade tool for the scientific community. Driven by a passion for discovery and the goal of making paleontology accessible to everyone, Connor Seay developed the core concept that earned regional accolades and laid the foundation for the app you see today.</p>

      <hr style="border:none;border-top:2px solid #d6cfc4;margin:28px 0;">

      <h2 style="font-size:15px;letter-spacing:1px;color:#92400e;text-transform:uppercase;margin:0 0 12px;">Our Mission</h2>
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">We believe that curiosity has no age limit and every discovery matters. Whether you are a student finding your first fossil or a seasoned collector, this app is designed to:</p>
      <ul style="padding-left:20px;margin:0;font-size:15px;line-height:2;">
        <li><strong>Empower Discovery:</strong> Use our AI-driven tools to identify specimens in seconds.</li>
        <li><strong>Bridge the Gap:</strong> Connect enthusiasts directly with a global network of verified experts.</li>
        <li><strong>Contribute to Science:</strong> Every verified find adds to a growing database used to track and understand our planet's history.</li>
      </ul>

      <hr style="border:none;border-top:2px solid #d6cfc4;margin:28px 0;">

      <h2 style="font-size:15px;letter-spacing:1px;color:#92400e;text-transform:uppercase;margin:0 0 12px;">Join the Citizen Science Movement</h2>
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">By using Fossil Finder, you are joining a community of citizen scientists dedicated to uncovering the past. This journey started in a classroom with LEGO bricks and a big idea — today, it continues with you.</p>

      <p style="font-size:16px;font-weight:bold;margin:0 0 4px;">Happy Hunting!</p>
      <p style="font-size:15px;color:#57534e;margin:0;">— Connor Seay &amp; The Fossil Finder Team</p>
    </div>

    <!-- Footer -->
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e7ddd0;">
      <p style="font-size:12px;color:#a8a29e;margin:0;">If you'd like to unsubscribe and stop receiving these emails, <a href="#" style="color:#92400e;">click here</a>.</p>
    </div>
  </div>
</body>
</html>`
    });

    await base44.asServiceRole.entities.User.update(user.id, { welcome_email_sent: true });
    sent++;
  }

  return Response.json({ success: true, message: `Welcome email sent to ${sent} user(s).` });
});