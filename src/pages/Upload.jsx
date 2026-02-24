import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
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
import ShellLoader from "../components/admin/ShellLoader";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { trackAction } from "../components/tracking/ActivityTracker";

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
  const [appSettings, setAppSettings] = useState(null);
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await base44.entities.AppSettings.list();
      if (data.length > 0) {
        setAppSettings(data[0]);
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
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
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

    if (appSettings?.require_location !== false && (!latitude || !longitude)) {
      setError("Location is required. Please use the GPS button to capture your current location.");
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep("analyzing");
    setError("");

    await trackAction("Started analyzing discovery");

    try {
      // Step 1: AI Detection Check with internet search for verification
      const aiDetectionResult = await base44.integrations.Core.InvokeLLM({
        prompt: `CRITICAL ANALYSIS REQUIRED: You are a forensic image analyst protecting archaeological research integrity.

Analyze this image to determine if it is:
1. A REAL photograph of a physical object/fossil/artifact
2. An AI-GENERATED or digitally created image
3. A screenshot of a digital render or 3D model

RED FLAGS for AI/fake images:
- Impossible or contradictory physics
- Unnatural textures or "too perfect" surfaces
- Inconsistent lighting/shadows
- Anatomical impossibilities
- Blurry or melted edges
- Signs of diffusion models (Stable Diffusion, Midjourney, DALL-E artifacts)
- Digital artifacts or rendering signs
- Lacks the grain, imperfections, or noise of real photography
- Object appears to be floating or defying gravity
- Unnatural color gradients or patterns

REAL photograph indicators:
- Natural camera grain/noise
- Consistent lighting from a single source
- Real-world imperfections and dirt
- Natural shadows and depth
- Camera metadata feel (focus, exposure)
- Physical plausibility

Rate confidence 0-100:
- 0-20: Definitely real photograph
- 21-50: Likely real, minor concerns
- 51-75: Suspicious, multiple AI indicators
- 76-100: Almost certainly AI-generated

BE STRICT. Archaeological research depends on authenticity.`,
        file_urls: [photoUrl],
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            is_ai_generated: { type: "boolean" },
            confidence_score: { type: "number", minimum: 0, maximum: 100 },
            explanation: { type: "string" },
            red_flags_found: { type: "array", items: { type: "string" } }
          },
          required: ["is_ai_generated", "confidence_score", "explanation"]
        }
      });

      // Handle AI detection result - reject if confidence >= 70%
      if (aiDetectionResult.is_ai_generated && aiDetectionResult.confidence_score >= 70) {
        const redFlags = aiDetectionResult.red_flags_found?.join(', ') || 'Multiple indicators detected';
        setError(`🚫 AI-Generated Image Detected (${aiDetectionResult.confidence_score}% confidence)\n\n${aiDetectionResult.explanation}\n\nRed flags: ${redFlags}\n\nPlease upload only real photographs of physical objects.`);
        setCurrentStep("upload");
        setIsAnalyzing(false);
        
        // Log the rejection
        try {
          await base44.entities.SecurityLog.create({
            event_type: 'suspicious_activity',
            user_email: (await base44.auth.me()).email,
            severity: 'medium',
            details: JSON.stringify({
              reason: 'AI-generated image rejected',
              confidence: aiDetectionResult.confidence_score,
              explanation: aiDetectionResult.explanation,
              red_flags: aiDetectionResult.red_flags_found
            })
          });
        } catch (logError) {
          console.error("Failed to log security event:", logError);
        }
        return;
      }
      
      // Log low-confidence detections for monitoring
      if (aiDetectionResult.confidence_score > 50) {
        try {
          await base44.entities.SecurityLog.create({
            event_type: 'suspicious_activity',
            user_email: (await base44.auth.me()).email,
            severity: 'low',
            details: JSON.stringify({
              reason: 'Suspicious image (allowed but flagged)',
              confidence: aiDetectionResult.confidence_score,
              explanation: aiDetectionResult.explanation
            })
          });
        } catch (logError) {
          console.error("Failed to log security event:", logError);
        }
      }

      // Step 2: Create discovery with location data
      // Get user info for owner_name
                  let ownerName = 'Explorer';
                  try {
                    const user = await base44.auth.me();
                    ownerName = user.full_name || 'Explorer';
                  } catch (e) {}

                  const discoveryData = {
                    photo_url: photoUrl,
                    location: location || "Unknown location",
                    latitude: latitude,
                    longitude: longitude,
                    analysis_status: "analyzing",
                    visibility: "public",
                    owner_name: ownerName,
                    likes: 0,
                    liked_by: [],
                    comment_count: 0
                  };

                  const discovery = await base44.entities.Discovery.create(discoveryData);

      // Step 3: Analyze the fossil with enhanced AI categorization
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
      5. Significance: Scientific importance of this finding (low/medium/high/exceptional)
      6. Recommendations: What should be done next with this discovery
      7. Worth Admin Review: true if exceptional, rare, or scientifically important; false for routine findings
      8. Category: One of: fossil, artifact, mineral, rock, plant_fossil, marine_fossil, vertebrate, invertebrate, trace_fossil, unknown
      9. Tags: 3-7 descriptive tags (e.g. ["Jurassic", "marine", "cephalopod", "well-preserved"])
      10. AI Summary: A single clear sentence summarizing the discovery for non-experts
      11. Common Name: The popular/common name if known (e.g. "Ammonite", "Arrowhead")
      12. Key Features: 3-5 specific visual features that identify this specimen
      13. Related Species: 2-4 related species or similar artifact types the user might research
      14. Research Suggestions: 2-3 suggested research topics or resource types as a JSON array of objects with "title" and "description" fields

      Be thorough and scientific. If uncertain, explain why and suggest alternative possibilities.
      `;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
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
            recommendations: { type: "string" },
            needs_admin_review: { type: "boolean" },
            category: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            ai_summary: { type: "string" },
            common_name: { type: "string" },
            key_features: { type: "array", items: { type: "string" } },
            related_species: { type: "array", items: { type: "string" } },
            research_suggestions: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } } }
          }
        }
      });

      const updatedDiscovery = await base44.entities.Discovery.update(discovery.id, {
        ...aiResponse,
        research_suggestions: aiResponse.research_suggestions ? JSON.stringify(aiResponse.research_suggestions) : null,
        analysis_status: "completed",
        location: discovery.location,
        latitude: discovery.latitude,
        longitude: discovery.longitude
      });

      // Update user stats and award points/badges
      try {
        const user = await base44.auth.me();

        // Calculate points for this discovery
        let pointsToAward = 20; // Base points for discovery
        if (aiResponse.significance_level === 'high') pointsToAward += 20;
        if (aiResponse.significance_level === 'exceptional') pointsToAward += 50;

        // Check for new badges
        const { checkBadgeEligibility, BADGES } = await import("../components/gamification/BadgeSystem");
        const [allDiscoveries, allComments] = await Promise.all([
          base44.entities.Discovery.list(),
          base44.entities.DiscoveryComment.list()
        ]);
        const userDiscoveries = allDiscoveries.filter(d => d.created_by === user.email);
        const newBadges = checkBadgeEligibility(user, userDiscoveries, allComments);

        // Calculate badge points
        let badgePoints = 0;
        newBadges.forEach(badgeId => {
          badgePoints += BADGES[badgeId]?.points || 0;
        });

        // Update user with new stats
        await base44.auth.updateMe({
          points: (user.points || 0) + pointsToAward + badgePoints,
          discovery_count: userDiscoveries.length,
          badges: [...new Set([...(user.badges || []), ...newBadges])] // Prevent duplicates
        });
      } catch (updateError) {
        console.error("Failed to update user stats:", updateError);
      }

      setAnalysisResults(updatedDiscovery);
      setCurrentStep("results");

      await trackAction("Completed discovery analysis");

      // Track fossil identification submission
      base44.analytics.track({
        eventName: "fossil_identification_submitted",
        properties: {
          significance_level: aiResponse.significance_level,
          confidence_score: aiResponse.confidence_score,
          has_location: Boolean(latitude && longitude)
        }
      });

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
  const isDiscoveryDisabled = appSettings && appSettings.discoveries_enabled === false;

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
    <div className={`min-h-screen pb-safe-bottom ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'} mb-3`}>
            Analyze Your Discovery
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

        {!isLoadingSettings && appSettings?.announcement_active && appSettings?.announcement_text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {appSettings.announcement_text}
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
                              Discovery Location {appSettings?.require_location !== false && <span className="text-red-500">*</span>}
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
                        ) : appSettings?.require_location !== false ? (
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠️ GPS location required - click the location button to capture coordinates
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-1">
                            GPS location optional - click the location button to capture coordinates
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
                      disabled={isAnalyzing || (appSettings?.require_location !== false && (!latitude || !longitude))}
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
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}