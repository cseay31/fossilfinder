export function getCensoredName(user) {
  if (!user) return "Explorer";
  
  // If user is censored, return generic name
  if (user.is_name_censored) {
    return "Explorer";
  }
  
  // Otherwise return their actual name
  return user.display_name || user.full_name || "Explorer";
}