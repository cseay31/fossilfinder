import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Check } from "lucide-react";

export default function MobileSelect({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder = "Select...", 
  label,
  isDarkMode,
  trigger 
}) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // On desktop, return regular select trigger
  if (!isMobile) {
    return trigger || (
      <Button variant="outline" className="w-full justify-start">
        {selectedOption?.label || placeholder}
      </Button>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            className={`w-full justify-start ${isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : ''}`}
            style={{ userSelect: 'none' }}
          >
            {selectedOption?.label || placeholder}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className={isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white'}>
        <DrawerHeader className="text-left">
          <DrawerTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>{label || placeholder}</DrawerTitle>
          {selectedOption && (
            <DrawerDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              Current: {selectedOption.label}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                      : isDarkMode
                        ? 'bg-slate-800/50 text-white hover:bg-slate-700/50'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                  style={{ userSelect: 'none' }}
                >
                  <span className="font-medium">{option.label}</span>
                  {isSelected && <Check className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className={isDarkMode ? 'border-white/10 text-white' : ''}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}