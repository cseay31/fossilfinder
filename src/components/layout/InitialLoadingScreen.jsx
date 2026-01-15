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
        
        {/* Logo */}
        <motion.img
          src="https://cvws.icloud-content.com/B/AVqzhfKpHxBLW63BSc5GtaCESLFNAbrr_AVUUPzJxpfxsp3K3kXzpt5A/dfgafsgfsdgsdfgsdfgsdfgsd+copy.png?o=As6iKJ79gMueGhroGtlOXaa9EJ3_9pUUXADaWPb70jMb&v=1&x=3&a=CAog9PPAsVQcCIJ2-VYR_rHpP4yDtv6TtOoxoN0R4zCgAuUSbxD45c6SvDMY-MKqlLwzIgEAUgSESLFNWgTzpt5Aaid6HwzYZgiBta28SmvEWz536aK5_kGSY9B5NkV_RuwBjkrGJLo9YLRyJx8gg9AO4kU3yVFZ0D-7QTuY4dNp1lZll8WHTjFW9uWEZRfE0kJWaw&e=1768495423&fl=&r=f54a6a79-e0d0-489b-97d0-16a90d1df3b5-1&k=THtfwBsnj6ckIPtk82cGuA&ckc=com.apple.clouddocs&ckz=com.apple.CloudDocs&p=30&s=gVilsHYby1_c-XfXTRvMjx0J-BA&cd=i"
          alt="FossilFinder Logo"
          className="w-28 h-28 object-contain mt-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
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