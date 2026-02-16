import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import BirthdayVerification from '@/components/compliance/BirthdayVerification';

export default function DisplayNamePrompt({ isOpen, onComplete, isDarkMode }) {
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showBirthdayCheck, setShowBirthdayCheck] = useState(false);
  const [savedDisplayName, setSavedDisplayName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }

    if (displayName.trim().length > 30) {
      setError('Display name must be less than 30 characters');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await base44.auth.updateMe({ display_name: displayName.trim() });
      setSavedDisplayName(displayName.trim());
      setShowBirthdayCheck(true);
    } catch (err) {
      console.error("Failed to set display name:", err);
      setError('Failed to save display name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBirthdayComplete = (isOver13) => {
    setShowBirthdayCheck(false);
    onComplete();
  };

  return (
    <>
      <Dialog open={isOpen && !showBirthdayCheck} onOpenChange={() => {}}>
        <DialogContent 
          className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200'} max-w-md`}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className={`text-2xl flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-cyan-500 to-emerald-600' : 'bg-gradient-to-br from-amber-600 to-stone-700'
              }`}>
                <User className="w-5 h-5 text-white" />
              </div>
              Welcome to FossilFinder!
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>
              Please choose a display name that will be shown to other users
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className={isDarkMode ? 'text-white' : 'text-stone-700'}>
                Display Name *
              </Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={30}
                autoFocus
                className={`${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500' 
                    : 'bg-white border-stone-300 text-stone-800 placeholder:text-stone-400'
                }`}
              />
              <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-stone-500'}`}>
                This will be visible to other users on your posts and discoveries
              </p>
            </div>

            {error && (
              <Alert className="border-red-500/50 bg-red-900/20">
                <AlertDescription className="text-red-400 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isSaving || !displayName.trim()}
              className={`w-full ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500' 
                  : 'bg-gradient-to-r from-amber-600 to-stone-700 hover:from-amber-700 hover:to-stone-800'
              } text-white`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to FossilFinder'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <BirthdayVerification
        isOpen={showBirthdayCheck}
        onComplete={handleBirthdayComplete}
        isDarkMode={isDarkMode}
        isNewUser={true}
      />
    </>
  );
}