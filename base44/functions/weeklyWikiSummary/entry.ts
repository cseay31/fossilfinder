import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Get all users
  const users = await base44.asServiceRole.entities.User.list();

  // Get wiki articles created in the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const allArticles = await base44.asServiceRole.entities.WikiArticle.list('-created_date', 100);
  const newArticles = allArticles.filter(a => new Date(a.created_date) >= oneWeekAgo);

  if (newArticles.length === 0) {
    return Response.json({ message: 'No new articles this week, no emails sent.' });
  }

  // Build article list HTML
  const articleListHtml = newArticles.map(a =>
    `<li style="margin-bottom:8px;"><strong>${a.title}</strong>${a.category ? ` <em>(${a.category})</em>` : ''}</li>`
  ).join('');

  const articleListText = newArticles.map(a =>
    `• ${a.title}${a.category ? ` (${a.category})` : ''}`
  ).join('\n');

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;

    const body = `
Hi ${user.full_name || 'Explorer'},

Here's your weekly FossilFinder Wiki digest — ${newArticles.length} new article${newArticles.length > 1 ? 's' : ''} added this week:

${articleListText}

Visit FossilFinder to read them in full.

Help the world, free forever.
— The FossilFinder Team
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `📰 FossilFinder Weekly Wiki Digest — ${newArticles.length} new article${newArticles.length > 1 ? 's' : ''}`,
      body,
    });

    sent++;
  }

  return Response.json({ message: `Sent weekly digest to ${sent} users covering ${newArticles.length} new articles.` });
});