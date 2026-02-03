import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, TrendingUp, Loader2, Heart, MessageCircle, Share2, Globe, Lock, Users } from 'lucide-react';
import { format } from "date-fns";
import ShareDiscoveryModal from "../discovery/ShareDiscoveryModal";

export default function DiscoveryCard({ discovery, index, currentUser, onUpdate }) {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const [localDiscovery, setLocalDiscovery] = useState(discovery);

  const hasLiked = (localDiscovery.liked_by || []).includes(currentUser?.email);
  const isOwner = localDiscovery.created_by === currentUser?.email;

  const handleLike = async (e) => {
    e.stopPropagation();
    const likedBy = localDiscovery.liked_by || [];
    const newLikedBy = hasLiked 
      ? likedBy.filter(e => e !== currentUser?.email)
      : [...likedBy, currentUser?.email];
    
    setLocalDiscovery({
      ...localDiscovery,
      liked_by: newLikedBy,
      likes: newLikedBy.length
    });

    try {
      const { base44 } = await import("@/api/base44Client");
      await base44.entities.Discovery.update(localDiscovery.id, {
        liked_by: newLikedBy,
        likes: newLikedBy.length
      });
      if (onUpdate) onUpdate({ ...localDiscovery, liked_by: newLikedBy, likes: newLikedBy.length });
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const getVisibilityIcon = () => {
    switch (localDiscovery.visibility) {
      case 'private': return <Lock className="w-3 h-3" />;
      case 'shared': return <Users className="w-3 h-3" />;
      default: return <Globe className="w-3 h-3" />;
    }
  };
  const getConfidenceColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      analyzing: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      sent_to_expert: "bg-purple-100 text-purple-800 border-purple-200",
      verified: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return colors[status] || colors.analyzing;
  };

  const getSignificanceColor = (level) => {
    const colors = {
      exceptional: "bg-purple-100 text-purple-800 border-purple-200",
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[level] || colors.medium;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => navigate(createPageUrl(`DiscoveryDetail?id=${localDiscovery.id}`))}
        className="cursor-pointer"
      >
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-200 overflow-hidden group">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={localDiscovery.photo_url}
              alt={localDiscovery.classification || "Archaeological discovery"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge className={getStatusColor(localDiscovery.analysis_status)}>
                {localDiscovery.analysis_status === 'analyzing' && (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                )}
                {localDiscovery.analysis_status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            {/* Visibility indicator */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/80 text-stone-700">
                {getVisibilityIcon()}
              </Badge>
            </div>
          </div>
        
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-stone-800 text-lg">
              {localDiscovery.classification || "Analyzing..."}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {localDiscovery.confidence_score && (
                <Badge variant="secondary" className={`${getConfidenceColor(localDiscovery.confidence_score)} text-xs`}>
                  {localDiscovery.confidence_score}% Confidence
                </Badge>
              )}
              
              {localDiscovery.significance_level && (
                <Badge variant="secondary" className={`${getSignificanceColor(localDiscovery.significance_level)} text-xs`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {localDiscovery.significance_level?.charAt(0).toUpperCase() + localDiscovery.significance_level?.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {localDiscovery.time_period && (
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Calendar className="w-4 h-4" />
              <span>{localDiscovery.time_period}</span>
            </div>
          )}

          {localDiscovery.location && (
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{localDiscovery.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Calendar className="w-3 h-3" />
            <span>Uploaded {format(new Date(localDiscovery.created_date), "MMM d, yyyy")}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm ${hasLiked ? 'text-red-500' : 'text-stone-500'} hover:text-red-500 transition-colors`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                {localDiscovery.likes || 0}
              </button>
              <span className="flex items-center gap-1 text-sm text-stone-500">
                <MessageCircle className="w-4 h-4" />
                {localDiscovery.comment_count || 0}
              </span>
            </div>
            {isOwner && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowShare(true); }}
                className="text-stone-500 hover:text-amber-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardContent>
        </Card>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <ShareDiscoveryModal
            discovery={localDiscovery}
            onClose={() => setShowShare(false)}
            onUpdate={(updated) => {
              setLocalDiscovery(updated);
              if (onUpdate) onUpdate(updated);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}