import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Star, Gift } from "lucide-react";
import { motion } from "framer-motion";

const DAILY_CHALLENGES = [
  {
    id: 'make_discovery',
    title: 'Make a Discovery',
    description: 'Upload and analyze a new fossil finding',
    points: 50,
    icon: Target,
    checkProgress: (user, discoveries) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return discoveries.filter(d => 
        d.created_by === user.email && 
        new Date(d.created_date) >= today
      ).length;
    },
    target: 1
  },
  {
    id: 'engage_community',
    title: 'Engage with Community',
    description: 'Like and comment on 3 discoveries',
    points: 30,
    icon: Star,
    checkProgress: (user, discoveries, comments) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const likesToday = discoveries.filter(d => 
        d.liked_by?.includes(user.email) &&
        new Date(d.updated_date) >= today
      ).length;
      
      const commentsToday = comments.filter(c =>
        c.created_by === user.email &&
        new Date(c.created_date) >= today
      ).length;
      
      return Math.min(likesToday + commentsToday, 3);
    },
    target: 3
  },
  {
    id: 'explore_feed',
    title: 'Browse FosFeed',
    description: 'View 5 discoveries on FosFeed',
    points: 20,
    icon: Gift,
    checkProgress: (user) => user.daily_feed_views || 0,
    target: 5
  }
];

export default function DailyChallenge({ isDarkMode }) {
  const [challenges, setChallenges] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [discoveries, setDiscoveries] = useState([]);
  const [comments, setComments] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);

  useEffect(() => {
    loadChallenges();
    const interval = setInterval(loadChallenges, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadChallenges = async () => {
    try {
      const [user, allDiscoveries, allComments] = await Promise.all([
        base44.auth.me(),
        base44.entities.Discovery.list(),
        base44.entities.DiscoveryComment.list()
      ]);

      setCurrentUser(user);
      setDiscoveries(allDiscoveries);
      setComments(allComments);

      const today = new Date().toDateString();
      const lastCompleted = user.last_challenge_date || '';
      const todayCompleted = lastCompleted === today ? (user.completed_challenges || []) : [];
      setCompletedToday(todayCompleted);

      const challengeProgress = DAILY_CHALLENGES.map(challenge => {
        const progress = challenge.checkProgress(user, allDiscoveries, allComments);
        const isComplete = progress >= challenge.target;
        return {
          ...challenge,
          progress,
          isComplete,
          alreadyCompleted: todayCompleted.includes(challenge.id)
        };
      });

      setChallenges(challengeProgress);
    } catch (error) {
      console.error("Failed to load challenges:", error);
    }
  };

  const claimReward = async (challenge) => {
    try {
      const today = new Date().toDateString();
      const newCompleted = [...completedToday, challenge.id];
      
      await base44.auth.updateMe({
        points: (currentUser.points || 0) + challenge.points,
        completed_challenges: newCompleted,
        last_challenge_date: today
      });

      // Track challenge completion
      base44.analytics.track({
        eventName: "daily_challenge_completed",
        properties: { 
          challenge_id: challenge.id,
          points_earned: challenge.points
        }
      });

      setCompletedToday(newCompleted);
      loadChallenges();
    } catch (error) {
      console.error("Failed to claim reward:", error);
    }
  };

  const totalPossible = DAILY_CHALLENGES.reduce((sum, c) => sum + c.points, 0);
  const totalEarned = challenges
    .filter(c => c.alreadyCompleted)
    .reduce((sum, c) => sum + c.points, 0);

  return (
    <Card className={`${isDarkMode ? 'bg-slate-900/60 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'} backdrop-blur-xl`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
            <Target className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            Daily Challenges
          </CardTitle>
          <Badge variant="outline" className={isDarkMode ? 'border-purple-500/50 text-purple-400' : 'border-purple-300 text-purple-700'}>
            {totalEarned}/{totalPossible} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/70'} border ${
              challenge.alreadyCompleted 
                ? isDarkMode ? 'border-green-500/50' : 'border-green-300'
                : isDarkMode ? 'border-slate-700' : 'border-purple-200'
            }`}>
              <div className="flex items-start gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  challenge.alreadyCompleted 
                    ? 'bg-green-500/20' 
                    : isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  {challenge.alreadyCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <challenge.icon className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                    {challenge.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                    {challenge.description}
                  </p>
                </div>
                <Badge className={challenge.alreadyCompleted ? 'bg-green-500' : 'bg-purple-500'}>
                  +{challenge.points}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>
                    Progress: {challenge.progress}/{challenge.target}
                  </span>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>
                    {Math.round((challenge.progress / challenge.target) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(challenge.progress / challenge.target) * 100} 
                  className={isDarkMode ? 'bg-slate-700' : 'bg-purple-200'}
                />
              </div>

              {challenge.isComplete && !challenge.alreadyCompleted && (
                <Button
                  onClick={() => claimReward(challenge)}
                  className="w-full mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                  size="sm"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Claim {challenge.points} Points
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}