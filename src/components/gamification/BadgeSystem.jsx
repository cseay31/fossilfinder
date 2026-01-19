import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Target, Flame, Crown, Medal, Zap } from "lucide-react";

export const BADGES = {
  first_discovery: {
    id: 'first_discovery',
    name: 'First Discovery',
    description: 'Made your first discovery',
    icon: Star,
    color: 'from-blue-500 to-cyan-500',
    points: 10
  },
  five_discoveries: {
    id: 'five_discoveries',
    name: 'Explorer',
    description: 'Made 5 discoveries',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    points: 50
  },
  ten_discoveries: {
    id: 'ten_discoveries',
    name: 'Archaeologist',
    description: 'Made 10 discoveries',
    icon: Award,
    color: 'from-orange-500 to-amber-500',
    points: 100
  },
  top_contributor: {
    id: 'top_contributor',
    name: 'Top Contributor',
    description: 'Reached top 10 on leaderboard',
    icon: Crown,
    color: 'from-yellow-500 to-yellow-600',
    points: 200
  },
  expert_paleontologist: {
    id: 'expert_paleontologist',
    name: 'Expert Paleontologist',
    description: 'Made 25 discoveries',
    icon: Trophy,
    color: 'from-purple-500 to-pink-500',
    points: 250
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Got 50 total likes',
    icon: Flame,
    color: 'from-red-500 to-rose-500',
    points: 100
  },
  helpful_commenter: {
    id: 'helpful_commenter',
    name: 'Helpful Commenter',
    description: 'Made 25 comments',
    icon: Medal,
    color: 'from-indigo-500 to-blue-500',
    points: 75
  },
  popular_discoverer: {
    id: 'popular_discoverer',
    name: 'Popular Discoverer',
    description: 'Got 100 followers',
    icon: Zap,
    color: 'from-teal-500 to-cyan-500',
    points: 150
  }
};

export const checkBadgeEligibility = (user, discoveries, comments) => {
  const newBadges = [];
  const userBadges = user.badges || [];
  
  // Discovery-based badges
  const userDiscoveryCount = discoveries.filter(d => d.created_by === user.email).length;
  
  if (userDiscoveryCount >= 1 && !userBadges.includes('first_discovery')) {
    newBadges.push('first_discovery');
  }
  if (userDiscoveryCount >= 5 && !userBadges.includes('five_discoveries')) {
    newBadges.push('five_discoveries');
  }
  if (userDiscoveryCount >= 10 && !userBadges.includes('ten_discoveries')) {
    newBadges.push('ten_discoveries');
  }
  if (userDiscoveryCount >= 25 && !userBadges.includes('expert_paleontologist')) {
    newBadges.push('expert_paleontologist');
  }
  
  // Social badges
  const totalLikes = discoveries
    .filter(d => d.created_by === user.email)
    .reduce((sum, d) => sum + (d.likes || 0), 0);
  
  if (totalLikes >= 50 && !userBadges.includes('social_butterfly')) {
    newBadges.push('social_butterfly');
  }
  
  // Comment badges
  const userComments = comments.filter(c => c.created_by === user.email);
  if (userComments.length >= 25 && !userBadges.includes('helpful_commenter')) {
    newBadges.push('helpful_commenter');
  }
  
  // Follower badges
  if ((user.follower_count || 0) >= 100 && !userBadges.includes('popular_discoverer')) {
    newBadges.push('popular_discoverer');
  }
  
  // Track badge earned event if new badges were awarded
  if (typeof window !== 'undefined' && newBadges.length > 0) {
    import("@/api/base44Client").then(({ base44 }) => {
      newBadges.forEach(badgeId => {
        base44.analytics.track({
          eventName: "badge_earned",
          properties: { 
            badge_id: badgeId,
            badge_name: BADGES[badgeId]?.name || badgeId
          }
        });
      });
    });
  }
  
  return newBadges;
};

export const calculatePoints = (action) => {
  const pointsMap = {
    discovery: 20,
    like_received: 2,
    comment: 5,
    follow_received: 10,
    featured: 50,
    staff_pick: 100
  };
  
  return pointsMap[action] || 0;
};

export default function BadgeDisplay({ badge, size = 'md' }) {
  const badgeData = BADGES[badge];
  if (!badgeData) return null;
  
  const Icon = badgeData.icon;
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${badgeData.color} flex items-center justify-center shadow-lg`}>
        <Icon className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm">{badgeData.name}</p>
        <p className="text-xs text-slate-500">{badgeData.description}</p>
      </div>
    </div>
  );
}