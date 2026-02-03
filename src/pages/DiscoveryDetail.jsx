import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Heart, MessageCircle, Calendar, MapPin, 
  TrendingUp, Send, Loader2, Globe, Lock, Users, ExternalLink, Mountain, Layers, Tag
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { calculatePoints } from '../components/gamification/BadgeSystem';
import BackButton from '../components/mobile/BackButton';

export default function DiscoveryDetailPage({ isDarkMode }) {
  const { id } = useParams();
  const [discovery, setDiscovery] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [discoveryData, user] = await Promise.all([
        base44.entities.Discovery.filter({ id }),
        base44.auth.me()
      ]);
      setDiscovery(discoveryData[0]);
      setCurrentUser(user);
      await loadComments(id);
    } catch (error) {
      console.error("Failed to load discovery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (discoveryId) => {
    try {
      const data = await base44.entities.DiscoveryComment.filter(
        { discovery_id: discoveryId },
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
    const likedBy = discovery.liked_by || [];
    const hasLiked = likedBy.includes(currentUser?.email);
    
    const newLikedBy = hasLiked 
      ? likedBy.filter(e => e !== currentUser?.email)
      : [...likedBy, currentUser?.email];
    
    const updatedDiscovery = {
      ...discovery,
      liked_by: newLikedBy,
      likes: newLikedBy.length
    };
    
    setDiscovery(updatedDiscovery);
    
    try {
      await base44.entities.Discovery.update(discovery.id, {
        liked_by: newLikedBy,
        likes: newLikedBy.length
      });
    } catch (error) {
      console.error("Failed to like:", error);
      setDiscovery(discovery);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
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
        author_name: currentUser?.display_name || currentUser?.full_name || 'Anonymous',
        likes: 0,
        liked_by: []
      });

      await base44.entities.Discovery.update(discovery.id, {
        comment_count: (discovery.comment_count || 0) + 1
      });

      const commentPoints = calculatePoints('comment');
      await base44.auth.updateMe({
        points: (currentUser.points || 0) + commentPoints
      });

      setComments([comment, ...comments]);
      setDiscovery({
        ...discovery,
        comment_count: (discovery.comment_count || 0) + 1
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
      exceptional: isDarkMode ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-800",
      high: isDarkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-800",
      medium: isDarkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800",
      low: isDarkMode ? "bg-slate-500/20 text-slate-300" : "bg-slate-100 text-slate-600"
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

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'} flex items-center justify-center`}>
        <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
      </div>
    );
  }

  if (!discovery) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'} flex items-center justify-center p-4`}>
        <p className={isDarkMode ? 'text-white' : 'text-stone-800'}>Discovery not found</p>
      </div>
    );
  }

  const hasLiked = (discovery.liked_by || []).includes(currentUser?.email);
  const isOwner = discovery.created_by === currentUser?.email;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'} pb-safe-bottom`}>
      <div className="sticky top-0 z-10 p-4 border-b backdrop-blur-xl" style={{
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      }}>
        <BackButton isDarkMode={isDarkMode} />
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Image */}
          <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-stone-200'}`}>
            <CardContent className="p-0">
              <img 
                src={discovery.photo_url} 
                alt={discovery.classification || 'Discovery'} 
                className="w-full h-auto rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Details */}
          <div className="space-y-4">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-stone-200'}`}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-cyan-500 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-stone-600'} flex items-center justify-center text-white font-semibold`}>
                    {discovery.owner_name?.[0] || discovery.created_by?.[0] || 'U'}
                  </div>
                  <div>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{discovery.owner_name || 'Explorer'}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                      {formatDistanceToNow(new Date(discovery.created_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                  {discovery.classification || 'Analyzing...'}
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  {discovery.significance_level && (
                    <Badge className={getSignificanceColor(discovery.significance_level)}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {discovery.significance_level}
                    </Badge>
                  )}
                  {discovery.confidence_score && (
                    <Badge variant="outline">{discovery.confidence_score}% confidence</Badge>
                  )}
                  {discovery.is_featured && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">⭐ Featured</Badge>
                  )}
                  {discovery.is_staff_pick && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">🏆 Staff Pick</Badge>
                  )}
                </div>

                {discovery.time_period && (
                  <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{discovery.time_period}</span>
                  </div>
                )}

                {discovery.location && (
                  <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}>
                    <MapPin className="w-4 h-4" />
                    <span>{discovery.location}</span>
                  </div>
                )}

                {discovery.description && (
                  <div className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-stone-50'} rounded-lg p-3`}>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>{discovery.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t" style={{
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLikeDiscovery}
                    className={hasLiked ? 'text-red-500' : ''}
                    style={{ userSelect: 'none' }}
                  >
                    <Heart className={`w-5 h-5 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                    {discovery.likes || 0}
                  </Button>
                  <Button variant="ghost" size="sm" style={{ userSelect: 'none' }}>
                    <MessageCircle className="w-5 h-5 mr-1" />
                    {discovery.comment_count || 0}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-stone-200'}`}>
              <CardContent className="p-6">
                <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Comments</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                  {isLoadingComments ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : comments.length === 0 ? (
                    <p className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-stone-500'} py-8`}>No comments yet</p>
                  ) : (
                    comments.map((comment) => {
                      const commentLiked = (comment.liked_by || []).includes(currentUser?.email);
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-stone-200'} flex items-center justify-center font-semibold text-sm`}>
                            {comment.author_name?.[0] || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-stone-50'} rounded-lg p-3`}>
                              <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{comment.author_name || 'Anonymous'}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-600'} mt-1`}>{comment.content}</p>
                            </div>
                            <button 
                              onClick={() => handleLikeComment(comment)}
                              className={`text-xs mt-1 flex items-center gap-1 ${commentLiked ? 'text-red-500' : isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}
                              style={{ userSelect: 'none' }}
                            >
                              <Heart className={`w-3 h-3 ${commentLiked ? 'fill-current' : ''}`} />
                              {comment.likes || 0}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className={`flex-1 ${isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : ''}`}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  />
                  <Button 
                    onClick={handleSubmitComment} 
                    disabled={!newComment.trim() || isSubmitting}
                    size="icon"
                    style={{ userSelect: 'none' }}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}