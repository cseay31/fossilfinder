import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mail, Lock } from "lucide-react";

export default function PendingConsentBanner({ isDarkMode }) {
  return (
    <Alert className={`border-2 ${
      isDarkMode 
        ? 'bg-yellow-500/10 border-yellow-500/30' 
        : 'bg-yellow-50 border-yellow-300'
    }`}>
      <Shield className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`} />
      <AlertDescription className={`${isDarkMode ? 'text-yellow-200' : 'text-yellow-900'} font-medium`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-bold mb-1">⚠️ Account Pending Parental Consent</p>
            <p className="text-sm">
              Your account is in <strong>restricted mode</strong> because you're under 13. We've sent a verification email to your parent/guardian. 
            </p>
            <p className="text-sm mt-2">
              <Lock className="inline w-4 h-4 mr-1" />
              <strong>What you can do now:</strong> Browse the app and view content
            </p>
            <p className="text-sm">
              <Mail className="inline w-4 h-4 mr-1" />
              <strong>What you cannot do:</strong> Upload photos, post comments, or share discoveries until your parent approves
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}