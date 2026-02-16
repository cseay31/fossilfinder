import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BirthdayVerification({ isOpen, onComplete, isDarkMode, isNewUser = false }) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!month || !day || !year) {
      setError('Please enter your complete birthday');
      return;
    }

    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      setError('Please enter a valid month (1-12)');
      return;
    }

    if (dayNum < 1 || dayNum > 31) {
      setError('Please enter a valid day (1-31)');
      return;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError('Please enter a valid year');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Calculate age
      const birthDate = new Date(yearNum, monthNum - 1, dayNum);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const isOver13 = age >= 13;

      // Update user with age verification (birthday is NOT stored)
      await base44.auth.updateMe({
        is_over_13: isOver13,
        birthday_verified: true,
        needs_birthday_check: false
      });

      onComplete(isOver13);
    } catch (err) {
      console.error("Failed to verify birthday:", err);
      setError('Failed to verify birthday. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
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
              <Shield className="w-5 h-5 text-white" />
            </div>
            Age Verification Required
          </DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>
            {isNewUser ? 'Before we continue, we need to verify your age for safety compliance' : 'We need to verify your age for safety and compliance purposes'}
          </DialogDescription>
        </DialogHeader>

        <Alert className={`${isDarkMode ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-200'}`}>
          <Calendar className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <AlertDescription className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            <strong>Privacy Notice:</strong> Your birthday will NOT be stored or shown to anyone. It's only used to verify you're over 13, then immediately deleted from our servers.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className={isDarkMode ? 'text-white' : 'text-stone-700'}>
              What is your birthday? *
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Input
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="MM"
                  min="1"
                  max="12"
                  maxLength={2}
                  className={`${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500' 
                      : 'bg-white border-stone-300 text-stone-800 placeholder:text-stone-400'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-stone-500'}`}>Month</p>
              </div>
              <div>
                <Input
                  type="number"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="DD"
                  min="1"
                  max="31"
                  maxLength={2}
                  className={`${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500' 
                      : 'bg-white border-stone-300 text-stone-800 placeholder:text-stone-400'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-stone-500'}`}>Day</p>
              </div>
              <div>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="YYYY"
                  min="1900"
                  max={new Date().getFullYear()}
                  maxLength={4}
                  className={`${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500' 
                      : 'bg-white border-stone-300 text-stone-800 placeholder:text-stone-400'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-stone-500'}`}>Year</p>
              </div>
            </div>
          </div>

          <Alert className={`${isDarkMode ? 'bg-orange-900/20 border-orange-500/50' : 'bg-orange-50 border-orange-200'}`}>
            <AlertDescription className={`text-sm ${isDarkMode ? 'text-orange-200' : 'text-orange-800'}`}>
              <strong>Please do not lie.</strong> This will not affect the app in any way. We just need to verify your age for legal compliance.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className="border-red-500/50 bg-red-900/20">
              <AlertDescription className="text-red-400 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isVerifying || !month || !day || !year}
            className={`w-full ${
              isDarkMode 
                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500' 
                : 'bg-gradient-to-r from-amber-600 to-stone-700 hover:from-amber-700 hover:to-stone-800'
            } text-white`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Age'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}