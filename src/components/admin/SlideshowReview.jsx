import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  ChevronLeft, ChevronRight, Check, X, Star, Loader2, MapPin, Calendar, 
  Target, Award, Heart, MessageCircle, User, Eye, Keyboard, Zap, Globe,
  ArrowUp, ArrowDown, SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function SlideshowReview({ discoveries, onClose, onUpdate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewed, setReviewed] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [editedDiscovery, setEditedDiscovery] = useState(null);
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'all', 'featured', 'staff'
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const getFilteredDiscoveries = useCallback(() => {
    switch (viewMode) {
      case 'pending':
        return discoveries.filter(d => 
          !d.is_featured && !d.is_staff_pick && d.analysis_status === 'completed'
        );
      case 'featured':
        return discoveries.filter(d => d.is_featured);
      case 'staff':
        return discoveries.filter(d => d.is_staff_pick);
      default:
        return discoveries.filter(d => d.analysis_status === 'completed');
    }
  }, [discoveries, viewMode]);

  const filteredDiscoveries = getFilteredDiscoveries();

  useEffect(() => {
    if (filteredDiscoveries[currentIndex]) {
      setEditedDiscovery({ ...filteredDiscoveries[currentIndex] });
    }
  }, [currentIndex, filteredDiscoveries]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'f':
          e.preventDefault();
          toggleFeatured();
          break;
        case 's':
          e.preventDefault();
          toggleStaffPick();
          break;
        case 'Enter':
          e.preventDefault();
          handleSave();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case '1':
          setEditedDiscovery(prev => prev ? { ...prev, significance_level: 'low' } : prev);
          break;
        case '2':
          setEditedDiscovery(prev => prev ? { ...prev, significance_level: 'medium' } : prev);
          break;
        case '3':
          setEditedDiscovery(prev => prev ? { ...prev, significance_level: 'high' } : prev);
          break;
        case '4':
          setEditedDiscovery(prev => prev ? { ...prev, significance_level: 'exceptional' } : prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, editedDiscovery]);

  const current = filteredDiscoveries[currentIndex];

  const goToNext = () => {
    if (currentIndex < filteredDiscoveries.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleFeatured = () => {
    setEditedDiscovery(prev => prev ? { ...prev, is_featured: !prev.is_featured } : prev);
  };

  const toggleStaffPick = () => {
    setEditedDiscovery(prev => prev ? { ...prev, is_staff_pick: !prev.is_staff_pick } : prev);
  };

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
      goToNext();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getSignificanceColor = (level) => ({
    exceptional: 'bg-purple-500 text-white',
    high: 'bg-red-500 text-white',
    medium: 'bg-amber-500 text-white',
    low: 'bg-slate-500 text-white'
  })[level] || 'bg-slate-600 text-white';

  const scanResults = current?.scan_results ? JSON.parse(current.scan_results) : null;

  if (filteredDiscoveries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
      >
        <Card className="max-w-md w-full bg-slate-900 border-slate-700">
          <CardContent className="p-8 text-center">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">All Caught Up!</h2>
            <p className="text-slate-400 mb-4">No discoveries in this category need review.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setViewMode('all')}>View All</Button>
              <Button onClick={onClose}>Close</Button>
            </div>
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
      className="fixed inset-0 bg-black/95 flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {['pending', 'all', 'featured', 'staff'].map(mode => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? 'default' : 'ghost'}
                onClick={() => { setViewMode(mode); setCurrentIndex(0); }}
                className={viewMode === mode ? 'bg-purple-600' : 'text-slate-400 hover:text-white'}
              >
                {mode === 'pending' && 'Pending'}
                {mode === 'all' && 'All'}
                {mode === 'featured' && <><Star className="w-3 h-3 mr-1" /> Featured</>}
                {mode === 'staff' && <><Award className="w-3 h-3 mr-1" /> Staff</>}
              </Button>
            ))}
          </div>
          <Badge className="bg-slate-800 text-slate-300">
            {currentIndex + 1} / {filteredDiscoveries.length}
          </Badge>
          <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
            {reviewed.size} saved
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="text-slate-400"
          >
            <Keyboard className="w-4 h-4 mr-1" /> Shortcuts
          </Button>
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Keyboard Help */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900/80 border-b border-slate-800 px-6 py-3"
          >
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">→</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded">F</kbd> Toggle Featured</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded">S</kbd> Toggle Staff Pick</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded">1-4</kbd> Set Significance</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded">Enter</kbd> Save & Next</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded">Esc</kbd> Close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Image Section */}
        <div className="flex-1 relative flex items-center justify-center bg-black p-4">
          <motion.img
            key={current.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={current.photo_url}
            alt="Discovery"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full"
            onClick={goToPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full"
            onClick={goToNext}
            disabled={currentIndex === filteredDiscoveries.length - 1}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Image Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {editedDiscovery.is_featured && (
              <Badge className="bg-amber-500 text-white"><Star className="w-3 h-3 mr-1" /> Featured</Badge>
            )}
            {editedDiscovery.is_staff_pick && (
              <Badge className="bg-purple-500 text-white"><Award className="w-3 h-3 mr-1" /> Staff Pick</Badge>
            )}
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 flex gap-3 text-white/70 text-sm">
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {current.likes || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {current.comment_count || 0}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {current.visibility}</span>
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
          <div className="p-6 space-y-5 flex-1">
            {/* Discovery Info */}
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                {current.classification || "Unclassified"}
              </h2>
              <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                {current.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {current.location}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(current.created_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                <User className="w-4 h-4" />
                <span>{current.owner_name || current.created_by}</span>
              </div>
            </div>

            {current.description && (
              <p className="text-sm text-slate-400 line-clamp-3">{current.description}</p>
            )}

            {/* Significance */}
            <div>
              <Label className="text-slate-400 text-sm mb-3 block">Significance Level</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { level: 'low', label: 'Low', key: '1' },
                  { level: 'medium', label: 'Med', key: '2' },
                  { level: 'high', label: 'High', key: '3' },
                  { level: 'exceptional', label: 'Epic', key: '4' }
                ].map(({ level, label, key }) => (
                  <Button
                    key={level}
                    size="sm"
                    onClick={() => setEditedDiscovery(prev => ({ ...prev, significance_level: level }))}
                    className={`relative ${editedDiscovery.significance_level === level ? getSignificanceColor(level) : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {label}
                    <span className="absolute -top-1 -right-1 text-[10px] bg-slate-700 px-1 rounded">{key}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <Label className="text-white">Featured <kbd className="text-xs bg-slate-700 px-1 rounded ml-1">F</kbd></Label>
                </div>
                <Switch
                  checked={editedDiscovery.is_featured || false}
                  onCheckedChange={(checked) => setEditedDiscovery(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <Label className="text-white">Staff Pick <kbd className="text-xs bg-slate-700 px-1 rounded ml-1">S</kbd></Label>
                </div>
                <Switch
                  checked={editedDiscovery.is_staff_pick || false}
                  onCheckedChange={(checked) => setEditedDiscovery(prev => ({ ...prev, is_staff_pick: checked }))}
                />
              </div>
            </div>

            {/* Expert Notes */}
            <div>
              <Label className="text-slate-400 text-sm mb-2 block">Expert Notes</Label>
              <Textarea
                value={editedDiscovery.expert_notes || ''}
                onChange={(e) => setEditedDiscovery(prev => ({ ...prev, expert_notes: e.target.value }))}
                placeholder="Add your assessment..."
                rows={3}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save & Continue <kbd className="ml-2 text-xs bg-green-700 px-1 rounded">Enter</kbd>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300"
                onClick={goToPrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300"
                onClick={goToNext}
                disabled={currentIndex === filteredDiscoveries.length - 1}
              >
                Skip <SkipForward className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Progress */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(((currentIndex + 1) / filteredDiscoveries.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / filteredDiscoveries.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="h-20 bg-slate-900 border-t border-slate-800 px-4 flex items-center gap-2 overflow-x-auto">
        {filteredDiscoveries.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setCurrentIndex(i)}
            className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all ${
              i === currentIndex 
                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' 
                : reviewed.has(d.id) 
                  ? 'opacity-50' 
                  : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img src={d.photo_url} alt="" className="w-full h-full object-cover" />
            {reviewed.has(d.id) && (
              <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}