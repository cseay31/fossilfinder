import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, Target, X, ChevronLeft, ChevronRight, Navigation, Save, CheckCircle, ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MultiScanPage({ isDarkMode }) {
  const [images, setImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(0);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hoveredPoi, setHoveredPoi] = useState(null);
  const fileInputRef = useRef(null);
  const [appSettings, setAppSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    checkSettings();
  }, []);

  const checkSettings = async () => {
    try {
      const settings = await base44.entities.AppSettings.list();
      if (settings.length > 0) {
        setAppSettings(settings[0]);
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

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    const newImages = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview, id: Date.now() + Math.random() });
      }
    }
    setImages(prev => [...prev, ...newImages]);
    setError("");
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const analyzeImages = async () => {
    if (images.length === 0) {
      setError("Please add at least one image to scan.");
      return;
    }

    if (!latitude || !longitude) {
      setError("Location is required. Please capture your GPS coordinates.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    const analysisResults = [];

    try {
      for (const image of images) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: image.file });

        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert paleontologist analyzing a rock photograph to identify potential fossils or interesting geological features.

CRITICAL RULES:
1. ONLY mark areas that have VISIBLE features - textures, patterns, shapes, or anomalies
2. NEVER mark blank, smooth, uniform, or featureless areas of rock
3. NEVER mark empty background, sky, shadows, or areas outside the rock
4. Each point MUST have a specific visible feature you can describe
5. Position circles PRECISELY on the feature, not vaguely in general areas

What to look for (must be VISIBLE in the image):
- Fossils: shells, bones, teeth, plant impressions, tracks, coral, crinoids, ammonites
- Textures: ridges, grooves, bumps, nodules, depressions, holes
- Patterns: circular/spiral shapes, linear features, layered/striated areas
- Anomalies: color variations, crystalline structures, anything distinctly different from surrounding rock

For EACH point of interest you identify:
1. center_x, center_y: EXACT center of the visible feature (as percentage 0-100 of image dimensions)
2. radius: Size to encompass JUST the feature (percentage, typically 3-12, sized to match the actual feature)
3. label: Specific identification (e.g., "Possible brachiopod shell", "Linear ridge - potential crinoid stem")
4. confidence: low/medium/high based on how clearly fossil-like the feature appears
5. explanation: Describe what SPECIFIC visual feature you see

Quality over quantity - only mark genuine points of interest. If the rock appears completely featureless, it's okay to find 0-1 points. A good scan might have 2-6 precise markers on actual features.`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              points_of_interest: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    center_x: { type: "number", description: "Center X position as percentage (0-100)" },
                    center_y: { type: "number", description: "Center Y position as percentage (0-100)" },
                    radius: { type: "number", description: "Circle radius as percentage (5-15 typical)" },
                    label: { type: "string" },
                    confidence: { type: "string", enum: ["low", "medium", "high"] },
                    explanation: { type: "string" }
                  }
                }
              },
              overall_assessment: { type: "string" },
              fossil_likelihood: { type: "string", enum: ["unlikely", "possible", "likely", "highly_likely"] }
            }
          }
        });

        analysisResults.push({
          id: image.id,
          preview: image.preview,
          file_url,
          ...analysis
        });
      }

      setResults(analysisResults);
      setSelectedResult(0);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze images. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAsDiscovery = async () => {
    if (results.length === 0) return;
    
    setIsSaving(true);
    try {
      for (const result of results) {
        await base44.entities.Discovery.create({
          photo_url: result.file_url,
          location: location,
          latitude: latitude,
          longitude: longitude,
          analysis_status: "completed",
          classification: `Multi-Scan: ${result.points_of_interest?.length || 0} points of interest`,
          description: result.overall_assessment,
          significance_level: result.fossil_likelihood === 'highly_likely' ? 'high' : 
                             result.fossil_likelihood === 'likely' ? 'medium' : 'low',
          confidence_score: result.fossil_likelihood === 'highly_likely' ? 85 : 
                           result.fossil_likelihood === 'likely' ? 65 : 
                           result.fossil_likelihood === 'possible' ? 45 : 25,
          scan_results: JSON.stringify(result.points_of_interest || [])
        });
      }
      setSaved(true);
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save discoveries.");
    } finally {
      setIsSaving(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.3)' };
      case 'medium': return { border: '#eab308', bg: 'rgba(234, 179, 8, 0.3)' };
      case 'low': return { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.3)' };
      default: return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.3)' };
    }
  };

  const getLikelihoodBadge = (likelihood) => {
    const styles = {
      highly_likely: 'bg-green-100 text-green-800 border-green-300',
      likely: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      possible: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      unlikely: 'bg-slate-100 text-slate-600 border-slate-300'
    };
    return styles[likelihood] || styles.unlikely;
  };

  const reset = () => {
    setImages([]);
    setResults([]);
    setSelectedResult(0);
    setError("");
    setSaved(false);
  };

  // Results view
  if (results.length > 0) {
    const current = results[selectedResult];
    
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8`}>
        <div className="max-w-5xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-3xl font-bold text-stone-800">Scan Results</h1>
            <p className="text-stone-600">Review highlighted points of interest</p>
          </motion.div>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-amber-600" />
                  Image {selectedResult + 1} of {results.length}
                </CardTitle>
                <div className="flex gap-2">
                  {!saved ? (
                    <Button onClick={saveAsDiscovery} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save All as Discoveries
                    </Button>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" /> Saved!
                    </Badge>
                  )}
                  <Button variant="outline" onClick={reset}>
                    <X className="w-4 h-4 mr-2" /> New Scan
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Navigation */}
              {results.length > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedResult(prev => Math.max(0, prev - 1))} disabled={selectedResult === 0}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    {results.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedResult(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === selectedResult ? 'bg-amber-600 w-4' : 'bg-stone-300'}`}
                      />
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedResult(prev => Math.min(results.length - 1, prev + 1))} disabled={selectedResult === results.length - 1}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Image with overlay */}
              <div className="relative rounded-xl overflow-hidden bg-stone-900 flex items-center justify-center">
                <div className="relative inline-block">
                  <img src={current.preview} alt="Scanned rock" className="max-w-full h-auto max-h-[500px] block" />
                  
                  {/* Overlay for highlights - positioned relative to the image */}
                  <div className="absolute inset-0">
                    {current.points_of_interest?.map((poi, idx) => {
                      const colors = getConfidenceColor(poi.confidence);
                      const isHovered = hoveredPoi === idx;
                      const size = (poi.radius || 8) * 2;
                      return (
                        <div
                          key={idx}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{
                            left: `${poi.center_x}%`,
                            top: `${poi.center_y}%`,
                          }}
                        >
                          {/* Circle marker */}
                          <div
                            className="rounded-full border-2 transition-all duration-200"
                            style={{
                              width: `${size}vmin`,
                              height: `${size}vmin`,
                              maxWidth: `${size * 3}px`,
                              maxHeight: `${size * 3}px`,
                              minWidth: '24px',
                              minHeight: '24px',
                              borderColor: colors.border,
                              backgroundColor: isHovered ? colors.bg : 'transparent',
                              borderStyle: isHovered ? 'solid' : 'dashed',
                            }}
                          />
                          {/* Number label */}
                          <div
                            className="absolute left-1/2 transform -translate-x-1/2 text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{
                              bottom: '100%',
                              marginBottom: '4px',
                              color: colors.border,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                            }}
                          >
                            {idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Likelihood & Assessment */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-stone-700">Fossil Likelihood:</span>
                <Badge className={getLikelihoodBadge(current.fossil_likelihood)}>
                  {current.fossil_likelihood?.replace('_', ' ')}
                </Badge>
              </div>

              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-700 text-sm">{current.overall_assessment}</p>
              </div>

              {/* Points of Interest List */}
              {current.points_of_interest?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-stone-800">Points of Interest ({current.points_of_interest.length})</h4>
                  <div className="grid gap-2">
                    {current.points_of_interest.map((poi, idx) => {
                      const colors = getConfidenceColor(poi.confidence);
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
                          style={{ borderLeftColor: colors.border }}
                          onMouseEnter={() => setHoveredPoi(idx)}
                          onMouseLeave={() => setHoveredPoi(null)}
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: colors.border }}>
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-stone-800">{poi.label}</span>
                              <Badge variant="outline" className="text-xs" style={{ borderColor: colors.border, color: colors.border }}>
                                {poi.confidence}
                              </Badge>
                            </div>
                            <p className="text-sm text-stone-600 mt-1">{poi.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!current.points_of_interest || current.points_of_interest.length === 0) && (
                <Alert className="border-stone-200 bg-stone-50">
                  <AlertDescription>No specific points of interest identified in this image.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if multi-scan is disabled
  if (!isLoadingSettings && appSettings && !appSettings.multi_scan_enabled) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8 flex items-center justify-center`}>
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80'} backdrop-blur-xl shadow-lg max-w-md text-center p-8`}>
          <ScanLine className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2`}>Multi-Scan Unavailable</h2>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>The multi-scan feature has been temporarily disabled by an administrator.</p>
        </Card>
      </div>
    );
  }

  // Upload view
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'} mb-2`}>Multi-Rock Scanner</h1>
          <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>Upload photos of rocks and AI will highlight potential fossils</p>
        </motion.div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
              <Camera className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
              Upload Rock Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />

            {images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img src={img.preview} alt="Rock" className="w-full h-full object-cover rounded-lg" />
                    <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all">
              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-stone-600 font-medium">Click to add photos</p>
              <p className="text-sm text-stone-500">Multiple images supported</p>
            </div>

            {/* Location */}
            <div>
              <Label className="text-stone-700 font-medium">Location <span className="text-red-500">*</span></Label>
              <div className="flex gap-2 mt-1">
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="GPS coordinates" className="flex-1" />
                <Button type="button" variant="outline" onClick={getCurrentLocation} disabled={isGettingLocation}>
                  {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                </Button>
              </div>
              {latitude && longitude ? (
                <p className="text-xs text-green-600 mt-1">✓ GPS captured: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
              ) : (
                <p className="text-xs text-amber-600 mt-1">⚠️ GPS location required</p>
              )}
            </div>

            <Button onClick={analyzeImages} disabled={images.length === 0 || isAnalyzing || !latitude || !longitude} className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800">
              {isAnalyzing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Scanning...</>
              ) : (
                <><Target className="w-5 h-5 mr-2" /> Scan {images.length} {images.length === 1 ? 'Image' : 'Images'}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}