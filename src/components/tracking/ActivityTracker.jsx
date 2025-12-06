import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function ActivityTracker() {
  const location = useLocation();
  const activityIdRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  const getPageName = (pathname) => {
    const path = pathname.replace('/', '');
    return path || 'Home';
  };

  const updateActivity = async (action = null) => {
    try {
      const user = await base44.auth.me();
      const currentPage = getPageName(location.pathname);
      
      const activityData = {
        user_email: user.email,
        user_name: user.full_name || user.email,
        current_page: currentPage,
        last_action: action || `Viewing ${currentPage}`,
        is_active: true,
        last_seen: new Date().toISOString()
      };

      if (activityIdRef.current) {
        await base44.entities.UserActivity.update(activityIdRef.current, activityData);
      } else {
        const existing = await base44.entities.UserActivity.filter({ user_email: user.email });
        if (existing.length > 0) {
          activityIdRef.current = existing[0].id;
          await base44.entities.UserActivity.update(existing[0].id, activityData);
        } else {
          const created = await base44.entities.UserActivity.create(activityData);
          activityIdRef.current = created.id;
        }
      }
    } catch (error) {
      console.error("Failed to update activity:", error);
    }
  };

  useEffect(() => {
    updateActivity();

    const interval = setInterval(() => {
      updateActivity();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [location.pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activityIdRef.current) {
        navigator.sendBeacon(
          '/api/activity/close',
          JSON.stringify({ id: activityIdRef.current })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null;
}

export const trackAction = async (action) => {
  try {
    const user = await base44.auth.me();
    const existing = await base44.entities.UserActivity.filter({ user_email: user.email });
    
    if (existing.length > 0) {
      await base44.entities.UserActivity.update(existing[0].id, {
        last_action: action,
        last_seen: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Failed to track action:", error);
  }
};