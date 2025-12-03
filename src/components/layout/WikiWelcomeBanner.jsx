import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function WikiWelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the wiki banner before
    const hasSeenWikiBanner = localStorage.getItem('hasSeenWikiBanner');
    if (!hasSeenWikiBanner) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenWikiBanner', 'true');
    setIsVisible(false);
  };

  const handleVisitWiki = () => {
    localStorage.setItem('hasSeenWikiBanner', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="border-b border-indigo-200"
      >
        <Alert className="bg-gradient-to-r from-indigo-50 to-purple-50 border-x-0 border-t-0 border-b-2 border-indigo-200 rounded-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </motion.div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <AlertDescription className="text-indigo-800 font-medium flex items-center gap-4">
                  <span>
                    🎉 <strong>New!</strong> Check out our community Wiki - Learn how to use FossilFinder and contribute your knowledge!
                  </span>
                  <Button
                    asChild
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleVisitWiki}
                  >
                    <Link to={createPageUrl("Wiki")}>
                      Visit Wiki
                    </Link>
                  </Button>
                </AlertDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-indigo-800 hover:bg-indigo-100 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}