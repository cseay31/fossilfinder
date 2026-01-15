import React from "react";
import LeaderboardComponent from "../components/gamification/Leaderboard";

export default function LeaderboardPage({ isDarkMode }) {
  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
            🏆 Leaderboard
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>
            See who's leading the archaeological discoveries!
          </p>
        </div>
        
        <LeaderboardComponent isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}