import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mail, CheckCircle2, AlertCircle, Lock } from "lucide-react";

export default function ParentalConsentPrompt({ isOpen, onComplete, isDarkMode }) {
  const [parentEmail, setParentEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!parentEmail || !confirmEmail) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validateEmail(parentEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (parentEmail !== confirmEmail) {
      setError("Email addresses do not match.");
      return;
    }

    // Check if parent is trying to use their own account email
    const user = await base44.auth.me();
    if (parentEmail.toLowerCase() === user.email.toLowerCase()) {
      setError("Parent/guardian email cannot be the same as your account email.");
      return;
    }

    setIsSending(true);

    try {
      const res = await base44.functions.invoke('parentalConsent', {
        action: 'send',
        parent_email: parentEmail,
        origin: window.location.origin,
      });

      if (res?.data?.error) {
        setError(res.data.error);
        setIsSending(false);
        return;
      }

      setEmailSent(true);
      setTimeout(() => { onComplete(); }, 5000);
    } catch (err) {
      console.error("Failed to send parental consent email:", err);
      setError("Failed to send consent email. Please try again.");
      setIsSending(false);
    }
  };

  if (emailSent) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <CheckCircle2 className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
            <DialogTitle className={`text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Verification Email Sent!
            </DialogTitle>
            <DialogDescription className={`text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              We've sent a verification email to your parent/guardian at:
              <div className={`mt-2 font-semibold ${isDarkMode ? 'text-cyan-400' : 'text-slate-900'}`}>
                {parentEmail}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Alert className={isDarkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}>
              <Mail className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <AlertDescription className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                <strong>What happens next:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Your parent/guardian will receive an email explaining what information we collect</li>
                  <li>They must click the verification link to give consent</li>
                  <li>Until then, your account is restricted (read-only access)</li>
                  <li>You cannot upload photos or post content without consent</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Alert className={isDarkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}>
              <Lock className={`h-4 w-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <AlertDescription className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                <strong>Your account is now in "Pending Consent" mode.</strong> You can browse the app but cannot upload discoveries until your parent verifies consent.
              </AlertDescription>
            </Alert>

            <p className={`text-xs text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Closing this window in a moment...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
            }`}>
              <Shield className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
          </div>
          <DialogTitle className={`text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Parental Consent Required
          </DialogTitle>
          <DialogDescription className={`text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Because you're under 13, we need your parent or guardian's permission before you can use FossilFinder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Alert className={isDarkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}>
            <AlertCircle className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <AlertDescription className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
              <strong>Why we need this:</strong> Federal law (COPPA) requires us to get your parent's permission before collecting information from kids under 13. This keeps you safe online!
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className={isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}>
              <AlertCircle className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <AlertDescription className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="parentEmail" className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
              Parent/Guardian Email Address
            </Label>
            <Input
              id="parentEmail"
              type="email"
              placeholder="parent@example.com"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              disabled={isSending}
              className={isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : ''}
            />
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter your parent or legal guardian's email address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmEmail" className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
              Confirm Email Address
            </Label>
            <Input
              id="confirmEmail"
              type="email"
              placeholder="parent@example.com"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              disabled={isSending}
              className={isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : ''}
            />
          </div>

          <Alert className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}>
            <Shield className={`h-4 w-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            <AlertDescription className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <strong>Privacy Protection:</strong> We'll email your parent to explain what information we collect and ask for their permission. We hash (encrypt) their email for security.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleSubmit}
            disabled={isSending}
            className={`w-full ${
              isDarkMode 
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500' 
                : 'bg-gradient-to-r from-amber-600 to-stone-700 hover:from-amber-700 hover:to-stone-800'
            } text-white`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending Email...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Verification Email
              </>
            )}
          </Button>

          <p className={`text-xs text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <strong>Important:</strong> Make sure you have permission to use your parent's email address!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}