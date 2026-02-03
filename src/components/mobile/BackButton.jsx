import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ isDarkMode, className = '' }) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    }
  };

  // Only show if there's a history stack
  if (window.history.length <= 1) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-stone-800 hover:bg-stone-100'} ${className}`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      Back
    </Button>
  );
}