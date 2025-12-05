import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Discovery } from "@/entities/Discovery";
import { Settings } from "@/entities/Settings";
import { InvokeLLM, UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, MapPin, Loader2, CheckCircle, AlertCircle, Search, Users, Shield, Ban, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import PhotoUpload from "../components/upload/PhotoUpload";
import AnalysisProgress from "../components/upload/AnalysisProgress";
import AnalysisResults from "../components/upload/AnalysisResults";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UploadPage({ isDarkMode }) {
  const [currentStep, setCurrentStep] = useState("upload");
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [discoverySettings, setDiscoverySettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    loadSettings();

    // Poll settings every 3 seconds to keep in sync
    const interval = setInterval(() => {
      loadSettings();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const data = await Settings.filter({ setting_key: 'global' });
      if (data.length > 0) {
        setDiscoverySettings(data[0]);
      } else {
        // auto-create default if missing
        const created = await Settings.create({
          announcement_text: '',
          announcement_active: false,
          announcement_type: 'info',
          discoveries_enabled: true,
          setting_key: 'global'
        });
        setDiscoverySettings(created);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Location error:", error);
          setIsGettingLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  const handlePhotoCapture = async (file) => {
    setError("");
    
    if (!file) {
      setPhoto(null);
      setPhotoUrl("");
      return;
    }

    setPhoto(file);
    setIsUploadingPhoto(true);

    try {
      const { file_url } = await UploadFile({ file });
      
      if (!file_url) {
        throw new Error("Failed to get file URL");
      }

      setPhotoUrl(file_url);
      setIsUploadingPhoto(false);

    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload photo. Please try again.");
      setPhoto(null);
      setPhotoUrl("");
      setIsUploadingPhoto(false);
    }
  };

  const analyzePhoto = async () => {
    if (!photoUrl) {
      setError("Please upload a photo first.");
      return;
    }

    if (!latitude || !longitude) {
      setError("Location is required. Please use the GPS button to capture your current location.");
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep("analyzing");
    setError("");

    try {
      // Step 1: AI Detection Check
      const aiDetectionResult = await InvokeLLM({
        prompt: `Analyze this image carefully and determine if it appears to be AI-generated or a real photograph.

Look for indicators such as:
- Unnatural textures or patterns
- Inconsistent lighting or shadows
- Anatomical impossibilities or distortions
- Overly smooth or artificial surfaces
- Telltale signs of AI generation (weird artifacts, impossible physics, etc.)
- Whether it appears to be a photograph of a real, physical object

Provide your assessment with a confidence score (0-100) where:
- 0-30 = Definitely a real photograph
- 31-70 = Uncertain/ambiguous
- 71-100 = Likely AI-generated

Be thorough and err on the side of caution to protect the integrity of archaeological research.`,
        file_urls: [photoUrl],
        response_json_schema: {
          type: "object",
          properties: {
            is_ai_generated: { type: "boolean" },
            confidence_score: { type: "number", minimum: 0, maximum: 100 },
            explanation: { type: "string" }
          }
        }
      });

      // Handle AI detection result
      if (aiDetectionResult.is_ai_generated) {
        setError(`🚫 AI-Generated Image Detected\n\nReason: ${aiDetectionResult.explanation}\n\nYour account is being suspended for 1 day.`);
        setCurrentStep("upload");
        setIsAnalyzing(false);
        
        // Ban user for 1 day
        try {
          const banDate = new Date();
          banDate.setDate(banDate.getDate() + 1);
          await base44.auth.updateMe({
            is_banned: true,
            ban_reason: `Automatic 1-day ban for uploading AI-generated image. Reason: ${aiDetectionResult.explanation}. Ban expires: ${banDate.toLocaleString()}`,
            ban_expires: banDate.toISOString()
          });
          
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } catch (banError) {
          console.error("Failed to apply ban:", banError);
        }
        return;
      }

      // Step 2: Create discovery with location data
      const discoveryData = {
        photo_url: photoUrl,
        location: location || "Unknown location",
        latitude: latitude,
        longitude: longitude,
        analysis_status: "analyzing"
      };

      const discovery = await Discovery.create(discoveryData);

      // Step 3: Analyze the fossil
      const analysisPrompt = `
You are an expert archaeologist and paleontologist. Analyze this photo of a potential fossil, artifact, or archaeological finding.

Additional context from user:
- Location: ${location || "Not provided"}
- Notes: ${additionalNotes || "None"}

Provide detailed analysis including:
1. Classification: What type of fossil, artifact, or archaeological item this appears to be
2. Confidence level (0-100): How certain you are of this identification
3. Time period: Geological era or archaeological period
4. Description: Detailed scientific description of what you observe
5. Significance: Scientific importance of this finding
6. Recommendations: What should be done next with this discovery

Be thorough and scientific in your analysis. If you're not certain about the identification, explain why and suggest alternative possibilities.
      `;

      const aiResponse = await InvokeLLM({
        prompt: analysisPrompt,
        file_urls: [photoUrl],
        response_json_schema: {
          type: "object",
          properties: {
            classification: { type: "string" },
            confidence_score: { type: "number", minimum: 0, maximum: 100 },
            time_period: { type: "string" },
            description: { type: "string" },
            significance_level: { type: "string", enum: ["low", "medium", "high", "exceptional"] },
            recommendations: { type: "string" }
          }
        }
      });

      const updatedDiscovery = await Discovery.update(discovery.id, {
        ...aiResponse,
        analysis_status: "completed"
      });

      setAnalysisResults(updatedDiscovery);
      setCurrentStep("results");

    } catch (error) {
      console.error("Analysis failed:", error);
      setError(`Analysis failed: ${error.message || error}. Please ensure you're using a supported image format (JPEG or PNG).`);
      setCurrentStep("upload");
    }

    setIsAnalyzing(false);
  };

  const startNewAnalysis = () => {
    setCurrentStep("upload");
    setPhoto(null);
    setPhotoUrl("");
    setLocation("");
    setAdditionalNotes("");
    setAnalysisResults(null);
    setError("");
  };

  // Check if discoveries are disabled
  const isDiscoveryDisabled = discoverySettings && discoverySettings.discoveries_enabled === false;

  if (!isLoadingSettings && isDiscoveryDisabled) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg p-8`}>
              <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-stone-800'} mb-3`}>
                        Discovery Uploads Temporarily Unavailable
                      </CardTitle>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-stone-600'} max-w-2xl mx-auto`}>
                        New discovery uploads are currently disabled by an administrator.
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className={`${isDarkMode ? 'text-slate-500' : 'text-stone-500'} mb-6`}>
                        Please check back later. You can still browse your existing discoveries and connect with experts.
                      </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link to={createPageUrl("Dashboard")}>
                      <Search className="w-4 h-4 mr-2" />
                      View Discoveries
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to={createPageUrl("Experts")}>
                      <Users className="w-4 h-4 mr-2" />
                      Browse Experts
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'} mb-3`}>
            Archaeological Analysis
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-stone-600'} max-w-2xl mx-auto`}>
            Upload a photo of your archaeological finding for AI-powered identification and analysis
          </p>
        </motion.div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Ban className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {!isLoadingSettings && discoverySettings?.announcement_active && discoverySettings?.announcement_text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {discoverySettings.announcement_text}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {isUploadingPhoto && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Uploading photo...</span>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="space-y-6">
          {currentStep === "upload" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
                  <CardHeader className="pb-4">
                    <CardTitle className={`flex items-center gap-3 text-xl ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                      <Camera className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
                      Capture or Upload Photo
                    </CardTitle>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-600'} mt-2`}>
                      <Shield className="w-4 h-4 inline mr-1 text-green-500" />
                      AI-generated images are automatically detected and blocked
                    </p>
                  </CardHeader>
                <CardContent>
                  <PhotoUpload onPhotoCapture={handlePhotoCapture} photo={photo} isProcessing={isUploadingPhoto} />
                </CardContent>
              </Card>

              {photo && photoUrl && !isUploadingPhoto && (
                <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
                      <CardHeader className="pb-4">
                        <CardTitle className={`flex items-center gap-3 text-xl ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                          <MapPin className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
                          Additional Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="location" className={`${isDarkMode ? 'text-slate-300' : 'text-stone-700'} font-medium`}>
                              Discovery Location <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Where did you find this item? (GPS coordinates, site name, etc.)"
                                className={`flex-1 ${isDarkMode ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500' : 'border-stone-200 focus:border-amber-400 focus:ring-amber-400'}`}
                              />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                            className={`${isDarkMode ? 'border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white' : 'border-stone-200 hover:bg-stone-50'}`}
                          >
                            {isGettingLocation ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Navigation className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {latitude && longitude ? (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ GPS coordinates captured: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠️ GPS location required - click the location button to capture coordinates
                          </p>
                        )}
                      </div>

                    <div>
                      <Label htmlFor="notes" className={`${isDarkMode ? 'text-slate-300' : 'text-stone-700'} font-medium`}>
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Any additional context, observations, or details about the discovery..."
                        className={`mt-1 ${isDarkMode ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500' : 'border-stone-200 focus:border-amber-400 focus:ring-amber-400'}`}
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={analyzePhoto}
                      disabled={isAnalyzing || !latitude || !longitude}
                      className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500' : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'} text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50`}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Starting Analysis...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Analyze Discovery
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {currentStep === "analyzing" && (
            <AnalysisProgress />
          )}

          {currentStep === "results" && analysisResults && (
            <AnalysisResults
              results={analysisResults}
              onStartNew={startNewAnalysis}
            />
          )}
        </div>
      </div>
    </div>
  );
}