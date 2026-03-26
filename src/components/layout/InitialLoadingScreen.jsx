import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function InitialLoadingScreen({ isDarkMode }) {
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    "Loading AI model",
    "Loading discoveries",
    "Loading posts",
    "Loading locations",
    "Built by Connor Seay with help of the Ensworth FLL team"
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => {
        const next = prev + 1;
        // Stop cycling at the last message
        if (next >= messages.length - 1) {
          clearInterval(messageInterval);
          return messages.length - 1;
        }
        return next;
      });
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
      {/* Subtle Background for Dark Mode */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        {/* Shell loader */}
        <div
          className={`w-16 h-16 border-4 rounded-full animate-spin ${
            isDarkMode 
              ? 'border-slate-700 border-t-cyan-400' 
              : 'border-stone-200 border-t-amber-600'
          }`}
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