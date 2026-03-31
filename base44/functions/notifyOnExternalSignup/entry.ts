import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

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

  for (const user of newExternalUsers) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'seayc31@ensworth.com',
      subject: `New external user signed up — FossilFinder`,
      body: `Hi,

A new user outside of the ensworth.com domain has just signed up on FossilFinder.

Name: ${user.full_name || '(not set)'}
Email: ${user.email}
Role: ${user.role || 'user'}
Signed up: ${new Date(user.created_date).toLocaleString('en-US', { timeZone: 'America/Chicago' })} (CST)

You can manage this user from the Admin Panel.

— FossilFinder Automated Alert`
    });
  }

  return Response.json({ message: `Notified about ${newExternalUsers.length} new external user(s).` });
});