import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ isDarkMode }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 20;
        return Math.min(prev + increment, 95);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode 
          ? 'bg-slate-950' 
          : 'bg-gradient-to-br from-amber-50 to-stone-100'
      }`}
    >
      {/* Northern Lights Background for Dark Mode */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        {/* Shell loader with fill animation */}
        <div className="relative w-32 h-32 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background shell */}
            <path
              d="M50 10 L80 90 L20 90 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isDarkMode ? 'text-slate-600' : 'text-stone-300'}
            />
            
            {/* Spiral lines */}
            <path
              d="M50 20 Q60 40 50 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={isDarkMode ? 'text-slate-600' : 'text-stone-300'}
              opacity="0.4"
            />

            {/* Filled shell based on progress */}
            <defs>
              <linearGradient id="loadingShellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isDarkMode ? '#22d3ee' : '#f59e0b'} />
                <stop offset="100%" stopColor={isDarkMode ? '#10b981' : '#d97706'} />
              </linearGradient>
              <clipPath id="loadingFillClip">
                <rect
                  x="0"
                  y={90 - (progress * 0.8)}
                  width="100"
                  height={progress * 0.8}
                />
              </clipPath>
            </defs>
            
            <motion.path
              d="M50 10 L80 90 L20 90 Z"
              fill="url(#loadingShellGradient)"
              clipPath="url(#loadingFillClip)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />

            {/* Shimmer effect */}
            <motion.rect
              x="15"
              y={90 - (progress * 0.8) - 5}
              width="70"
              height="10"
              fill="white"
              opacity="0.3"
              animate={{
                y: [90 - (progress * 0.8) - 5, 90 - (progress * 0.8) + 5, 90 - (progress * 0.8) - 5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              clipPath="url(#loadingFillClip)"
            />

            {/* Glowing outline */}
            <motion.path
              d="M50 10 L80 90 L20 90 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={isDarkMode ? 'text-cyan-500' : 'text-amber-500'}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>

          {/* Progress percentage */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className={`text-xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`}>
              {Math.round(progress)}%
            </span>
          </motion.div>
        </div>
        
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`text-center font-medium ${
            isDarkMode ? 'text-slate-400' : 'text-stone-600'
          }`}
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
}