import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";

let globalActivityId = null;

export default function ActivityTracker() {
  const location = useLocation();
  const intervalRef = useRef(null);

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

      if (globalActivityId) {
        await base44.entities.UserActivity.update(globalActivityId, activityData);
      } else {
        const existing = await base44.entities.UserActivity.filter({ user_email: user.email });
        
        if (existing.length > 0) {
          // Clean up duplicates - keep only the first one
          globalActivityId = existing[0].id;
          
          // Delete any duplicate entries
          if (existing.length > 1) {
            for (let i = 1; i < existing.length; i++) {
              await base44.entities.UserActivity.delete(existing[i].id);
            }
          }
          
          await base44.entities.UserActivity.update(existing[0].id, activityData);
        } else {
          const created = await base44.entities.UserActivity.create(activityData);
          globalActivityId = created.id;
        }
      }
    } catch (error) {
      // Silently fail to avoid console spam
    }
  };

  useEffect(() => {
    updateActivity();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      updateActivity();
    }, 5000); // Update every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location.pathname]);

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
    // Silently fail
  }
};