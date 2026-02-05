import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';

// Anti-bot behavioral analysis
const BotDetector = {
  mouseMoveCount: 0,
  clickCount: 0,
  keyPressCount: 0,
  suspiciousPatterns: 0,
  lastActionTime: Date.now(),
  
  initialize() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('mousemove', () => {
      this.mouseMoveCount++;
      this.lastActionTime = Date.now();
    });
    
    window.addEventListener('click', () => {
      this.clickCount++;
      this.lastActionTime = Date.now();
    });
    
    window.addEventListener('keypress', () => {
      this.keyPressCount++;
      this.lastActionTime = Date.now();
    });
  },
  
  analyze() {
    const timeSinceStart = Date.now() - this.lastActionTime;
    const totalInteractions = this.mouseMoveCount + this.clickCount + this.keyPressCount;
    
    // Bot indicators
    if (totalInteractions === 0 && timeSinceStart > 5000) {
      this.suspiciousPatterns++;
    }
    
    // Too many rapid actions
    if (this.clickCount > 100 || this.keyPressCount > 200) {
      this.suspiciousPatterns++;
    }
    
    return {
      isLikelyBot: this.suspiciousPatterns > 2,
      confidence: Math.min(this.suspiciousPatterns * 30, 100),
      interactions: totalInteractions
    };
  }
};

export default function SecurityMonitor({ currentUser }) {
  const location = useLocation();
  const sessionStart = useRef(Date.now());
  const lastPage = useRef('');
  const actionCount = useRef(0);
  
  useEffect(() => {
    // Initialize bot detection
    BotDetector.initialize();
    
    // Monitor session duration
    const sessionMonitor = setInterval(async () => {
      const sessionDuration = (Date.now() - sessionStart.current) / 1000 / 60; // minutes
      
      // Detect suspicious session patterns
      if (sessionDuration > 120) { // 2 hours
        try {
          await base44.entities.SecurityLog.create({
            event_type: 'suspicious_activity',
            user_email: currentUser?.email || 'anonymous',
            severity: 'low',
            details: JSON.stringify({
              reason: 'Long session duration',
              duration_minutes: sessionDuration
            })
          });
        } catch (err) {
          console.error('Security logging failed:', err);
        }
      }
    }, 300000); // Check every 5 minutes
    
    return () => clearInterval(sessionMonitor);
  }, [currentUser]);
  
  useEffect(() => {
    // Log page navigation for audit trail
    const logPageView = async () => {
      if (!currentUser) return;
      
      try {
        await base44.entities.SecurityLog.create({
          event_type: 'suspicious_activity',
          user_email: currentUser.email,
          page: location.pathname,
          action: 'page_view',
          severity: 'low',
          user_agent: navigator.userAgent,
          details: JSON.stringify({
            referrer: document.referrer,
            timestamp: new Date().toISOString()
          })
        });
        
        lastPage.current = location.pathname;
      } catch (err) {
        // Silent fail for security logs
      }
    };
    
    logPageView();
  }, [location.pathname, currentUser]);
  
  useEffect(() => {
    // Bot detection check every 30 seconds
    const botCheck = setInterval(async () => {
      const analysis = BotDetector.analyze();
      
      if (analysis.isLikelyBot && currentUser) {
        try {
          await base44.entities.SecurityLog.create({
            event_type: 'bot_detected',
            user_email: currentUser.email,
            severity: 'high',
            details: JSON.stringify({
              confidence: analysis.confidence,
              interactions: analysis.interactions
            }),
            blocked: false
          });
        } catch (err) {
          console.error('Bot detection logging failed:', err);
        }
      }
    }, 30000);
    
    return () => clearInterval(botCheck);
  }, [currentUser]);
  
  // Monitor for rapid actions (potential automation)
  useEffect(() => {
    const monitorRapidActions = () => {
      actionCount.current++;
      
      if (actionCount.current > 50) {
        base44.entities.SecurityLog.create({
          event_type: 'rate_limit_exceeded',
          user_email: currentUser?.email || 'anonymous',
          severity: 'medium',
          details: JSON.stringify({
            action_count: actionCount.current,
            time_window: '1_minute'
          })
        }).catch(() => {});
        
        actionCount.current = 0;
      }
    };
    
    window.addEventListener('click', monitorRapidActions);
    return () => window.removeEventListener('click', monitorRapidActions);
  }, [currentUser]);
  
  return null;
}

// Export security utilities
export const SecurityUtils = {
  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>]/g, (char) => char === '<' ? '&lt;' : '&gt;'); // Escape HTML
  },
  
  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Detect SQL injection attempts
  detectSQLInjection(input) {
    if (typeof input !== 'string') return false;
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(UNION\s+SELECT)/gi,
      /(OR\s+1\s*=\s*1)/gi,
      /(--|\#|\/\*|\*\/)/g
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  },
  
  // Detect XSS attempts
  detectXSS(input) {
    if (typeof input !== 'string') return false;
    
    const xssPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /onerror\s*=/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  },
  
  // Log security event
  async logSecurityEvent(eventType, severity, details) {
    try {
      const user = await base44.auth.me().catch(() => null);
      
      await base44.entities.SecurityLog.create({
        event_type: eventType,
        user_email: user?.email || 'anonymous',
        severity,
        user_agent: navigator.userAgent,
        page: window.location.pathname,
        details: JSON.stringify(details),
        blocked: severity === 'critical' || severity === 'high'
      });
    } catch (err) {
      console.error('Security logging failed:', err);
    }
  }
};

// Rate limiting hook
export const useRateLimit = (actionType, maxActions = 10, windowMinutes = 1) => {
  const checkRateLimit = async (userEmail) => {
    try {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
      
      const logs = await base44.entities.RateLimitLog.filter({
        user_email: userEmail,
        action_type: actionType
      });
      
      // Filter logs within the time window
      const recentLogs = logs.filter(log => 
        new Date(log.created_date) > windowStart
      );
      
      const totalCount = recentLogs.reduce((sum, log) => sum + (log.count || 1), 0);
      
      if (totalCount >= maxActions) {
        // Rate limit exceeded
        await base44.entities.RateLimitLog.create({
          user_email: userEmail,
          action_type: actionType,
          count: 1,
          window_start: windowStart.toISOString(),
          blocked: true
        });
        
        await SecurityUtils.logSecurityEvent('rate_limit_exceeded', 'medium', {
          action_type: actionType,
          count: totalCount,
          max_allowed: maxActions
        });
        
        return { allowed: false, remaining: 0 };
      }
      
      // Log this action
      await base44.entities.RateLimitLog.create({
        user_email: userEmail,
        action_type: actionType,
        count: 1,
        window_start: new Date().toISOString(),
        blocked: false
      });
      
      return { allowed: true, remaining: maxActions - totalCount - 1 };
    } catch (err) {
      console.error('Rate limit check failed:', err);
      return { allowed: true, remaining: maxActions }; // Fail open
    }
  };
  
  return { checkRateLimit };
};