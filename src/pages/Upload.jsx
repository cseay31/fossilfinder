import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Loader2, CheckCircle, AlertCircle, Search, Users, Navigation, XCircle, Images } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhotoUpload from "../components/upload/PhotoUpload";
import AnalysisProgress from "../components/upload/AnalysisProgress";
import AnalysisResults from "../components/upload/AnalysisResults";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { trackAction } from "../components/tracking/ActivityTracker";

export default function UploadPage({ isDarkMode }) {
  const [currentStep, setCurrentStep] = useState("upload");
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const uploadedUrlsRef = React.useRef({});

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

  const handlePhotosChange = async (newPhotos) => {
    setError("");
    setPhotos(newPhotos);

    // Upload any new photos that haven't been uploaded yet
    const newlyAdded = newPhotos.filter(p => !uploadedUrlsRef.current[p.name + p.size]);
    if (newlyAdded.length === 0) {
      // Sync URLs to match current photos array
      setPhotoUrls(newPhotos.map(p => uploadedUrlsRef.current[p.name + p.size]).filter(Boolean));
      return;
    }

    setUploadingCount(prev => prev + newlyAdded.length);
    await Promise.all(newlyAdded.map(async (file) => {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrlsRef.current[file.name + file.size] = file_url;
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload one or more photos. Please try again.");
      }
    }));
    setUploadingCount(prev => prev - newlyAdded.length);

    setPhotoUrls(newPhotos.map(p => uploadedUrlsRef.current[p.name + p.size]).filter(Boolean));
  };

  const analyzePhoto = async () => {
    if (photoUrls.length === 0) {
      setError("Please upload at least one photo first.");
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
      // Step 1: Create discovery with location data
      // Get user info for owner_name
                  let ownerName = 'Explorer';
                  try {
                    const user = await base44.auth.me();
                    ownerName = user.full_name || 'Explorer';
                  } catch (e) {}

                  const discoveryData = {
                   photo_url: photoUrls[0],
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
        file_urls: photoUrls,
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
    setPhotos([]);
    setPhotoUrls([]);
    uploadedUrlsRef.current = {};
    setUploadingCount(0);
    setLocation("");
    setAdditionalNotes("");
    setAnalysisResults(null);
    setError("");
  };

  // Check if discoveries are disabled
  const isDiscoveryDisabled = appSettings && appSettings.discoveries_enabled === false;

  if (!isLoadingSettings && isDiscoveryDisabled) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-transparent' : 'bg-[#F2F2F7]'}`}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1C1C1E]'}`}>Uploads Paused</h2>
          <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-[#6C6C70]'}`}>
            New discovery uploads are temporarily disabled. Check back soon.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to={createPageUrl("Dashboard")}><Search className="w-4 h-4 mr-2" />Discoveries</Link>
            </Button>
            <Button asChild className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC] text-white">
              <Link to={createPageUrl("Experts")}><Users className="w-4 h-4 mr-2" />Experts</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const locationStatus = latitude && longitude ? 'captured' : appSettings?.require_location !== false ? 'required' : 'optional';

  return (
    <div className={`min-h-screen pb-safe-bottom ${isDarkMode ? 'bg-transparent' : 'bg-[#F2F2F7]'} p-4 md:p-8`}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-2">
          <h1 className={`text-[34px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1C1C1E]'}`}>
            Analyse Discovery
          </h1>
          <p className={`text-base mt-1 ${isDarkMode ? 'text-slate-400' : 'text-[#6C6C70]'}`}>
            Photo → AI identification in seconds
          </p>
        </motion.div>

        {/* Announcement */}
        <AnimatePresence>
          {!isLoadingSettings && appSettings?.announcement_active && appSettings?.announcement_text && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className={`rounded-2xl px-4 py-3 text-sm ${isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
                {appSettings.announcement_text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4">
              <div className={`rounded-2xl px-4 py-3 flex items-start gap-3 ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {currentStep === "upload" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

              {/* Photo Section */}
              <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900/60' : 'bg-white'} shadow-sm`}>
                <div className={`px-5 pt-5 pb-3 flex items-center gap-2 ${isDarkMode ? 'border-white/5' : 'border-stone-100'} border-b`}>
                   <Camera className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-[#007AFF]'}`} />
                   <span className={`font-semibold text-[17px] ${isDarkMode ? 'text-white' : 'text-[#1C1C1E]'}`}>Photos</span>
                   {uploadingCount > 0 && <><Loader2 className="w-4 h-4 animate-spin text-[#007AFF] ml-auto" /><span className="text-xs text-slate-400">Uploading…</span></>}
                 </div>
                 <div className="px-5 py-4">
                   <PhotoUpload onPhotosChange={handlePhotosChange} photos={photos} />
                 </div>
              </div>

              {/* Details Section — appears after photo is ready */}
              <AnimatePresence>
                {photos.length > 0 && photoUrls.length === photos.length && uploadingCount === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Location */}
                    <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900/60' : 'bg-white'} shadow-sm`}>
                      <div className={`px-5 pt-5 pb-3 flex items-center gap-2 border-b ${isDarkMode ? 'border-white/5' : 'border-stone-100'}`}>
                        <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-[#007AFF]'}`} />
                        <span className={`font-semibold text-[17px] ${isDarkMode ? 'text-white' : 'text-[#1C1C1E]'}`}>Location</span>
                        {appSettings?.require_location !== false && (
                          <span className="ml-auto text-xs text-red-400 font-medium">Required</span>
                        )}
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Site name or GPS coordinates"
                            className={`flex-1 rounded-xl h-11 ${isDarkMode ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500' : 'border-stone-200 bg-[#F2F2F7]'}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                            className={`rounded-xl h-11 w-11 p-0 flex-shrink-0 ${isDarkMode ? 'border-white/10 bg-slate-800/50 text-white' : 'border-stone-200 bg-[#F2F2F7]'} ${locationStatus === 'captured' ? 'text-green-500 border-green-200' : ''}`}
                          >
                            {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className={`text-xs ${locationStatus === 'captured' ? 'text-green-500' : locationStatus === 'required' ? 'text-amber-500' : 'text-slate-400'}`}>
                          {locationStatus === 'captured'
                            ? `GPS captured — ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                            : locationStatus === 'required'
                            ? 'Tap the navigation icon to capture GPS coordinates'
                            : 'GPS optional — tap the navigation icon to capture'}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900/60' : 'bg-white'} shadow-sm`}>
                      <div className={`px-5 pt-5 pb-3 border-b ${isDarkMode ? 'border-white/5' : 'border-stone-100'}`}>
                        <span className={`font-semibold text-[17px] ${isDarkMode ? 'text-white' : 'text-[#1C1C1E]'}`}>Notes</span>
                        <span className={`ml-2 text-sm ${isDarkMode ? 'text-slate-500' : 'text-[#AEAEB2]'}`}>Optional</span>
                      </div>
                      <div className="px-5 py-4">
                        <Textarea
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Observations, surrounding geology, associated finds…"
                          className={`rounded-xl resize-none ${isDarkMode ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500' : 'border-stone-200 bg-[#F2F2F7]'}`}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={analyzePhoto}
                      disabled={isAnalyzing || uploadingCount > 0 || (appSettings?.require_location !== false && (!latitude || !longitude))}
                      className={`w-full h-14 rounded-2xl text-[17px] font-semibold transition-all duration-200 disabled:opacity-40 ${
                        isDarkMode
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                          : 'bg-[#007AFF] hover:bg-[#0066CC] text-white'
                      }`}
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Starting…</>
                      ) : (
                        <><CheckCircle className="w-5 h-5 mr-2" />Analyse Discovery</>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentStep === "analyzing" && <AnalysisProgress />}

          {currentStep === "results" && analysisResults && (
            <AnalysisResults results={analysisResults} onStartNew={startNewAnalysis} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </div>
  );
}