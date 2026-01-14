import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Ban, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ModerationWatcher({ currentUser }) {
  const [notification, setNotification] = useState(null);
  const [lastCheckedId, setLastCheckedId] = useState(null);

  useEffect(() => {
    if (!currentUser?.email) return;

    const checkModeration = async () => {
      try {
        const moderations = await base44.entities.UserModeration.filter(
          { user_email: currentUser.email },
          '-created_date',
          1
        );

        if (moderations.length > 0) {
          const latestModeration = moderations[0];
          
          // Only show if it's a new moderation action we haven't seen
          if (latestModeration.id !== lastCheckedId) {
            setLastCheckedId(latestModeration.id);
            setNotification(latestModeration);

            // Auto-dismiss non-ban notifications after 10 seconds
            if (latestModeration.action_type !== 'ban') {
              setTimeout(() => {
                setNotification(null);
              }, 10000);
            } else {
              // If banned, reload to trigger the ban screen
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            }
          }
        }
      } catch (error) {
        console.error('Error checking moderation:', error);
      }
    };

    // Initial check
    checkModeration();

    // Check every 10 seconds
    const interval = setInterval(checkModeration, 10000);

    return () => clearInterval(interval);
  }, [currentUser, lastCheckedId]);

  const getNotificationConfig = (actionType) => {
    switch (actionType) {
      case 'verbal_warning':
        return {
          icon: AlertCircle,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          title: 'Verbal Warning Issued'
        };
      case 'formal_warning':
        return {
          icon: AlertTriangle,
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-900',
          title: 'Formal Warning Issued'
        };
      case 'ban':
        return {
          icon: Ban,
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          title: 'Account Banned'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          title: 'Moderation Action'
        };
    }
  };

  if (!notification) return null;

  const config = getNotificationConfig(notification.action_type);
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-20 right-6 z-[100] max-w-md"
      >
        <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl shadow-2xl p-5`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${config.textColor} mb-2`}>
                {config.title}
              </h3>
              
              <p className={`text-sm ${config.textColor} mb-3`}>
                {notification.reason}
              </p>
              
              {notification.notes && (
                <p className={`text-xs ${config.textColor} opacity-75 mb-3 italic`}>
                  Admin note: {notification.notes}
                </p>
              )}

              {notification.action_type === 'ban' ? (
                <p className={`text-sm font-semibold ${config.textColor}`}>
                  Redirecting to logout...
                </p>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNotification(null)}
                  className={`${config.borderColor} ${config.textColor} hover:bg-white/50`}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}