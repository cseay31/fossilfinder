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
      body: `Hi ${userName},

Welcome to the Fossil Finder Network!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM A 12-YEAR-OLD'S VISION TO A GLOBAL REALITY

Every great innovation starts with a single question. For this platform, that question was asked by Connor Seay at just 12 years old.

What began as a FIRST LEGO League (FLL) project during the "Unearthed" season has transformed from a student inquiry into a professional-grade tool for the scientific community. Driven by a passion for discovery and the goal of making paleontology accessible to everyone, Connor Seay developed the core concept that earned regional accolades and laid the foundation for the app you see today.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUR MISSION

We believe that curiosity has no age limit and every discovery matters. Whether you are a student finding your first fossil or a seasoned collector, this app is designed to:

• Empower Discovery: Use our AI-driven tools to identify specimens in seconds.

• Bridge the Gap: Connect enthusiasts directly with a global network of verified experts.

• Contribute to Science: Every verified find adds to a growing database used to track and understand our planet's history.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JOIN THE CITIZEN SCIENCE MOVEMENT

By using Fossil Finder, you are joining a community of citizen scientists dedicated to uncovering the past. This journey started in a classroom with LEGO bricks and a big idea — today, it continues with you.

Happy Hunting!

— Connor Seay & The Fossil Finder Team`
    });

    await base44.asServiceRole.entities.User.update(user.id, { welcome_email_sent: true });
    sent++;
  }

  return Response.json({ success: true, message: `Welcome email sent to ${sent} user(s).` });
});