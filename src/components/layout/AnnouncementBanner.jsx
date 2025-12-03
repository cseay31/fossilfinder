import React, { useState, useEffect } from 'react';
import { Settings } from "@/entities/Settings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    try {
      const data = await Settings.filter({ setting_key: 'global' });
      if (data.length > 0 && data[0].announcement_active && data[0].announcement_text) {
        setAnnouncement(data[0]);
      }
    } catch (error) {
      console.error("Failed to load announcement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnnouncementStyle = (type) => {
    const styles = {
      info: {
        className: 'border-blue-200 bg-blue-50',
        textClassName: 'text-blue-800',
        icon: Info
      },
      warning: {
        className: 'border-yellow-200 bg-yellow-50',
        textClassName: 'text-yellow-800',
        icon: AlertTriangle
      },
      success: {
        className: 'border-green-200 bg-green-50',
        textClassName: 'text-green-800',
        icon: CheckCircle
      },
      error: {
        className: 'border-red-200 bg-red-50',
        textClassName: 'text-red-800',
        icon: AlertCircle
      }
    };
    return styles[type] || styles.info;
  };

  if (isLoading || !announcement || isDismissed) {
    return null;
  }

  const style = getAnnouncementStyle(announcement.announcement_type);
  const Icon = style.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="border-b border-stone-200"
      >
        <Alert className={`${style.className} rounded-none border-x-0 border-t-0 border-b-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${style.textClassName}`} />
              <AlertDescription className={`${style.textClassName} font-medium`}>
                {announcement.announcement_text}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDismissed(true)}
              className={`${style.textClassName} hover:bg-black/10 h-8 w-8`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}