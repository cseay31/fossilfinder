import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

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

    const body = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#92400e,#44403c);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🦕 FossilFinder</h1>
      <p style="margin:8px 0 0;color:#fde68a;font-size:14px;">📰 Weekly Wiki Digest</p>
    </div>
    <div style="padding:36px 40px;color:#1c1917;">
      <p style="font-size:16px;margin:0 0 16px;">Hi <strong>${user.full_name || 'Explorer'}</strong>,</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Here's your weekly FossilFinder Wiki digest — <strong>${newArticles.length} new article${newArticles.length > 1 ? 's' : ''}</strong> added this week:</p>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:0 0 20px;">
      <ul style="padding-left:20px;margin:0 0 24px;font-size:15px;line-height:2;">${articleListHtml}</ul>
      <hr style="border:none;border-top:2px solid #d6cfc4;margin:0 0 20px;">
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Visit FossilFinder to read them in full.</p>
      <p style="font-size:14px;color:#78716c;font-style:italic;margin:0 0 4px;">Help the world, free forever.</p>
      <p style="font-size:15px;margin:0;">— The FossilFinder Team</p>
    </div>
    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e7ddd0;">
      <p style="font-size:12px;color:#a8a29e;margin:0;">If you'd like to unsubscribe and stop receiving these emails, <a href="#" style="color:#92400e;">click here</a>.</p>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `📰 FossilFinder Weekly Wiki Digest — ${newArticles.length} new article${newArticles.length > 1 ? 's' : ''}`,
      body,
    });

    sent++;
  }

  return Response.json({ message: `Sent weekly digest to ${sent} users covering ${newArticles.length} new articles.` });
});