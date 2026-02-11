import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";

let currentUser = null;

// Initialize user
const initUser = async () => {
  try {
    currentUser = await base44.auth.me();
  } catch (error) {
    console.error("Failed to get user for audit logging:", error);
  }
};

// Log audit event
export const logAudit = async (actionType, details = {}) => {
  if (!currentUser) {
    await initUser();
  }
  
  if (!currentUser) return;

  try {
    await base44.entities.AuditLog.create({
      user_email: currentUser.email,
      user_name: currentUser.display_name || currentUser.full_name || 'User',
      action_type: actionType,
      page: window.location.pathname,
      element: details.element || '',
      details: JSON.stringify(details),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};

export default function AuditLogger() {
  const location = useLocation();

  useEffect(() => {
    initUser();
  }, []);

  // Track page views
  useEffect(() => {
    logAudit('page_view', { path: location.pathname });
  }, [location.pathname]);

  // Track all clicks globally
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target;
      const tagName = target.tagName.toLowerCase();
      const text = target.textContent?.substring(0, 50) || '';
      const className = target.className || '';
      
      let elementType = tagName;
      if (tagName === 'button') elementType = 'button';
      else if (tagName === 'a') elementType = 'link';
      else if (target.onclick || target.getAttribute('role') === 'button') elementType = 'interactive';

      logAudit('click', {
        element: elementType,
        text: text,
        className: className,
        tagName: tagName
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Track form submissions
  useEffect(() => {
    const handleSubmit = (e) => {
      const form = e.target;
      logAudit('form_submit', {
        element: 'form',
        formId: form.id || '',
        formName: form.name || ''
      });
    };

    document.addEventListener('submit', handleSubmit, true);
    return () => document.removeEventListener('submit', handleSubmit, true);
  }, []);

  // Track input changes (throttled)
  useEffect(() => {
    let timeout;
    const handleInput = (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const target = e.target;
        logAudit('input_change', {
          element: 'input',
          inputType: target.type || '',
          inputName: target.name || '',
          inputId: target.id || ''
        });
      }, 1000); // Throttle to avoid spam
    };

    document.addEventListener('input', handleInput, true);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('input', handleInput, true);
    };
  }, []);

  return null;
}