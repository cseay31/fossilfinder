import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ isDarkMode }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    "Loading AI model",
    "Loading discoveries",
    "Loading posts",
    "Loading locations"
  ];

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

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 750);

    return () => clearInterval(messageInterval);
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
        <motion.div
          className={`w-16 h-16 border-4 rounded-full ${
            isDarkMode 
              ? 'border-slate-700 border-t-cyan-400' 
              : 'border-stone-200 border-t-amber-600'
          }`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`text-center font-medium mt-4 ${
            isDarkMode ? 'text-slate-400' : 'text-stone-600'
          }`}
        >
          {messages[messageIndex]}...
        </motion.p>
      </div>
    </motion.div>
  );
}