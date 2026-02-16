import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Shield, Loader2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";

export default function TOSAgreement({ isOpen, onComplete, isDarkMode, isNewUser = false }) {
  const [agreed, setAgreed] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy to continue');
      return;
    }

    setIsAccepting(true);
    setError('');

    try {
      await base44.auth.updateMe({
        tos_accepted: true,
        tos_accepted_date: new Date().toISOString()
      });
      onComplete();
    } catch (err) {
      console.error("Failed to accept TOS:", err);
      setError('Failed to save agreement. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200'} max-w-2xl max-h-[90vh] overflow-y-auto`}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={`text-2xl flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-gradient-to-br from-cyan-500 to-emerald-600' : 'bg-gradient-to-br from-amber-600 to-stone-700'
            }`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            {isNewUser ? 'Welcome to FossilFinder!' : 'Terms & Privacy Update'}
          </DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>
            {isNewUser 
              ? 'Please review and accept our Terms of Service and Privacy Policy to get started' 
              : 'We need you to review and accept our updated Terms of Service and Privacy Policy'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Terms of Service</h3>
              </div>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <li>• AI analysis usage guidelines</li>
                <li>• Community conduct rules</li>
                <li>• Legal compliance requirements</li>
                <li>• Service usage terms</li>
              </ul>
              <Button
                variant="link"
                className={`p-0 h-auto mt-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}
                onClick={() => window.open(createPageUrl('TermsOfService'), '_blank')}
              >
                Read Full Terms <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-green-600'}`} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Privacy Policy</h3>
              </div>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <li>• What data we collect</li>
                <li>• How we use your information</li>
                <li>• COPPA compliance (under 13)</li>
                <li>• Your privacy rights</li>
              </ul>
              <Button
                variant="link"
                className={`p-0 h-auto mt-2 ${isDarkMode ? 'text-emerald-400' : 'text-green-600'}`}
                onClick={() => window.open(createPageUrl('PrivacyPolicy'), '_blank')}
              >
                Read Full Policy <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Key Points */}
          <Alert className={`${isDarkMode ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-200'}`}>
            <AlertDescription className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              <strong>Key Points:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>AI analysis is for educational purposes - consult experts for verification</li>
                <li>You're responsible for legal compliance when collecting fossils</li>
                <li>We don't sell your data and protect your privacy</li>
                <li>Users under 13 have restricted access to social features</li>
                <li>Community guidelines must be followed</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Agreement Checkbox */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={setAgreed}
              className={isDarkMode ? 'border-slate-600' : 'border-slate-300'}
            />
            <div className="flex-1">
              <Label
                htmlFor="agree"
                className={`text-sm cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
              >
                I have read and agree to the{' '}
                <button
                  onClick={() => window.open(createPageUrl('TermsOfService'), '_blank')}
                  className={`underline ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button
                  onClick={() => window.open(createPageUrl('PrivacyPolicy'), '_blank')}
                  className={`underline ${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-green-600 hover:text-green-700'}`}
                >
                  Privacy Policy
                </button>
              </Label>
            </div>
          </div>

          {error && (
            <Alert className="border-red-500/50 bg-red-900/20">
              <AlertDescription className="text-red-400 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleAccept}
            disabled={isAccepting || !agreed}
            className={`w-full ${
              isDarkMode 
                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500' 
                : 'bg-gradient-to-r from-amber-600 to-stone-700 hover:from-amber-700 hover:to-stone-800'
            } text-white`}
          >
            {isAccepting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Accept and Continue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}