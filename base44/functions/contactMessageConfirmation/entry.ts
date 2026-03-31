import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { data } = await req.json();

  if (!data?.email || !data?.name) {
    return Response.json({ message: 'Missing email or name, skipping.' });
  }

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: data.email,
    subject: `We received your message — FossilFinder`,
    body: `Hi ${data.name},

Thanks for reaching out! We've received your message and will get back to you as soon as possible.

Here's a copy of what you sent:

Subject: ${data.subject || '(no subject)'}

${data.message}

Help the world, free forever.
— The FossilFinder Team`,
  });

  return Response.json({ message: `Confirmation email sent to ${data.email}` });
});