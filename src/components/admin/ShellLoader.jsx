import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ShellLoader({ isLoading, message = "Loading discoveries..." }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 95);
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-32 h-32">
        {/* Shell outline */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background shell - spiral shape */}
          <path
            d="M50 15 Q65 20 72 35 Q75 50 70 65 Q60 80 45 85 Q25 88 18 70 Q15 55 22 40 Q30 28 45 25 Q55 23 60 30 Q63 38 58 45 Q52 50 45 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-300"
          />

          {/* Inner spiral ridges */}
          <path
            d="M50 20 Q60 25 64 35 Q66 45 60 52"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-300"
            opacity="0.4"
          />
          <path
            d="M48 30 Q54 33 56 40 Q57 45 53 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-300"
            opacity="0.4"
          />

          {/* Filled shell based on progress */}
          <defs>
            <linearGradient id="shellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <clipPath id="fillClip">
              <rect
                x="0"
                y={90 - (progress * 0.75)}
                width="100"
                height={progress * 0.75}
              />
            </clipPath>
          </defs>

          <motion.path
            d="M50 15 Q65 20 72 35 Q75 50 70 65 Q60 80 45 85 Q25 88 18 70 Q15 55 22 40 Q30 28 45 25 Q55 23 60 30 Q63 38 58 45 Q52 50 45 48"
            fill="url(#shellGradient)"
            clipPath="url(#fillClip)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Shimmer effect */}
          <motion.rect
            x="10"
            y={90 - (progress * 0.75) - 5}
            width="80"
            height="10"
            fill="white"
            opacity="0.3"
            animate={{
              y: [90 - (progress * 0.75) - 5, 90 - (progress * 0.75) + 5, 90 - (progress * 0.75) - 5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            clipPath="url(#fillClip)"
          />

          {/* Glowing shell outline when loading */}
          <motion.path
            d="M50 15 Q65 20 72 35 Q75 50 70 65 Q60 80 45 85 Q25 88 18 70 Q15 55 22 40 Q30 28 45 25 Q55 23 60 30 Q63 38 58 45 Q52 50 45 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-amber-500"
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
          <span className="text-xl font-bold text-amber-600">
            {Math.round(progress)}%
          </span>
        </motion.div>
      </div>

      {/* Loading message */}
      <motion.p
        className="text-slate-600 mt-4 text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>

      {/* Animated dots */}
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-amber-500 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}