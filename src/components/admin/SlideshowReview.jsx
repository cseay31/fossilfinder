import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Check, X, Star, Loader2, MapPin, Calendar, Target, Award } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function SlideshowReview({ discoveries, onClose, onUpdate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewed, setReviewed] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [editedDiscovery, setEditedDiscovery] = useState(null);

  const pendingDiscoveries = discoveries.filter(d => 
    d.significance_level === 'low' || d.significance_level === 'medium' || !d.significance_level
  );

  useEffect(() => {
    if (pendingDiscoveries[currentIndex]) {
      setEditedDiscovery({ ...pendingDiscoveries[currentIndex] });
    }
  }, [currentIndex, discoveries]);

  const current = pendingDiscoveries[currentIndex];

  const handleSave = async () => {
    if (!editedDiscovery) return;
    
    setIsSaving(true);
    try {
      await base44.entities.Discovery.update(editedDiscovery.id, {
        significance_level: editedDiscovery.significance_level,
        expert_notes: editedDiscovery.expert_notes,
        is_staff_pick: editedDiscovery.is_staff_pick || false,
        is_featured: editedDiscovery.is_featured || false
      });
      setReviewed(prev => new Set([...prev, editedDiscovery.id]));
      onUpdate();
      
      // Auto-advance to next
      if (currentIndex < pendingDiscoveries.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < pendingDiscoveries.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const getSignificanceColor = (level) => {
    const colors = {
      exceptional: 'bg-purple-100 text-purple-800 border-purple-300',
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-amber-100 text-amber-800 border-amber-300',
      low: 'bg-slate-100 text-slate-600 border-slate-300'
    };
    return colors[level] || colors.medium;
  };

  // Parse scan results if available
  const scanResults = current?.scan_results ? JSON.parse(current.scan_results) : null;

  if (pendingDiscoveries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">All Caught Up!</h2>
            <p className="text-slate-600 mb-4">No more discoveries need review.</p>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!current || !editedDiscovery) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
    >
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              {currentIndex + 1} / {pendingDiscoveries.length}
            </Badge>
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
              {reviewed.size} reviewed
            </Badge>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image */}
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={current.photo_url}
                alt="Discovery"
                className="w-full h-full object-contain bg-black"
              />
              
              {/* Scan overlay if available */}
              {scanResults && scanResults.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {scanResults.map((poi, idx) => (
                    <g key={idx}>
                      <circle
                        cx={poi.center_x}
                        cy={poi.center_y}
                        r={poi.radius || 8}
                        fill="transparent"
                        stroke={poi.confidence === 'high' ? '#22c55e' : poi.confidence === 'medium' ? '#eab308' : '#ef4444'}
                        strokeWidth="0.5"
                        strokeDasharray="2,1"
                      />
                      <text x={poi.center_x} y={poi.center_y - (poi.radius || 8) - 2} textAnchor="middle" fill="#fff" fontSize="3" fontWeight="bold">
                        {idx + 1}
                      </text>
                    </g>
                  ))}
                </svg>
              )}

              {current.classification?.startsWith('Multi-Scan') && (
                <Badge className="absolute top-3 left-3 bg-blue-500">
                  <Target className="w-3 h-3 mr-1" /> Multi-Scan
                </Badge>
              )}
            </div>
          </Card>

          {/* Details & Edit */}
          <Card className="bg-white">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  {current.classification || "Unclassified Discovery"}
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {current.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {current.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {format(new Date(current.created_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {current.description && (
                <p className="text-slate-600 text-sm">{current.description}</p>
              )}

              {/* Scan Results Summary */}
              {scanResults && scanResults.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> {scanResults.length} Points of Interest
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scanResults.map((poi, idx) => (
                      <p key={idx} className="text-xs text-blue-700">
                        {idx + 1}. {poi.label} ({poi.confidence})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Significance */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Significance Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'exceptional'].map(level => (
                    <Button
                      key={level}
                      variant={editedDiscovery.significance_level === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEditedDiscovery(prev => ({ ...prev, significance_level: level }))}
                      className={editedDiscovery.significance_level === level ? 
                        (level === 'exceptional' ? 'bg-purple-600' : level === 'high' ? 'bg-red-600' : level === 'medium' ? 'bg-amber-600' : 'bg-slate-600')
                        : ''
                      }
                    >
                      {level === 'exceptional' && <Star className="w-3 h-3 mr-1" />}
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Expert Notes */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Expert Notes</label>
                <Textarea
                  value={editedDiscovery.expert_notes || ''}
                  onChange={(e) => setEditedDiscovery(prev => ({ ...prev, expert_notes: e.target.value }))}
                  placeholder="Add your expert assessment..."
                  rows={3}
                />
              </div>

              {/* Staff Pick & Featured Toggles */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-slate-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" /> Community Showcase
                </h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="staff-pick" className="text-sm text-slate-600 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" /> Staff Shoutout
                  </Label>
                  <Switch
                    id="staff-pick"
                    checked={editedDiscovery.is_staff_pick || false}
                    onCheckedChange={(checked) => setEditedDiscovery(prev => ({ ...prev, is_staff_pick: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm text-slate-600 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> Featured Discovery
                  </Label>
                  <Switch
                    id="featured"
                    checked={editedDiscovery.is_featured || false}
                    onCheckedChange={(checked) => setEditedDiscovery(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={currentIndex === pendingDiscoveries.length - 1}
                >
                  Skip
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                  Save & Next
                </Button>
              </div>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${((currentIndex + 1) / pendingDiscoveries.length) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}