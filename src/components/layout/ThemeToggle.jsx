import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={`rounded-full w-9 h-9 p-0 ${
        isDark 
          ? 'bg-white/10 hover:bg-white/20 text-cyan-300' 
          : 'bg-stone-100 hover:bg-stone-200 text-amber-600'
      }`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}