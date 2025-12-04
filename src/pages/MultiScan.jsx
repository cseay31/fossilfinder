import React, { useState, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, Target, X, ChevronLeft, ChevronRight, Navigation, Save, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MultiScanPage() {
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
          prompt: `You are a helpful paleontologist assistant analyzing a rock photograph. Your job is to help amateur fossil hunters find ANYTHING that could potentially be interesting.

Be VERY liberal and inclusive in what you highlight. Err heavily on the side of finding things - false positives are fine!

Look for and highlight ANY of these, even if you're not sure:
- Anything that could be a fossil (shells, bones, teeth, plant impressions, tracks, burrows, coral, crinoids, bryozoans, etc.)
- Circular or spiral patterns (could be ammonites, gastropods)
- Linear ridges or grooves (could be plant stems, bones, shells)
- Textured surfaces different from surrounding rock
- Color variations or staining patterns
- Bumps, nodules, or protrusions
- Depressions or holes
- Any geometric or organic-looking shapes
- Crystalline structures
- Layered or striated areas
- Anything that looks "out of place" in the rock

For EACH point of interest (aim to find at least 2-5 per image if possible):
1. A center point (center_x, center_y as percentages 0-100 of image dimensions)
2. A radius (as percentage, typically 5-15)
3. A label with what it MIGHT be (be speculative, suggest possibilities)
4. Confidence level (low, medium, high)
5. A brief explanation encouraging the user to examine it closer

Remember: It's much better to highlight something that turns out to be nothing than to miss a real fossil. Be generous with your findings!`,
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 p-4 md:p-8">
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

              {/* Image with SVG overlay */}
              <div className="relative rounded-xl overflow-hidden bg-stone-900">
                <div className="relative">
                  <img src={current.preview} alt="Scanned rock" className="w-full h-auto max-h-[500px] object-contain mx-auto block" />
                  
                  {/* SVG Overlay for highlights */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {current.points_of_interest?.map((poi, idx) => {
                      const colors = getConfidenceColor(poi.confidence);
                      const isHovered = hoveredPoi === idx;
                      return (
                        <g key={idx}>
                          <circle
                            cx={poi.center_x}
                            cy={poi.center_y}
                            r={poi.radius || 8}
                            fill={isHovered ? colors.bg : 'transparent'}
                            stroke={colors.border}
                            strokeWidth={isHovered ? "1" : "0.5"}
                            strokeDasharray={isHovered ? "0" : "2,1"}
                            className="transition-all duration-200"
                          />
                          <text
                            x={poi.center_x}
                            y={poi.center_y - (poi.radius || 8) - 2}
                            textAnchor="middle"
                            fill={colors.border}
                            fontSize="3"
                            fontWeight="bold"
                          >
                            {idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
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

  // Upload view
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-4xl font-bold text-stone-800 mb-2">Multi-Rock Scanner</h1>
          <p className="text-lg text-stone-600">Upload photos of rocks and AI will highlight potential fossils</p>
        </motion.div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
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