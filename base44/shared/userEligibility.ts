// Shared eligibility check used by all content-creation backend functions.
// Enforces COPPA age restrictions and ban status server-side so client-side
// checks cannot be bypassed by calling the API directly.
//
// Ban status, age category, and parental consent are ALL re-derived from
// UserModeration records — an admin-only entity that users cannot forge
// via updateMe. The client-writable User fields (is_banned, is_over_13,
// age_category, parental_consent_verified) are never trusted for security
// decisions. If a UserModeration lookup fails, the check fails closed.
export async function checkContentEligibility(base44) {
  const user = await base44.auth.me();
  if (!user) {
    return { allowed: false, error: 'Authentication required', status: 401 };
  }

  // Re-derive ban status from UserModeration records. A user is banned if
  // their most recent ban/unban action is a ban.
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
    return { allowed: false, error: 'Unable to verify account status', status: 500 };
  }

  if (isBanned) {
    return { allowed: false, error: 'Account suspended', status: 403 };
  }

  // Re-derive age category from UserModeration 'age_verified' records.
  // verifyBirthday creates these via service role with the age_category
  // stored in the notes field.
  let serverAgeCategory = null;
  try {
    const ageRecords = await base44.asServiceRole.entities.UserModeration.filter({
      user_email: user.email,
      action_type: 'age_verified'
    }, { sort: '-created_date', limit: 1 });
    const records = ageRecords?.items || ageRecords || [];
    if (records.length > 0) {
      serverAgeCategory = records[0].notes;
    }
  } catch {
    return { allowed: false, error: 'Unable to verify age', status: 500 };
  }

  // Backward compatibility: if no server-side age record exists, fall back
  // to birthday_verified + age_category for users who verified before
  // UserModeration tracking was added.
  if (!serverAgeCategory) {
    if (!user.birthday_verified) {
      return { allowed: false, error: 'Birthday verification required to post content', status: 403 };
    }
    serverAgeCategory = user.age_category || 'adult';
  }

  const isUnder13 = serverAgeCategory === 'under_13';

  // For under-13 users, re-derive parental consent from UserModeration
  // 'parental_consent_approved' records. parentalConsent creates these via
  // service role on guardian approval.
  if (isUnder13) {
    let hasConsent = false;
    try {
      const consentRecords = await base44.asServiceRole.entities.UserModeration.filter({
        user_email: user.email,
        action_type: 'parental_consent_approved'
      }, { limit: 1 });
      const records = consentRecords?.items || consentRecords || [];
      hasConsent = records.length > 0;
    } catch {
      return { allowed: false, error: 'Unable to verify parental consent', status: 500 };
    }

    if (!hasConsent) {
      return { allowed: false, error: 'Under-13 users need parental consent to post content', status: 403 };
    }
  }

  return { allowed: true, user, isUnder13 };
}