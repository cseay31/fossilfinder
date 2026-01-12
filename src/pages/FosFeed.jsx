import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Search, UserPlus, UserMinus, AlertCircle, Flag, Loader2, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReportModal from "../components/fosfeed/ReportModal";
import ShellLoader from "../components/admin/ShellLoader";

export default function FosFeedPage({ isDarkMode }) {
  const [discoveries, setDiscoveries] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [appSettings, setAppSettings] = useState(null);
  const containerRef = useRef(null);
  const [reportingDiscovery, setReportingDiscovery] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const scrollPosition = container.scrollTop;
      const windowHeight = container.clientHeight;
      const index = Math.round(scrollPosition / windowHeight);
      setActiveIndex(index);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const loadData = async () => {
    try {
      const [discoveryData, userData, settingsData, user] = await Promise.all([
        base44.entities.Discovery.filter({ visibility: "public" }, "-created_date", 100),
        base44.entities.User.list(),
        base44.entities.AppSettings.list(),
        base44.auth.me()
      ]);

      setDiscoveries(discoveryData);
      setUsers(userData);
      setAppSettings(settingsData[0] || {});
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load FosFeed data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async (discovery) => {
    if (!appSettings?.likes_enabled) return;
    
    const hasLiked = discovery.liked_by?.includes(currentUser.email);
    const newLikedBy = hasLiked
      ? discovery.liked_by.filter(email => email !== currentUser.email)
      : [...(discovery.liked_by || []), currentUser.email];

    try {
      const updated = await base44.entities.Discovery.update(discovery.id, {
        liked_by: newLikedBy,
        likes: newLikedBy.length
      });
      setDiscoveries(discoveries.map(d => d.id === discovery.id ? updated : d));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const toggleFollow = async (userToFollow) => {
    if (!appSettings?.fosfeed_follow_enabled) return;

    const isFollowing = currentUser.following?.includes(userToFollow.email);
    
    try {
      const newFollowing = isFollowing
        ? (currentUser.following || []).filter(email => email !== userToFollow.email)
        : [...(currentUser.following || []), userToFollow.email];

      const newFollowers = isFollowing
        ? (userToFollow.followers || []).filter(email => email !== currentUser.email)
        : [...(userToFollow.followers || []), currentUser.email];

      await Promise.all([
        base44.auth.updateMe({
          following: newFollowing,
          following_count: newFollowing.length
        }),
        base44.entities.User.update(userToFollow.id, {
          followers: newFollowers,
          follower_count: newFollowers.length
        })
      ]);

      setCurrentUser({ ...currentUser, following: newFollowing, following_count: newFollowing.length });
      setUsers(users.map(u => u.id === userToFollow.id ? { ...u, followers: newFollowers, follower_count: newFollowers.length } : u));
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  const handleReport = async (reason) => {
    if (!appSettings?.fosfeed_reporting_enabled || !reportingDiscovery) return;

    try {
      // AI analysis of the reported content
      const aiAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a content moderator. Analyze this discovery for inappropriate content.

Discovery Details:
- Classification: ${reportingDiscovery.classification}
- Description: ${reportingDiscovery.description}
- User report reason: ${reason}

Determine if this content violates community guidelines (hate speech, graphic violence, spam, misinformation, inappropriate imagery, etc.).

Provide your verdict as "appropriate", "inappropriate", or "uncertain" along with a brief explanation.`,
        file_urls: [reportingDiscovery.photo_url],
        response_json_schema: {
          type: "object",
          properties: {
            verdict: { type: "string", enum: ["appropriate", "inappropriate", "uncertain"] },
            explanation: { type: "string" }
          }
        }
      });

      await base44.entities.ContentReport.create({
        content_type: "discovery",
        content_id: reportingDiscovery.id,
        reporter_email: currentUser.email,
        reason: reason,
        ai_analysis: aiAnalysis.explanation,
        ai_verdict: aiAnalysis.verdict,
        status: "pending"
      });

      setReportingDiscovery(null);
      alert("Report submitted successfully. Our team will review it shortly.");
    } catch (error) {
      console.error("Failed to submit report:", error);
      alert("Failed to submit report. Please try again.");
    }
  };

  const filteredDiscoveries = discoveries
    .filter(d => {
      if (!searchQuery) return d.visibility === 'public' && d.analysis_status === 'completed';
      const searchLower = searchQuery.toLowerCase();
      return (
        d.visibility === 'public' &&
        d.analysis_status === 'completed' &&
        (d.classification?.toLowerCase().includes(searchLower) ||
         d.location?.toLowerCase().includes(searchLower) ||
         d.owner_name?.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      // Prioritize staff picks and featured
      const aScore = (a.is_staff_pick ? 100 : 0) + (a.is_featured ? 50 : 0);
      const bScore = (b.is_staff_pick ? 100 : 0) + (b.is_featured ? 50 : 0);
      if (aScore !== bScore) return bScore - aScore;
      // Then by likes
      return (b.likes || 0) - (a.likes || 0);
    });

  // Check if FosFeed is disabled
  if (!isLoading && appSettings && !appSettings.fosfeed_enabled) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} flex items-center justify-center p-4`}>
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80'} backdrop-blur-xl shadow-lg max-w-md text-center p-8`}>
          <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2`}>FosFeed Unavailable</h2>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>FosFeed has been temporarily disabled by an administrator.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-stone-900'} relative overflow-hidden`}>
      {/* Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className={`max-w-md mx-auto ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/90'} backdrop-blur-md rounded-full shadow-lg`}>
          <div className="flex items-center gap-2 px-4 py-2">
            <Search className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discoveries..."
              className={`border-0 ${isDarkMode ? 'bg-transparent text-white placeholder:text-slate-500' : 'bg-transparent text-stone-800 placeholder:text-stone-400'} focus-visible:ring-0`}
            />
          </div>
        </div>
      </div>

      {/* Feed Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {isLoading ? (
          <div className="h-screen flex items-center justify-center">
            <ShellLoader isLoading={isLoading} message="Loading FosFeed..." />
          </div>
        ) : filteredDiscoveries.length === 0 ? (
          <div className="h-screen flex items-center justify-center p-8">
            <Alert className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/90'} max-w-md`}>
              <AlertCircle className={`h-4 w-4 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
              <AlertDescription className={isDarkMode ? 'text-slate-300' : 'text-stone-700'}>
                No discoveries found. {searchQuery ? "Try a different search." : "Be the first to share!"}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          filteredDiscoveries.map((discovery, index) => {
            const discoveryUser = users.find(u => u.email === discovery.created_by);
            const isLiked = discovery.liked_by?.includes(currentUser?.email);
            const isFollowing = currentUser?.following?.includes(discovery.created_by);

            return (
              <div key={discovery.id} className="h-screen snap-start relative">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${discovery.photo_url})`,
                    filter: 'blur(20px)',
                    transform: 'scale(1.1)'
                  }}
                />
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-950/60' : 'bg-stone-900/60'}`} />

                {/* Content */}
                <div className="relative h-full flex items-center justify-center">
                  {/* Main Image - Full Screen */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={discovery.photo_url}
                      alt={discovery.classification}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Right Side Action Buttons */}
                  <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
                    {/* User Avatar + Follow */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                          <AvatarImage src={discoveryUser?.profile_image} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold">
                            {discovery.owner_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {discovery.created_by !== currentUser?.email && appSettings?.fosfeed_follow_enabled && !isFollowing && (
                          <button
                            onClick={() => toggleFollow(discoveryUser)}
                            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                          >
                            <UserPlus className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-white font-medium drop-shadow-lg">{discovery.owner_name || 'Explorer'}</span>
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={() => toggleLike(discovery)}
                      disabled={!appSettings?.likes_enabled}
                      className="flex flex-col items-center gap-1 disabled:opacity-50"
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${isLiked ? 'bg-red-500' : 'bg-black/40 backdrop-blur-md'}`}>
                        <Heart className={`w-7 h-7 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
                      </div>
                      <span className="text-white text-sm font-bold drop-shadow-lg">{discovery.likes || 0}</span>
                    </button>

                    {/* Comment Button */}
                    <button className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-white text-sm font-bold drop-shadow-lg">{discovery.comment_count || 0}</span>
                    </button>

                    {/* Share Button */}
                    {appSettings?.sharing_enabled && (
                      <button className="flex flex-col items-center gap-1">
                        <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center shadow-lg">
                          <Share2 className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-white text-xs font-medium drop-shadow-lg">Share</span>
                      </button>
                    )}

                    {/* Report Button */}
                    {appSettings?.fosfeed_reporting_enabled && (
                      <button
                        onClick={() => setReportingDiscovery(discovery)}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center shadow-lg">
                          <Flag className="w-6 h-6 text-white" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="max-w-md space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-xl drop-shadow-lg">{discovery.classification}</h3>
                        {discovery.is_staff_pick && (
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                            ⭐ Staff Pick
                          </Badge>
                        )}
                        {discovery.is_featured && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                            ✨ Featured
                          </Badge>
                        )}
                        {discovery.significance_level && (
                          <Badge className="bg-amber-500 text-white border-0 shadow-lg">
                            {discovery.significance_level}
                          </Badge>
                        )}
                      </div>
                      {discovery.description && (
                        <p className="text-white text-sm drop-shadow-lg line-clamp-2">{discovery.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-white/90 drop-shadow-lg">
                        {discovery.time_period && <span>📅 {discovery.time_period}</span>}
                        {discovery.location && <span>📍 {discovery.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
                  {filteredDiscoveries.slice(0, 5).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all ${
                        i === index ? 'bg-white h-8' : 'bg-white/50 h-1'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={!!reportingDiscovery}
        onClose={() => setReportingDiscovery(null)}
        onSubmit={handleReport}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}