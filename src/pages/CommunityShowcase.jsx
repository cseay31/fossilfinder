import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Heart, MessageCircle, Search, TrendingUp, 
  Calendar, MapPin, Star, Loader2, Filter, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import DiscoveryDetailModal from "../components/discovery/DiscoveryDetailModal";

export default function CommunityShowcasePage({ isDarkMode }) {
  const [discoveries, setDiscoveries] = useState([]);
  const [featuredDiscoveries, setFeaturedDiscoveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("featured");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [user, allDiscoveries] = await Promise.all([
        base44.auth.me(),
        base44.entities.Discovery.filter({ visibility: 'public' }, '-created_date')
      ]);
      
      setCurrentUser(user);
      
      // Filter completed discoveries
      const completedPublic = allDiscoveries.filter(d => d.analysis_status === 'completed');
      setDiscoveries(completedPublic);
      
      // Featured discoveries (is_featured or high/exceptional significance)
      const featured = completedPublic.filter(d => 
        d.is_featured || d.significance_level === 'exceptional' || d.significance_level === 'high'
      );
      setFeaturedDiscoveries(featured);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (discovery, e) => {
    e.stopPropagation();
    const likedBy = discovery.liked_by || [];
    const hasLiked = likedBy.includes(currentUser?.email);
    
    const newLikedBy = hasLiked 
      ? likedBy.filter(e => e !== currentUser?.email)
      : [...likedBy, currentUser?.email];

    // Update local state
    const updateDiscovery = (d) => 
      d.id === discovery.id ? { ...d, liked_by: newLikedBy, likes: newLikedBy.length } : d;
    
    setDiscoveries(discoveries.map(updateDiscovery));
    setFeaturedDiscoveries(featuredDiscoveries.map(updateDiscovery));

    try {
      await base44.entities.Discovery.update(discovery.id, {
        liked_by: newLikedBy,
        likes: newLikedBy.length
      });
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const getSignificanceColor = (level) => {
    const colors = {
      exceptional: 'bg-purple-100 text-purple-800 border-purple-200',
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return colors[level] || colors.medium;
  };

  const filteredDiscoveries = (activeTab === 'featured' ? featuredDiscoveries : discoveries)
    .filter(d => 
      !searchQuery || 
      d.classification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.time_period?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Sort options
  const sortedDiscoveries = [...filteredDiscoveries].sort((a, b) => {
    if (activeTab === 'trending') {
      return (b.likes || 0) - (a.likes || 0);
    }
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const DiscoveryCard = ({ discovery, index }) => {
    const hasLiked = (discovery.liked_by || []).includes(currentUser?.email);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => setSelectedDiscovery(discovery)}
        className="cursor-pointer"
      >
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/90 border-0'} backdrop-blur-xl shadow-lg hover:shadow-xl transition-all overflow-hidden group`}>
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={discovery.photo_url} 
              alt={discovery.classification}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-3 right-3 flex gap-2">
              {discovery.is_featured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                </Badge>
              )}
              {discovery.significance_level && (
                <Badge className={getSignificanceColor(discovery.significance_level)}>
                  {discovery.significance_level}
                </Badge>
              )}
            </div>

            {/* Author */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-sm">
                {discovery.owner_name?.[0] || discovery.created_by?.[0] || 'U'}
              </div>
              <span className="text-white text-sm font-medium">{discovery.owner_name || 'Explorer'}</span>
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'} mb-2 line-clamp-1`}>
              {discovery.classification}
            </h3>
            
            <div className="flex items-center gap-3 text-sm mb-3">
              {discovery.time_period && (
                <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  <Calendar className="w-3 h-3" />
                  {discovery.time_period}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => handleLike(discovery, e)}
                  className={`flex items-center gap-1 text-sm ${hasLiked ? 'text-red-500' : isDarkMode ? 'text-slate-400' : 'text-stone-500'} hover:text-red-500 transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  {discovery.likes || 0}
                </button>
                <span className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  <MessageCircle className="w-4 h-4" />
                  {discovery.comment_count || 0}
                </span>
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>
                {formatDistanceToNow(new Date(discovery.created_date), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className={`w-10 h-10 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
              Community Showcase
            </h1>
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-stone-600'} max-w-2xl mx-auto`}>
            Explore exceptional discoveries from the FossilFinder community
          </p>
        </motion.div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
              <TabsTrigger value="featured" className="flex items-center gap-2">
                <Star className="w-4 h-4" /> Featured
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recent
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discoveries..."
              className={`pl-10 ${isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white/80'}`}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className={`w-12 h-12 ${isDarkMode ? 'text-cyan-400' : 'text-amber-500'} animate-spin mx-auto mb-4`} />
            <p className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>Loading discoveries...</p>
          </div>
        ) : sortedDiscoveries.length === 0 ? (
          <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
            <CardContent className="text-center py-16">
              <Trophy className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-stone-300'}`} />
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-stone-700'} mb-2`}>
                No discoveries found
              </h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-stone-500'}>
                {searchQuery ? 'Try adjusting your search' : 'Be the first to share a discovery!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDiscoveries.map((discovery, index) => (
              <DiscoveryCard key={discovery.id} discovery={discovery} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDiscovery && (
          <DiscoveryDetailModal
            discovery={selectedDiscovery}
            currentUser={currentUser}
            onClose={() => setSelectedDiscovery(null)}
            onUpdate={(updated) => {
              const updateFn = (d) => d.id === updated.id ? updated : d;
              setDiscoveries(discoveries.map(updateFn));
              setFeaturedDiscoveries(featuredDiscoveries.map(updateFn));
              setSelectedDiscovery(updated);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}