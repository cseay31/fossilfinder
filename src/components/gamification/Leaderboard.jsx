import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard({ isDarkMode }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const [allUsers, user, allDiscoveries] = await Promise.all([
        base44.entities.User.list(),
        base44.auth.me(),
        base44.entities.Discovery.list()
      ]);
      
      // Recalculate stats for all users to ensure accuracy
      const usersWithStats = allUsers.map(u => {
        const userDiscoveries = allDiscoveries.filter(d => d.created_by === u.email);
        const totalLikes = userDiscoveries.reduce((sum, d) => sum + (d.likes || 0), 0);
        
        return {
          ...u,
          discovery_count: userDiscoveries.length,
          total_likes: totalLikes
        };
      });
      
      // Sort by points
      const sorted = usersWithStats
        .filter(u => !u.is_banned)
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 50);
      
      setUsers(sorted);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return isDarkMode ? 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' : 'from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return isDarkMode ? 'from-gray-400/20 to-slate-400/20 border-gray-400/30' : 'from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return isDarkMode ? 'from-amber-600/20 to-orange-600/20 border-amber-600/30' : 'from-amber-50 to-orange-50 border-amber-200';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'} backdrop-blur-xl`}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Loading Leaderboard...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'} backdrop-blur-xl`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          <TrendingUp className="w-5 h-5" />
          Top Explorers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.email === currentUser?.email;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  rank <= 3 ? `bg-gradient-to-r ${getRankColor(rank)}` : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                } ${isCurrentUser ? 'ring-2 ring-cyan-500' : ''}`}
              >
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(rank)}
                </div>
                
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profile_image} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-stone-600 text-white">
                    {user.display_name?.[0] || user.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {user.display_name || user.full_name || 'Explorer'}
                    {isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                      {user.discovery_count || 0} discoveries
                    </span>
                    {user.badges && user.badges.length > 0 && (
                      <span className={isDarkMode ? 'text-cyan-400' : 'text-amber-600'}>
                        • {user.badges.length} badges
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`}>
                    {user.points || 0}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>points</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}