import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, Heart, MessageCircle, Share2, Calendar, MapPin, 
  TrendingUp, Send, Loader2, Globe, Lock, Users, User, ExternalLink
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function DiscoveryDetailModal({ discovery, onClose, currentUser, onUpdate }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localDiscovery, setLocalDiscovery] = useState(discovery);

  useEffect(() => {
    loadComments();
  }, [discovery.id]);

  const loadComments = async () => {
    try {
      const data = await base44.entities.DiscoveryComment.filter(
        { discovery_id: discovery.id },
        '-created_date'
      );
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLikeDiscovery = async () => {
    const likedBy = localDiscovery.liked_by || [];
    const hasLiked = likedBy.includes(currentUser?.email);
    
    const newLikedBy = hasLiked 
      ? likedBy.filter(e => e !== currentUser?.email)
      : [...likedBy, currentUser?.email];
    
    const updatedDiscovery = {
      ...localDiscovery,
      liked_by: newLikedBy,
      likes: newLikedBy.length
    };
    
    setLocalDiscovery(updatedDiscovery);
    
    try {
      await base44.entities.Discovery.update(discovery.id, {
        liked_by: newLikedBy,
        likes: newLikedBy.length
      });
      if (onUpdate) onUpdate(updatedDiscovery);
    } catch (error) {
      console.error("Failed to like:", error);
      setLocalDiscovery(localDiscovery);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // AI moderation check - only block inappropriate content
      const moderation = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a content moderator. Check if this comment contains any inappropriate content that should be blocked. ONLY block comments that contain:
- Hate speech, slurs, or discrimination
- Explicit sexual content
- Graphic violence
- Harassment or personal attacks
- Spam or advertisements

Do NOT block comments just because they are off-topic, casual, or unrelated to archaeology. Users are free to discuss whatever they want as long as it's not harmful.

Comment: "${newComment}"

Return is_appropriate=true unless the comment contains genuinely harmful/inappropriate content.`,
        response_json_schema: {
          type: "object",
          properties: {
            is_appropriate: { type: "boolean" },
            reason: { type: "string" }
          }
        }
      });

      if (!moderation.is_appropriate) {
        alert(`Comment not allowed: ${moderation.reason}`);
        setIsSubmitting(false);
        return;
      }

      const comment = await base44.entities.DiscoveryComment.create({
        discovery_id: discovery.id,
        content: newComment.trim(),
        author_name: currentUser?.full_name || 'Anonymous',
        likes: 0,
        liked_by: []
      });

      // Update comment count
      await base44.entities.Discovery.update(discovery.id, {
        comment_count: (localDiscovery.comment_count || 0) + 1
      });

      setComments([comment, ...comments]);
      setLocalDiscovery({
        ...localDiscovery,
        comment_count: (localDiscovery.comment_count || 0) + 1
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (comment) => {
    const likedBy = comment.liked_by || [];
    const hasLiked = likedBy.includes(currentUser?.email);
    
    const newLikedBy = hasLiked 
      ? likedBy.filter(e => e !== currentUser?.email)
      : [...likedBy, currentUser?.email];

    setComments(comments.map(c => 
      c.id === comment.id 
        ? { ...c, liked_by: newLikedBy, likes: newLikedBy.length }
        : c
    ));

    try {
      await base44.entities.DiscoveryComment.update(comment.id, {
        liked_by: newLikedBy,
        likes: newLikedBy.length
      });
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  const getSignificanceColor = (level) => {
    const colors = {
      exceptional: "bg-purple-100 text-purple-800",
      high: "bg-red-100 text-red-800",
      medium: "bg-amber-100 text-amber-800",
      low: "bg-slate-100 text-slate-600"
    };
    return colors[level] || colors.medium;
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'private': return <Lock className="w-4 h-4" />;
      case 'shared': return <Users className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const hasLiked = (localDiscovery.liked_by || []).includes(currentUser?.email);
  const isOwner = localDiscovery.created_by === currentUser?.email;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-stone-600 flex items-center justify-center text-white font-semibold">
              {localDiscovery.owner_name?.[0] || localDiscovery.created_by?.[0] || 'U'}
            </div>
            <div>
              <p className="font-semibold text-stone-800">{localDiscovery.owner_name || 'Explorer'}</p>
              <p className="text-xs text-stone-500">
                {formatDistanceToNow(new Date(localDiscovery.created_date), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getVisibilityIcon(localDiscovery.visibility || 'public')}
              {(localDiscovery.visibility || 'public').charAt(0).toUpperCase() + (localDiscovery.visibility || 'public').slice(1)}
            </Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="bg-stone-900 flex items-center justify-center">
              <img 
                src={localDiscovery.photo_url} 
                alt={localDiscovery.classification || 'Discovery'} 
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>

            {/* Details & Comments */}
            <div className="flex flex-col h-full">
              {/* Discovery Info */}
              <div className="p-6 border-b space-y-4">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-stone-800">
                    {localDiscovery.classification || 'Analyzing...'}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2">
                    {localDiscovery.significance_level && (
                      <Badge className={getSignificanceColor(localDiscovery.significance_level)}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {localDiscovery.significance_level}
                      </Badge>
                    )}
                    {localDiscovery.confidence_score && (
                      <Badge variant="outline" className="border-2">
                        {localDiscovery.confidence_score}% confidence
                      </Badge>
                    )}
                    {localDiscovery.is_featured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        ⭐ Featured
                      </Badge>
                    )}
                    {localDiscovery.is_staff_pick && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        🏆 Staff Pick
                      </Badge>
                    )}
                  </div>
                </div>

                {localDiscovery.time_period && (
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{localDiscovery.time_period}</span>
                  </div>
                )}

                {localDiscovery.location && (
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{localDiscovery.location}</span>
                  </div>
                )}

                {localDiscovery.description && (
                  <div className="bg-stone-50 rounded-lg p-3">
                    <p className="text-sm text-stone-700 leading-relaxed">{localDiscovery.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 flex-wrap border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLikeDiscovery}
                    className={hasLiked ? 'text-red-500' : 'text-stone-600'}
                  >
                    <Heart className={`w-5 h-5 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                    {localDiscovery.likes || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-stone-600">
                    <MessageCircle className="w-5 h-5 mr-1" />
                    {localDiscovery.comment_count || 0}
                  </Button>
                  {isOwner && localDiscovery.analysis_status === 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const url = `/Experts?discoveryId=${localDiscovery.id}`;
                        window.location.href = url;
                      }}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white ml-auto"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Send to Expert
                    </Button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
                {isLoadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No comments yet. Be the first!</p>
                ) : (
                  comments.map((comment) => {
                    const commentLiked = (comment.liked_by || []).includes(currentUser?.email);
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold text-sm flex-shrink-0">
                          {comment.author_name?.[0] || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="bg-stone-50 rounded-lg p-3">
                            <p className="font-medium text-sm text-stone-800">{comment.author_name || 'Anonymous'}</p>
                            <p className="text-sm text-stone-600 mt-1">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                            <span>{formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}</span>
                            <button 
                              onClick={() => handleLikeComment(comment)}
                              className={`flex items-center gap-1 hover:text-red-500 ${commentLiked ? 'text-red-500' : ''}`}
                            >
                              <Heart className={`w-3 h-3 ${commentLiked ? 'fill-current' : ''}`} />
                              {comment.likes || 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  />
                  <Button 
                    onClick={handleSubmitComment} 
                    disabled={!newComment.trim() || isSubmitting}
                    size="icon"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}