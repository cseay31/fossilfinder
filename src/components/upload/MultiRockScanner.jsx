import React, { useState, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Loader2, Target, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MultiRockScanner({ onAnalysisComplete }) {
  const [images, setImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

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

    setIsAnalyzing(true);
    setError("");
    const analysisResults = [];

    try {
      for (const image of images) {
        // Upload the image
        const { file_url } = await base44.integrations.Core.UploadFile({ file: image.file });

        // Analyze for fossils/points of interest
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
1. A bounding box (x, y, width, height as percentages 0-100 of the image)
2. A label with what it MIGHT be (be speculative, suggest possibilities)
3. Confidence level (low, medium, high)
4. A brief explanation encouraging the user to examine it closer

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
                    x: { type: "number", description: "X position as percentage (0-100)" },
                    y: { type: "number", description: "Y position as percentage (0-100)" },
                    width: { type: "number", description: "Width as percentage (0-100)" },
                    height: { type: "number", description: "Height as percentage (0-100)" },
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
      if (analysisResults.length > 0) {
        setSelectedResult(0);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze images. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'border-green-500 bg-green-500/20';
      case 'medium': return 'border-yellow-500 bg-yellow-500/20';
      case 'low': return 'border-red-500 bg-red-500/20';
      default: return 'border-blue-500 bg-blue-500/20';
    }
  };

  const getLikelihoodColor = (likelihood) => {
    switch (likelihood) {
      case 'highly_likely': return 'bg-green-100 text-green-800';
      case 'likely': return 'bg-emerald-100 text-emerald-800';
      case 'possible': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const reset = () => {
    setImages([]);
    setResults([]);
    setSelectedResult(null);
    setError("");
  };

  // Results view
  if (results.length > 0) {
    const current = results[selectedResult];
    
    return (
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl text-stone-800">
                <Target className="w-6 h-6 text-amber-600" />
                Scan Results
              </CardTitle>
              <Button variant="outline" onClick={reset}>
                <X className="w-4 h-4 mr-2" />
                New Scan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image navigation */}
            {results.length > 1 && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedResult(prev => Math.max(0, prev - 1))}
                  disabled={selectedResult === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-stone-600">
                  Image {selectedResult + 1} of {results.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedResult(prev => Math.min(results.length - 1, prev + 1))}
                  disabled={selectedResult === results.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Image with highlights */}
            <div className="relative rounded-xl overflow-hidden bg-stone-100">
              <img
                src={current.preview}
                alt="Scanned rock"
                className="w-full h-auto max-h-[500px] object-contain"
              />
              
              {/* Highlight boxes */}
              {current.points_of_interest?.map((poi, idx) => (
                <div
                  key={idx}
                  className={`absolute border-2 rounded ${getConfidenceColor(poi.confidence)} transition-all cursor-pointer hover:scale-105`}
                  style={{
                    left: `${poi.x}%`,
                    top: `${poi.y}%`,
                    width: `${poi.width}%`,
                    height: `${poi.height}%`,
                  }}
                  title={poi.label}
                >
                  <div className="absolute -top-6 left-0 bg-white/90 px-2 py-0.5 rounded text-xs font-medium shadow whitespace-nowrap">
                    {idx + 1}. {poi.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Fossil likelihood badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-stone-700">Fossil Likelihood:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLikelihoodColor(current.fossil_likelihood)}`}>
                {current.fossil_likelihood?.replace('_', ' ')}
              </span>
            </div>

            {/* Overall assessment */}
            <div className="bg-stone-50 rounded-lg p-4">
              <h4 className="font-medium text-stone-800 mb-2">Overall Assessment</h4>
              <p className="text-stone-600 text-sm">{current.overall_assessment}</p>
            </div>

            {/* Points of interest details */}
            {current.points_of_interest?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-stone-800">Points of Interest ({current.points_of_interest.length})</h4>
                {current.points_of_interest.map((poi, idx) => (
                  <div key={idx} className={`border-l-4 ${poi.confidence === 'high' ? 'border-green-500' : poi.confidence === 'medium' ? 'border-yellow-500' : 'border-red-500'} bg-white rounded-lg p-3 shadow-sm`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-stone-800">{idx + 1}. {poi.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${poi.confidence === 'high' ? 'bg-green-100 text-green-700' : poi.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {poi.confidence} confidence
                      </span>
                    </div>
                    <p className="text-sm text-stone-600">{poi.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {current.points_of_interest?.length === 0 && (
              <Alert className="border-stone-200 bg-stone-50">
                <AlertDescription className="text-stone-600">
                  No specific points of interest were identified in this image.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-stone-800">
            <ZoomIn className="w-6 h-6 text-amber-600" />
            Multi-Rock Fossil Scanner
          </CardTitle>
          <p className="text-sm text-stone-600 mt-2">
            Upload photos of rocks and the AI will scan for potential fossils and highlight points of interest
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Image previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.preview}
                    alt="Rock to scan"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all"
          >
            <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">Click to add rock photos</p>
            <p className="text-sm text-stone-500 mt-1">Support for multiple images</p>
          </div>

          {/* Analyze button */}
          <Button
            onClick={analyzeImages}
            disabled={images.length === 0 || isAnalyzing}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Scanning for fossils...
              </>
            ) : (
              <>
                <Target className="w-5 h-5 mr-2" />
                Scan {images.length} {images.length === 1 ? 'Image' : 'Images'} for Fossils
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}