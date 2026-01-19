import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StreakTracker({ isDarkMode }) {
  const [streak, setStreak] = useState(0);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      const currentStreak = user.login_streak || 0;
      setStreak(currentStreak);

      // Check if user logged in today
      const lastLogin = user.last_login_date ? new Date(user.last_login_date) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!lastLogin || lastLogin < today) {
        // User hasn't logged in today, increment streak
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = 1;
        if (lastLogin) {
          const lastLoginDay = new Date(lastLogin);
          lastLoginDay.setHours(0, 0, 0, 0);
          
          if (lastLoginDay.getTime() === yesterday.getTime()) {
            // Consecutive day login
            newStreak = currentStreak + 1;
            setShowStreakAnimation(true);
            setTimeout(() => setShowStreakAnimation(false), 3000);
          }
        }

        await base44.auth.updateMe({
          login_streak: newStreak,
          last_login_date: new Date().toISOString()
        });
        
        setStreak(newStreak);

        // Track streak milestone
        if (newStreak % 7 === 0) {
          base44.analytics.track({
            eventName: "streak_milestone",
            properties: { streak_days: newStreak }
          });
        }
      }
    } catch (error) {
      console.error("Failed to load streak:", error);
    }
  };

  if (streak === 0) return null;

  return (
    <>
      <Card className={`${isDarkMode ? 'bg-slate-900/60 border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'} backdrop-blur-xl`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20' : 'bg-gradient-to-br from-orange-400 to-red-500'}`}>
              <Flame className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-white'}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}>
                Daily Streak
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                {streak} {streak === 1 ? 'day' : 'days'}
              </p>
            </div>
            {streak >= 7 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <Award className="w-3 h-3 mr-1" />
                {streak >= 30 ? 'Legendary!' : streak >= 14 ? 'On Fire!' : 'Hot Streak!'}
              </Badge>
            )}
          </div>
          
          {streak < 7 && (
            <div className="mt-3">
              <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-orange-200'} overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                  style={{ width: `${(streak / 7) * 100}%` }}
                />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'} mt-1`}>
                {7 - streak} more {7 - streak === 1 ? 'day' : 'days'} until weekly milestone
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showStreakAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
              <Flame className="w-8 h-8 animate-pulse" />
              <div>
                <p className="font-bold text-lg">Streak Continues! 🔥</p>
                <p className="text-sm opacity-90">{streak} days in a row!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}