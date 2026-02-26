import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X } from "lucide-react";

export default function SafariBrowserWarning() {
  const [isSafari, setIsSafari] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detect Safari: has 'Safari' in UA but NOT 'Chrome' or 'Chromium'
    const ua = navigator.userAgent;
    const safari = /^((?!chrome|android).)*safari/i.test(ua);
    if (safari) {
      const alreadyDismissed = sessionStorage.getItem("safari-warning-dismissed");
      if (!alreadyDismissed) {
        setIsSafari(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("safari-warning-dismissed", "true");
    setDismissed(true);
  };

  if (!isSafari || dismissed) return null;

  return (
    <div className="px-4 pt-3">
      <Alert className="border-amber-300 bg-amber-50 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <AlertDescription className="text-amber-800 flex-1">
          <strong>Safari Compatibility Notice:</strong> Some features like GPS location capture
          may not work correctly in Safari. For the best experience, please use Chrome, Firefox, or Edge.
        </AlertDescription>
        <button
          onClick={handleDismiss}
          className="text-amber-600 hover:text-amber-800 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
}