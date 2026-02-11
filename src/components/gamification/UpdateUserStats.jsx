import { base44 } from "@/api/base44Client";
import { checkBadgeEligibility, BADGES } from "./BadgeSystem";

export const updateUserStats = async (action, details = {}) => {
  try {
    const user = await base44.auth.me();
    const [allDiscoveries, allComments] = await Promise.all([
      base44.entities.Discovery.list(),
      base44.entities.DiscoveryComment.list()
    ]);
    
    const userDiscoveries = allDiscoveries.filter(d => d.created_by === user.email);
    
    // Calculate points based on action
    let pointsToAward = 0;
    
    switch (action) {
      case 'like_received':
        pointsToAward = 2;
        break;
      case 'comment':
        pointsToAward = 5;
        break;
      case 'follow_received':
        pointsToAward = 10;
        break;
      case 'discovery':
        pointsToAward = 20;
        if (details.significance_level === 'high') pointsToAward += 20;
        if (details.significance_level === 'exceptional') pointsToAward += 50;
        break;
      case 'featured':
        pointsToAward = 50;
        break;
      case 'staff_pick':
        pointsToAward = 100;
        break;
    }
    
    // Check for new badges
    const newBadges = checkBadgeEligibility(user, allDiscoveries, allComments);
    
    // Calculate badge points
    let badgePoints = 0;
    newBadges.forEach(badgeId => {
      badgePoints += BADGES[badgeId]?.points || 0;
    });
    
    // Count total likes received
    const totalLikes = userDiscoveries.reduce((sum, d) => sum + (d.likes || 0), 0);
    
    // Update user
    await base44.auth.updateMe({
      points: (user.points || 0) + pointsToAward + badgePoints,
      discovery_count: userDiscoveries.length,
      badges: [...new Set([...(user.badges || []), ...newBadges])], // Remove duplicates
      follower_count: (user.followers || []).length,
      following_count: (user.following || []).length
    });
    
    return {
      pointsAwarded: pointsToAward + badgePoints,
      newBadges,
      totalPoints: (user.points || 0) + pointsToAward + badgePoints
    };
  } catch (error) {
    console.error("Failed to update user stats:", error);
    return null;
  }
};