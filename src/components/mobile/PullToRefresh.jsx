import React, { useState, useRef, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PullToRefresh({ onRefresh, children, isDarkMode }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 80;

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startY.current === 0 || containerRef.current?.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
      setPulling(distance > PULL_THRESHOLD);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setRefreshing(false);
          setPulling(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPulling(false);
      setPullDistance(0);
    }
    startY.current = 0;
  };

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
      style={{ overscrollBehaviorY: 'none' }}
    >
      <AnimatePresence>
        {(pulling || refreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 py-4"
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isDarkMode ? 'bg-slate-800/90 text-white' : 'bg-white/90 text-stone-800'
            } shadow-lg backdrop-blur-sm`}>
              {refreshing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm font-medium">Release to refresh</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`, transition: refreshing ? 'transform 0.3s ease' : 'none' }}>
        {children}
      </div>
    </div>
  );
}