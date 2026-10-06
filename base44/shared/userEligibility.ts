// Shared eligibility check used by all content-creation backend functions.
// Enforces COPPA age restrictions and ban status server-side so client-side
// checks cannot be bypassed by calling the API directly.
export async function checkContentEligibility(base44) {
  const user = await base44.auth.me();
  if (!user) {
    return { allowed: false, error: 'Authentication required', status: 401 };
  }
  if (user.is_banned) {
    return { allowed: false, error: 'Account suspended', status: 403 };
  }
  if (user.is_over_13 === false || (user.age_category === 'under_13' && !user.parental_consent_verified)) {
    return { allowed: false, error: 'Under-13 users need parental consent to post content', status: 403 };
  }
  return { allowed: true, user };
}