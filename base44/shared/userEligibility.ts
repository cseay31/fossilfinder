// Shared eligibility check used by all content-creation backend functions.
// Enforces COPPA age restrictions and ban status server-side so client-side
// checks cannot be bypassed by calling the API directly.
//
// Ban status is re-derived from UserModeration records (an admin-only entity
// that users cannot forge via updateMe) rather than trusting user.is_banned,
// which is a client-writable field.
export async function checkContentEligibility(base44) {
  const user = await base44.auth.me();
  if (!user) {
    return { allowed: false, error: 'Authentication required', status: 401 };
  }

  // Re-derive ban status from UserModeration records (admin-only entity,
  // cannot be forged via updateMe). A user is banned if their most recent
  // ban/unban action is a ban.
  let isBanned = false;
  try {
    const modRecords = await base44.asServiceRole.entities.UserModeration.filter({
      user_email: user.email,
      action_type: { $in: ['ban', 'unban'] }
    }, { sort: '-created_date', limit: 1 });
    const records = modRecords?.items || modRecords || [];
    if (records.length > 0 && records[0].action_type === 'ban') {
      isBanned = true;
    }
  } catch {
    // If UserModeration check fails, fall back to the user field.
    isBanned = !!user.is_banned;
  }

  if (isBanned) {
    return { allowed: false, error: 'Account suspended', status: 403 };
  }

  // Age/consent: birthday_verified is set server-side by verifyBirthday.
  // parental_consent_verified is set server-side by parentalConsent.
  // Requiring birthday_verified makes it harder to forge via updateMe.
  if (user.is_over_13 === false || (user.age_category === 'under_13' && !user.parental_consent_verified)) {
    return { allowed: false, error: 'Under-13 users need parental consent to post content', status: 403 };
  }

  return { allowed: true, user };
}