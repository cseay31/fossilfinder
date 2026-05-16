import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Shield, AlertCircle, Loader2 } from "lucide-react";

export default function ParentalConsentPage() {
  const [status, setStatus] = useState("loading"); // loading, consent_given, consent_denied, invalid, error
  const [childInfo, setChildInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    verifyConsentToken();
  }, []);

  const verifyConsentToken = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const consentToken = urlParams.get("consent_token");
    const userEmail = urlParams.get("user_email");

    if (!consentToken || !userEmail) {
      setStatus("invalid");
      return;
    }

    try {
      const res = await base44.functions.invoke('parentalConsent', {
        action: 'verify',
        consent_token: consentToken,
        user_email: userEmail,
      });
      const result = res?.data || {};

      if (result.status === 'invalid') {
        setStatus("invalid");
        setErrorMessage("Invalid or expired consent link.");
        return;
      }
      if (result.status === 'already_verified') {
        setChildInfo(result.child);
        setStatus("already_verified");
        return;
      }
      setChildInfo(result.child);
      setStatus("pending_action");
    } catch (error) {
      console.error("Failed to verify consent token:", error);
      setStatus("error");
      setErrorMessage("Failed to load consent information. Please try again.");
    }
  };

  const submitConsent = async (action) => {
    setIsProcessing(true);
    setErrorMessage("");
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const res = await base44.functions.invoke('parentalConsent', {
        action,
        consent_token: urlParams.get("consent_token"),
        user_email: urlParams.get("user_email"),
      });
      const result = res?.data || {};
      if (result.error) {
        setErrorMessage(result.error);
        setIsProcessing(false);
        return;
      }
      setStatus(result.status);
    } catch (error) {
      console.error("Failed to submit consent:", error);
      setErrorMessage("Failed to process. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleGiveConsent = () => submitConsent('approve');
  const handleDenyConsent = () => submitConsent('deny');

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <span className="ml-3 text-slate-600">Loading consent information...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center text-red-800">Invalid Consent Link</CardTitle>
            <CardDescription className="text-center">
              {errorMessage || "This consent link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                If you believe this is an error, please contact the FossilFinder team through the app's Contact Admin feature.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "already_verified") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-green-800">Consent Already Given</CardTitle>
            <CardDescription className="text-center">
              You have already given consent for this child's account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                The child's account is active and they can use FossilFinder. You can revoke consent at any time by contacting us through the Contact Admin feature.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "consent_given") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-green-800">Consent Approved</CardTitle>
            <CardDescription className="text-center">
              Thank you for giving consent!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Account Activated:</strong> Your child can now use FossilFinder to upload and analyze fossil discoveries.
              </AlertDescription>
            </Alert>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-slate-800">Your Parental Rights:</h3>
              <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                <li>Review information collected from your child</li>
                <li>Request deletion of your child's data</li>
                <li>Revoke consent at any time</li>
                <li>Control what features they can access</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                To exercise these rights, use the "Contact Admin" feature in the FossilFinder app.
              </p>
            </div>

            <p className="text-sm text-center text-slate-600">
              You can close this window now.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "consent_denied") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-slate-600" />
              </div>
            </div>
            <CardTitle className="text-center text-slate-800">Consent Denied</CardTitle>
            <CardDescription className="text-center">
              You have declined to give consent for this child's account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-slate-50 border-slate-200">
              <AlertCircle className="h-4 w-4 text-slate-600" />
              <AlertDescription className="text-slate-700">
                The child's account has been restricted and they will not be able to upload content or access features. You can close this window.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending action (showing consent form)
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-stone-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-slate-900">Parental Consent Required</CardTitle>
          <CardDescription className="text-center">
            A child has requested to use FossilFinder with your permission
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {errorMessage && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {childInfo && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Child's Account Information:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Email:</strong> {childInfo.email}</p>
                <p><strong>Display Name:</strong> {childInfo.display_name || "Not set"}</p>
                <p><strong>Account Created:</strong> {childInfo.created_date ? new Date(childInfo.created_date).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">What is FossilFinder?</h3>
            <p className="text-sm text-slate-600">
              FossilFinder is an educational platform that uses artificial intelligence to help identify fossils and archaeological artifacts from photos. Children can upload pictures of interesting rocks or bones they find and receive AI-powered analysis.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">What Information Do We Collect from Your Child?</h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li>Email address and display name (for account login)</li>
              <li>Photos of fossils/artifacts they upload (for AI analysis)</li>
              <li>GPS location data (only when uploading discoveries, if you allow)</li>
              <li>Discovery descriptions and notes</li>
              <li>Usage statistics (pages visited, features used - to improve our service)</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Safety Features for Children Under 13:</h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li><strong>NO Social Features:</strong> Forum, FosFeed, and public comments are completely disabled</li>
              <li><strong>Private Discoveries:</strong> All discoveries are private by default</li>
              <li><strong>No Expert Contact:</strong> Expert matching is disabled to prevent contact with strangers</li>
              <li><strong>No Advertising:</strong> We do not show ads to children</li>
              <li><strong>No Data Selling:</strong> We never sell or rent your child's information</li>
            </ul>
          </div>

          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Your Rights as a Parent:</strong> You can request to review, delete, or stop further collection of your child's information at any time. Simply use the "Contact Admin" feature in the app.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDenyConsent}
              disabled={isProcessing}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny Consent
                </>
              )}
            </Button>

            <Button
              onClick={handleGiveConsent}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Give Consent
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500">
            By clicking "Give Consent," you acknowledge that you are the parent or legal guardian of this child and you consent to the collection and use of their information as described above and in our Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}