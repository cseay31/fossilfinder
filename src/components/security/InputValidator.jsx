import { SecurityUtils } from './SecurityMonitor';
import { toast } from 'sonner';

export const validateAndSanitize = async (input, fieldName = 'input') => {
  if (!input) return { valid: true, sanitized: input };
  
  const inputStr = String(input);
  
  // Check for SQL injection
  if (SecurityUtils.detectSQLInjection(inputStr)) {
    await SecurityUtils.logSecurityEvent('injection_attempt', 'critical', {
      field: fieldName,
      input: inputStr.substring(0, 100)
    });
    
    toast.error('Security Alert: Invalid input detected');
    return { valid: false, sanitized: null };
  }
  
  // Check for XSS
  if (SecurityUtils.detectXSS(inputStr)) {
    await SecurityUtils.logSecurityEvent('xss_attempt', 'critical', {
      field: fieldName,
      input: inputStr.substring(0, 100)
    });
    
    toast.error('Security Alert: Invalid input detected');
    return { valid: false, sanitized: null };
  }
  
  // Sanitize and return
  const sanitized = SecurityUtils.sanitizeInput(inputStr);
  return { valid: true, sanitized };
};

// Wrapper component for secure forms
export function SecureInput({ value, onChange, onValidationFail, fieldName, ...props }) {
  const handleChange = async (e) => {
    const newValue = e.target.value;
    const result = await validateAndSanitize(newValue, fieldName);
    
    if (result.valid) {
      onChange(e);
    } else {
      if (onValidationFail) {
        onValidationFail(fieldName);
      }
    }
  };
  
  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
    />
  );
}