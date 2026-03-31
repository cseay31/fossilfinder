import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { data } = await req.json();

  if (!data?.discovery_id || !data?.content) {
    return Response.json({ message: 'Missing discovery_id or content, skipping.' });
  }

  // Fetch the parent discovery
  const discoveries = await base44.asServiceRole.entities.Discovery.filter({ id: data.discovery_id });
  if (!discoveries || discoveries.length === 0) {
    return Response.json({ message: 'Discovery not found, skipping.' });
  }

  const discovery = discoveries[0];
  const ownerEmail = discovery.created_by;

  if (!ownerEmail) {
    return Response.json({ message: 'Discovery has no owner email, skipping.' });
  }

  // Don't notify if the comment author IS the discovery owner
  if (data.created_by === ownerEmail) {
    return Response.json({ message: 'Owner commented on their own discovery, skipping.' });
  }

  const commenterName = data.author_name || data.created_by || 'Someone';
  const discoveryName = discovery.common_name || discovery.classification || 'your discovery';

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: ownerEmail,
    subject: `New comment on ${discoveryName} — FossilFinder`,
    body: `Hi there,

${commenterName} just commented on your discovery "${discoveryName}":

"${data.content}"

Log in to FossilFinder to view and reply to the comment.

Help the world, free forever.
— The FossilFinder Team`
  });

  return Response.json({ message: `Notification sent to ${ownerEmail}` });
});