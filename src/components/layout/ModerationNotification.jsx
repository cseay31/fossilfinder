import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, MessageSquare, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ModerationNotification() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkForNotification();
  }, []);

  const checkForNotification = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      // Check if user has an unread moderation notification
      if (user && user.moderation_notification_read === false && user.last_moderation_action) {
        setNotification({
          action: user.last_moderation_action,
          warningCount: user.warning_count || 0,
          lastWarningAt: user.last_warning_at,
        });
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Failed to check for moderation notifications:", error);
    }
  };

  const handleDismiss = async () => {
    try {
      // Mark notification as read
      await base44.entities.User.update(currentUser.id, {
        moderation_notification_read: true
      });
      setIsVisible(false);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (!notification || !isVisible) return null;

  const getActionType = (action) => {
    if (action.toLowerCase().includes('verbal warning')) return 'verbal';
    if (action.toLowerCase().includes('formal warning')) return 'formal';
    if (action.toLowerCase().includes('banned')) return 'ban';
    return 'warning';
  };

  const actionType = getActionType(notification.action);

  const config = {
    verbal: {
      icon: MessageSquare,
      color: 'border-yellow-200 bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      title: 'Verbal Warning Issued'
    },
    formal: {
      icon: AlertTriangle,
      color: 'border-orange-200 bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800',
      title: 'Formal Warning Issued'
    },
    ban: {
      icon: Ban,
      color: 'border-red-200 bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      title: 'Account Moderation Notice'
    },
    warning: {
      icon: AlertTriangle,
      color: 'border-orange-200 bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800',
      title: 'Moderation Notice'
    }
  };

  const style = config[actionType];
  const Icon = style.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="border-b border-stone-200"
      >
        <div className="max-w-7xl mx-auto p-4">
          <Alert className={`${style.color} border-2 relative`}>
            <Icon className={`h-5 w-5 ${style.iconColor}`} />
            <AlertTitle className={`${style.textColor} font-bold text-lg mb-2`}>
              {style.title}
            </AlertTitle>
            <AlertDescription className={style.textColor}>
              <div className="space-y-2">
                <p className="font-medium">{notification.action}</p>
                
                {notification.warningCount > 0 && (
                  <p className="text-sm">
                    <strong>Total Warnings:</strong> {notification.warningCount}
                  </p>
                )}
                
                {notification.lastWarningAt && (
                  <p className="text-sm">
                    <strong>Date:</strong> {format(new Date(notification.lastWarningAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
                
                <p className="text-sm mt-3 pt-3 border-t border-current opacity-75">
                  Please ensure you follow our community guidelines. Repeated violations may result in account suspension.
                </p>
              </div>
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className={`absolute top-4 right-4 ${style.textColor} hover:bg-black/10 h-8 w-8`}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}