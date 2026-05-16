import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { action } = body;

  // ===== SEND CONSENT EMAIL =====
  if (action === 'send') {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { parent_email } = body;
    if (!parent_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent_email)) {
      return Response.json({ error: 'Invalid parent email.' }, { status: 400 });
    }
    if (parent_email.toLowerCase() === (user.email || '').toLowerCase()) {
      return Response.json({ error: 'Parent email cannot be the same as the child account email.' }, { status: 400 });
    }

    // Generate token
    const consentToken = `consent_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Persist token + hashed parent email on the child's user record (service role so it works)
    const parentEmailHash = btoa(parent_email.toLowerCase());
    await base44.asServiceRole.entities.User.update(user.id, {
      parent_email_hash: parentEmailHash,
      parental_consent_token: consentToken,
      parental_consent_verified: false,
    });

    const origin = body.origin || '';
    const consentUrl = `${origin}/ParentalConsent?consent_token=${consentToken}&user_email=${encodeURIComponent(user.email)}`;
    const childName = user.display_name || user.full_name || 'your child';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: parent_email,
      from_name: 'FossilFinder Team',
      subject: 'Action Required: Parental Consent for FossilFinder',
      body: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#92400e,#44403c);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🦕 FossilFinder</h1>
      <p style="margin:8px 0 0;color:#fde68a;font-size:14px;">Parental Consent Required (COPPA)</p>
    </div>

    <div style="padding:36px 40px;color:#1c1917;">
      <p style="font-size:16px;margin:0 0 16px;">Dear Parent or Guardian,</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 20px;">A child has signed up for <strong>FossilFinder</strong> — an educational platform that uses AI to identify fossils and archaeological artifacts from photos — and listed your email as their parent/guardian contact.</p>

      <div style="background:#f5f0e8;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#78716c;width:140px;">Child's Account</td><td style="padding:6px 0;font-weight:bold;">${user.email}</td></tr>
          <tr><td style="padding:6px 0;color:#78716c;">Display Name</td><td style="padding:6px 0;font-weight:bold;">${childName}</td></tr>
        </table>
      </div>

      <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Under the <strong>Children's Online Privacy Protection Act (COPPA)</strong>, we need your explicit consent before allowing children under 13 to use our service.</p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${consentUrl}" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:16px;">Review &amp; Give Consent</a>
      </div>
      <p style="font-size:12px;color:#78716c;text-align:center;margin:0 0 24px;word-break:break-all;">Or copy this link: ${consentUrl}</p>

      <hr style="border:none;border-top:2px solid #d6cfc4;margin:24px 0;">

      <h2 style="font-size:15px;letter-spacing:1px;color:#92400e;text-transform:uppercase;margin:0 0 12px;">What We Collect</h2>
      <ul style="padding-left:20px;margin:0 0 16px;font-size:14px;line-height:1.9;">
        <li>Email address and display name</li>
        <li>Photos of fossils/artifacts uploaded by your child</li>
        <li>GPS location (only when uploading, if permitted)</li>
        <li>Discovery descriptions and notes</li>
      </ul>

      <h2 style="font-size:15px;letter-spacing:1px;color:#92400e;text-transform:uppercase;margin:0 0 12px;">Safety Features for Under-13 Users</h2>
      <ul style="padding-left:20px;margin:0 0 16px;font-size:14px;line-height:1.9;">
        <li>Forum, FosFeed, and public comments are <strong>disabled</strong></li>
        <li>All discoveries are <strong>private by default</strong></li>
        <li>Expert matching and direct messaging are <strong>disabled</strong></li>
        <li>No advertising; we do not sell or rent information</li>
      </ul>

      <h2 style="font-size:15px;letter-spacing:1px;color:#92400e;text-transform:uppercase;margin:0 0 12px;">Your Rights</h2>
      <p style="font-size:14px;line-height:1.7;margin:0 0 8px;">You may review, request deletion of, or revoke consent for your child's data at any time via the Contact Admin feature in the app.</p>

      <p style="font-size:14px;color:#78716c;margin:24px 0 0;">If you did not authorize this signup, simply ignore this email and the account will remain restricted.</p>

      <hr style="border:none;border-top:2px solid #d6cfc4;margin:28px 0;">
      <p style="font-size:14px;color:#78716c;font-style:italic;margin:0 0 4px;">Help the world, free forever.</p>
      <p style="font-size:15px;margin:0;">— The FossilFinder Team</p>
    </div>

    <div style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e7ddd0;">
      <p style="font-size:12px;color:#a8a29e;margin:0;">Automated message. Please use the Contact Admin feature in the app for support.</p>
    </div>
  </div>
</body>
</html>`,
    });

    return Response.json({ success: true, message: 'Consent email sent.' });
  }

  // ===== VERIFY TOKEN (lookup child account info for the consent page) =====
  if (action === 'verify') {
    const { consent_token, user_email } = body;
    if (!consent_token || !user_email) {
      return Response.json({ status: 'invalid' });
    }

    const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
    if (!users || users.length === 0) {
      return Response.json({ status: 'invalid' });
    }
    const child = users[0];

    if (child.parental_consent_token !== consent_token) {
      return Response.json({ status: 'invalid' });
    }

    if (child.parental_consent_verified) {
      return Response.json({
        status: 'already_verified',
        child: { email: child.email, display_name: child.display_name, created_date: child.created_date },
      });
    }

    return Response.json({
      status: 'pending_action',
      child: { email: child.email, display_name: child.display_name, created_date: child.created_date },
    });
  }

  // ===== APPROVE OR DENY CONSENT =====
  if (action === 'approve' || action === 'deny') {
    const { consent_token, user_email } = body;
    if (!consent_token || !user_email) {
      return Response.json({ error: 'Missing token or email.' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }
    const child = users[0];

    if (child.parental_consent_token !== consent_token) {
      return Response.json({ error: 'Invalid token.' }, { status: 403 });
    }

    if (action === 'approve') {
      await base44.asServiceRole.entities.User.update(child.id, {
        parental_consent_verified: true,
        parental_consent_date: new Date().toISOString(),
      });
      return Response.json({ success: true, status: 'consent_given' });
    } else {
      await base44.asServiceRole.entities.User.update(child.id, {
        parental_consent_verified: false,
        parental_consent_date: new Date().toISOString(),
        is_banned: true,
        ban_reason: 'Parental consent denied',
      });
      return Response.json({ success: true, status: 'consent_denied' });
    }
  }

  return Response.json({ error: 'Unknown action.' }, { status: 400 });
});