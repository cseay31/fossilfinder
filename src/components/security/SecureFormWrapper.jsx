import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { validateAndSanitize } from './InputValidator';
import { useRateLimit } from './SecurityMonitor';
import { toast } from 'sonner';
import BotChallenge from './BotChallenge';

export default function SecureFormWrapper({ 
  children, 
  onSubmit, 
  actionType = 'api_call',
  maxActions = 10,
  requireBotCheck = false,
  isDarkMode 
}) {
  const [showBotChallenge, setShowBotChallenge] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const { checkRateLimit } = useRateLimit(actionType, maxActions);
  
  const handleSubmit = async (data) => {
    try {
      // Get current user
      const user = await base44.auth.me().catch(() => null);
      
      // Rate limit check
      if (user) {
        const rateLimitResult = await checkRateLimit(user.email);
        if (!rateLimitResult.allowed) {
          toast.error('Rate limit exceeded. Please try again later.');
          return;
        }
      }
      
      // Validate all string fields
      const validatedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          const result = await validateAndSanitize(value, key);
          if (!result.valid) {
            return; // Validation failed, error already shown
          }
          validatedData[key] = result.sanitized;
        } else {
          validatedData[key] = value;
        }
      }
      
      // Bot check if required
      if (requireBotCheck && Math.random() < 0.1) { // 10% of submissions
        setPendingData(validatedData);
        setShowBotChallenge(true);
        return;
      }
      
      // Proceed with submission
      await onSubmit(validatedData);
    } catch (error) {
      console.error('Secure form submission failed:', error);
      toast.error('Submission failed');
    }
  };
  
  const handleBotVerification = async (passed) => {
    setShowBotChallenge(false);
    
    if (passed) {
      await onSubmit(pendingData);
    } else {
      toast.error('Verification failed. Please try again.');
      console.warn('Bot challenge failed:', { action: 'Failed bot challenge' });
    }
    
    setPendingData(null);
  };
  
  return (
    <>
      {React.cloneElement(children, { onSubmit: handleSubmit })}
      {showBotChallenge && (
        <BotChallenge onVerify={handleBotVerification} isDarkMode={isDarkMode} />
      )}
    </>
  );
}