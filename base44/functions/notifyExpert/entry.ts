import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { discovery_id, expert_email, expert_notes } = await req.json();

  if (!discovery_id || !expert_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(expert_email)) {
    return Response.json({ error: 'Valid discovery_id and expert_email are required' }, { status: 400 });
  }

  // Fetch the discovery server-side so the email body is built from
  // server-verified data, not caller-supplied content.
  const discoveries = await base44.asServiceRole.entities.Discovery.filter({ id: discovery_id }, { limit: 1 });
  const discovery = discoveries?.items?.[0] || discoveries?.[0];
  if (!discovery) {
    return Response.json({ error: 'Discovery not found' }, { status: 404 });
  }

  const escapeHtml = (str) => {
    if (typeof str !== 'string') return String(str || '');
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  };

  const body = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#1e40af;padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:20px;">FossilFinder — Expert Review Required</h1>
    </div>
    <div style="padding:32px;color:#1c1917;">
      <p>Dear Archaeological Expert,</p>
      <p>A discovery has been flagged for expert review through our FossilFinder platform.</p>
      <h3 style="color:#1e40af;">Discovery Details:</h3>
      <ul>
        <li><strong>Classification:</strong> ${escapeHtml(discovery.classification)}</li>
        <li><strong>AI Confidence:</strong> ${escapeHtml(String(discovery.confidence_score))}%</li>
        <li><strong>Time Period:</strong> ${escapeHtml(discovery.time_period)}</li>
        <li><strong>Location:</strong> ${escapeHtml(discovery.location)}</li>
        <li><strong>Significance:</strong> ${escapeHtml(discovery.significance_level)}</li>
      </ul>
      <h3 style="color:#1e40af;">AI Analysis:</h3>
      <p>${escapeHtml(discovery.description)?.replace(/\n/g, '<br>')}</p>
      ${expert_notes ? `<h3 style="color:#1e40af;">Admin Notes:</h3><p>${escapeHtml(expert_notes)?.replace(/\n/g, '<br>')}</p>` : ''}
      <p>Discovery image: <a href="${escapeHtml(discovery.photo_url)}">View Full Resolution</a></p>
      <p>Please review this discovery and provide your expert verification.</p>
      <p>Best regards,<br>FossilFinder Admin Team</p>
    </div>
  </div>
</body>
</html>`;

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: expert_email,
    subject: `Expert Review Required: ${discovery.classification || 'Unknown Discovery'}`,
    body,
    from_name: 'FossilFinder Admin'
  });

  // Update status to sent_to_expert
  await base44.asServiceRole.entities.Discovery.update(discovery_id, {
    analysis_status: 'sent_to_expert'
  });

  return Response.json({ success: true });
});