import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Shield, Users, Search, TrendingUp, AlertTriangle, MessageSquare, 
  Gavel, Megaphone, SlidersHorizontal, LayoutDashboard, Settings, 
  Award, FileText, Trophy, Eye, Clock, CheckCircle, Star, Activity,
  Loader2, RefreshCw, Filter, ChevronRight, Zap, Globe, Heart, Flag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, isAfter } from "date-fns";
import AdminDiscoveryCard from "../components/admin/AdminDiscoveryCard";
import UserManagement from "../components/admin/UserManagement";
import SiteSettings from "../components/admin/SiteSettings";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard";
import MessageManagement from "../components/admin/MessageManagement";
import ModerationPanel from "../components/admin/ModerationPanel";
import AdminMessaging from "../components/admin/AdminMessaging";
import SlideshowReview from "../components/admin/SlideshowReview";
import LiveUserActivity from "../components/admin/LiveUserActivity";
import ContentReports from "../components/admin/ContentReports";
import AuditLogViewer from "../components/admin/AuditLogViewer";
import PopupMessageManager from "../components/admin/PopupMessageManager";
import ShellLoader from "../components/admin/ShellLoader";
import { calculatePoints, checkBadgeEligibility } from "../components/gamification/BadgeSystem";

export default function AdminPage({ isDarkMode }) {
  const [discoveries, setDiscoveries] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSlideshowReview, setShowSlideshowReview] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCalculatingPoints, setIsCalculatingPoints] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      if (user.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      
      await loadAllData();
    } catch (error) {
      console.error("Failed to verify admin access:", error);
      window.location.href = '/';
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [discoveriesData, usersData, commentsData, messagesData] = await Promise.all([
        base44.entities.Discovery.list("-created_date"),
        base44.entities.User.list(),
        base44.entities.DiscoveryComment.list('-created_date', 100),
        base44.entities.ContactMessage.filter({ status: 'new' })
      ]);
      
      setDiscoveries(discoveriesData);
      setUsers(usersData);
      setComments(commentsData);
      setContactMessages(messagesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateAllPoints = async () => {
    if (!confirm('This will recalculate points for all users based on their activity. Continue?')) return;
    
    setIsCalculatingPoints(true);
    try {
      const allComments = await base44.entities.DiscoveryComment.list();
      
      for (const user of users) {
        if (user.is_banned) continue;
        
        const userDiscoveries = discoveries.filter(d => d.created_by === user.email);
        const userComments = allComments.filter(c => c.created_by === user.email);
        
        // Calculate points
        let totalPoints = 0;
        
        // Discovery points
        totalPoints += userDiscoveries.length * calculatePoints('discovery');
        
        // Like points
        const totalLikes = userDiscoveries.reduce((sum, d) => sum + (d.likes || 0), 0);
        totalPoints += totalLikes * calculatePoints('like_received');
        
        // Comment points
        totalPoints += userComments.length * calculatePoints('comment');
        
        // Follower points
        totalPoints += (user.follower_count || 0) * calculatePoints('follow_received');
        
        // Featured/Staff pick bonus
        const featuredCount = userDiscoveries.filter(d => d.is_featured).length;
        const staffPickCount = userDiscoveries.filter(d => d.is_staff_pick).length;
        totalPoints += featuredCount * calculatePoints('featured');
        totalPoints += staffPickCount * calculatePoints('staff_pick');
        
        // Check for new badges
        const newBadges = checkBadgeEligibility(user, discoveries, allComments);
        const allBadges = [...new Set([...(user.badges || []), ...newBadges])];
        
        // Update user
        await base44.entities.User.update(user.id, {
          points: totalPoints,
          badges: allBadges,
          discovery_count: userDiscoveries.length
        });
      }
      
      await loadAllData();
      alert('Points recalculated for all users successfully!');
    } catch (error) {
      console.error("Failed to recalculate points:", error);
      alert('Failed to recalculate points');
    } finally {
      setIsCalculatingPoints(false);
    }
  };

  // Stats calculations
  const last7Days = subDays(new Date(), 7);
  const last24Hours = subDays(new Date(), 1);

  const stats = {
    totalUsers: users.length,
    totalDiscoveries: discoveries.length,
    analyzingCount: discoveries.filter(d => d.analysis_status === 'analyzing').length,
    completedCount: discoveries.filter(d => d.analysis_status === 'completed').length,
    exceptionalCount: discoveries.filter(d => d.significance_level === 'exceptional').length,
    highSignificance: discoveries.filter(d => d.significance_level === 'high').length,
    staffPicks: discoveries.filter(d => d.is_staff_pick).length,
    featured: discoveries.filter(d => d.is_featured).length,
    newThisWeek: discoveries.filter(d => isAfter(new Date(d.created_date), last7Days)).length,
    newToday: discoveries.filter(d => isAfter(new Date(d.created_date), last24Hours)).length,
    totalComments: comments.length,
    pendingMessages: contactMessages.length,
    totalLikes: discoveries.reduce((sum, d) => sum + (d.likes || 0), 0),
    publicDiscoveries: discoveries.filter(d => d.visibility === 'public').length
  };

  // Filter discoveries
  const getFilteredDiscoveries = () => {
    let filtered = discoveries;
    
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.classification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.created_by?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case "analyzing": return filtered.filter(d => d.analysis_status === "analyzing");
      case "completed": return filtered.filter(d => d.analysis_status === "completed");
      case "exceptional": return filtered.filter(d => d.significance_level === "exceptional");
      case "high": return filtered.filter(d => d.significance_level === "high");
      case "featured": return filtered.filter(d => d.is_featured);
      case "staff_pick": return filtered.filter(d => d.is_staff_pick);
      default: return filtered;
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800/50 border-red-500/50">
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-400 mb-4">Administrator privileges required.</p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, subValue, color, bgColor }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={isDarkMode ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} transition-all>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider`}>{label}</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mt-1`}>{value}</p>
              {subValue && <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mt-1`}>{subValue}</p>}
            </div>
            <div className={`p-3 rounded-xl ${bgColor}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`flex flex-col items-center gap-2 h-auto py-4 px-6 ${isDarkMode ? 'bg-slate-800/30 hover:bg-slate-700/50 border-slate-700/50' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'} border rounded-xl`}
    >
      <Icon className={`w-6 h-6 ${color}`} />
      <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
    </Button>
  );

  return (
    <div className={`min-h-screen pb-safe-bottom ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-slate-50 to-slate-100'} p-4 md:p-6`}>
      {/* Subtle Background - Battery Optimized */}
      {isDarkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/25' : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'} rounded-2xl flex items-center justify-center`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Admin Control Center</h1>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Welcome back, {currentUser.full_name || 'Admin'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadAllData}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setShowSlideshowReview(true)}
                className={isDarkMode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Quick Review
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-300'} border p-1 flex-wrap h-auto gap-1`}>
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="discoveries" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600">
              <Search className="w-4 h-4 mr-2" /> Discoveries
            </TabsTrigger>
            <TabsTrigger value="showcase" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500">
              <Trophy className="w-4 h-4 mr-2" /> Showcase
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600">
              <Users className="w-4 h-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600">
              <Gavel className="w-4 h-4 mr-2" /> Moderation
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600">
              <MessageSquare className="w-4 h-4 mr-2" /> Messages
              {stats.pendingMessages > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5">{stats.pendingMessages}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600">
              <Megaphone className="w-4 h-4 mr-2" /> Announce
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-500">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600">
              <TrendingUp className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="full-system" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600">
              <FileText className="w-4 h-4 mr-2" /> Full System Discoveries
            </TabsTrigger>
            <TabsTrigger value="live-activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600">
              <Activity className="w-4 h-4 mr-2" /> Live Activity
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600">
              <Flag className="w-4 h-4 mr-2" /> Reports
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600">
              <FileText className="w-4 h-4 mr-2" /> Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <StatCard icon={Users} label="Users" value={stats.totalUsers} color="text-blue-400" bgColor="bg-blue-500/20" />
              <StatCard icon={Search} label="Discoveries" value={stats.totalDiscoveries} subValue={`+${stats.newToday} today`} color="text-amber-400" bgColor="bg-amber-500/20" />
              <StatCard icon={Clock} label="Analyzing" value={stats.analyzingCount} color="text-cyan-400" bgColor="bg-cyan-500/20" />
              <StatCard icon={Star} label="Exceptional" value={stats.exceptionalCount} color="text-purple-400" bgColor="bg-purple-500/20" />
              <StatCard icon={MessageSquare} label="Comments" value={stats.totalComments} color="text-indigo-400" bgColor="bg-indigo-500/20" />
              <StatCard icon={Heart} label="Total Likes" value={stats.totalLikes} color="text-red-400" bgColor="bg-red-500/20" />
            </div>

            {/* Quick Actions */}
            <Card className={isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                  <Zap className="w-5 h-5 text-yellow-500" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <QuickAction icon={SlidersHorizontal} label="Review Queue" onClick={() => setShowSlideshowReview(true)} color="text-purple-400" />
                  <QuickAction icon={Trophy} label="Manage Showcase" onClick={() => setActiveTab('showcase')} color="text-amber-400" />
                  <QuickAction icon={Users} label="User Management" onClick={() => setActiveTab('users')} color="text-blue-400" />
                  <QuickAction icon={Megaphone} label="Post Announcement" onClick={() => setActiveTab('announcements')} color="text-pink-400" />
                  <QuickAction icon={Settings} label="Site Settings" onClick={() => setActiveTab('settings')} color="text-slate-400" />
                  <Button
                    onClick={recalculateAllPoints}
                    disabled={isCalculatingPoints}
                    variant="ghost"
                    className="flex flex-col items-center gap-2 h-auto py-4 px-6 bg-slate-800/30 hover:bg-slate-700/50 border-slate-700/50 border rounded-xl"
                  >
                    {isCalculatingPoints ? (
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    ) : (
                      <Zap className="w-6 h-6 text-cyan-400" />
                    )}
                    <span className="text-xs text-slate-300">
                      {isCalculatingPoints ? 'Calculating...' : 'Recalculate Points'}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Requires Attention */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" /> Requires Attention
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.pendingMessages > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-red-400" />
                        <span className="text-slate-300">Unread Messages</span>
                      </div>
                      <Badge className="bg-red-500">{stats.pendingMessages}</Badge>
                    </div>
                  )}
                  {stats.analyzingCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <span className="text-slate-300">Pending Analysis</span>
                      </div>
                      <Badge className="bg-cyan-500">{stats.analyzingCount}</Badge>
                    </div>
                  )}
                  {stats.pendingMessages === 0 && stats.analyzingCount === 0 && (
                    <div className="flex items-center justify-center p-6 text-slate-500">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      All caught up!
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Showcase Stats */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" /> Showcase Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-400" />
                      <span className="text-slate-300">Staff Picks</span>
                    </div>
                    <Badge className="bg-purple-500">{stats.staffPicks}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-400" />
                      <span className="text-slate-300">Featured</span>
                    </div>
                    <Badge className="bg-amber-500">{stats.featured}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      <span className="text-slate-300">Public Discoveries</span>
                    </div>
                    <Badge className="bg-emerald-500">{stats.publicDiscoveries}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" /> Recent Discoveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {discoveries.slice(0, 5).map((d, i) => (
                    <div key={d.id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <img src={d.photo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{d.classification || 'Analyzing...'}</p>
                        <p className="text-xs text-slate-500">{d.created_by}</p>
                      </div>
                      <Badge variant="outline" className={
                        d.significance_level === 'exceptional' ? 'border-purple-500 text-purple-400' :
                        d.significance_level === 'high' ? 'border-red-500 text-red-400' :
                        'border-slate-600 text-slate-400'
                      }>
                        {d.significance_level || 'pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discoveries Tab */}
          <TabsContent value="discoveries" className="space-y-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-xl text-white flex items-center gap-3">
                    <Search className="w-6 h-6 text-amber-400" />
                    All Discoveries
                    <Badge variant="outline" className="border-slate-600">{discoveries.length}</Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Input
                    placeholder="Search discoveries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs bg-slate-900/50 border-slate-700 text-white"
                  />
                  <div className="flex flex-wrap gap-2">
                    {['all', 'analyzing', 'completed', 'exceptional', 'high', 'featured', 'staff_pick'].map(filter => (
                      <Button
                        key={filter}
                        size="sm"
                        variant={activeFilter === filter ? 'default' : 'outline'}
                        onClick={() => setActiveFilter(filter)}
                        className={activeFilter === filter ? 'bg-amber-600' : 'border-slate-600 text-slate-300'}
                      >
                        {filter.replace('_', ' ').charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                  <ShellLoader isLoading={isLoading} message="Loading discoveries..." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredDiscoveries().slice(0, 30).map((discovery, index) => (
                      <AdminDiscoveryCard 
                        key={discovery.id} 
                        discovery={discovery} 
                        index={index}
                        onUpdate={loadAllData}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Showcase Tab */}
          <TabsContent value="showcase" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard icon={Award} label="Staff Picks" value={stats.staffPicks} color="text-purple-400" bgColor="bg-purple-500/20" />
              <StatCard icon={Star} label="Featured" value={stats.featured} color="text-amber-400" bgColor="bg-amber-500/20" />
              <StatCard icon={Star} label="Exceptional" value={stats.exceptionalCount} color="text-pink-400" bgColor="bg-pink-500/20" />
            </div>
            
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  Community Showcase Management
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Use the Quick Review to easily manage Staff Picks and Featured discoveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowSlideshowReview(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                  size="lg"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Open Slideshow Review
                </Button>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Current Staff Picks</h4>
                    <div className="space-y-2">
                      {discoveries.filter(d => d.is_staff_pick).slice(0, 5).map(d => (
                        <div key={d.id} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                          <img src={d.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-sm text-slate-300 truncate">{d.classification}</span>
                        </div>
                      ))}
                      {discoveries.filter(d => d.is_staff_pick).length === 0 && (
                        <p className="text-slate-500 text-sm">No staff picks yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Featured Discoveries</h4>
                    <div className="space-y-2">
                      {discoveries.filter(d => d.is_featured).slice(0, 5).map(d => (
                        <div key={d.id} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                          <img src={d.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-sm text-slate-300 truncate">{d.classification}</span>
                        </div>
                      ))}
                      {discoveries.filter(d => d.is_featured).length === 0 && (
                        <p className="text-slate-500 text-sm">No featured discoveries yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="users"><UserManagement /></TabsContent>
          <TabsContent value="moderation"><ModerationPanel /></TabsContent>
          <TabsContent value="messages"><MessageManagement /></TabsContent>
          <TabsContent value="announcements">
            <div className="space-y-8">
              <AdminMessaging />
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                <PopupMessageManager isDarkMode={isDarkMode} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings"><SiteSettings /></TabsContent>
          <TabsContent value="analytics"><AnalyticsDashboard discoveries={discoveries} /></TabsContent>
          <TabsContent value="live-activity"><LiveUserActivity isDarkMode={isDarkMode} /></TabsContent>
          <TabsContent value="reports"><ContentReports /></TabsContent>
          <TabsContent value="audit-logs"><AuditLogViewer isDarkMode={isDarkMode} /></TabsContent>
          
          {/* Full System Discoveries Tab */}
          <TabsContent value="full-system" className="space-y-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-xl text-white flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-400" />
                    Full System Discoveries
                    <Badge variant="outline" className="border-slate-600">{discoveries.length} Total</Badge>
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Complete list of all discoveries in the system, regardless of review status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <Input
                    placeholder="Search all discoveries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                {/* Grid */}
                {isLoading ? (
                  <ShellLoader isLoading={isLoading} message="Loading all discoveries..." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discoveries
                      .filter(d => {
                        if (!searchQuery) return true;
                        return d.classification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               d.created_by?.toLowerCase().includes(searchQuery.toLowerCase());
                      })
                      .map((discovery, index) => (
                        <AdminDiscoveryCard 
                          key={discovery.id} 
                          discovery={discovery} 
                          index={index}
                          onUpdate={loadAllData}
                          onReview={(disc) => {
                            setDiscoveries(discoveries.map(d => d.id === disc.id ? disc : d));
                            setShowSlideshowReview(true);
                          }}
                        />
                      ))}
                  </div>
                )}

                {discoveries.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No discoveries in the system yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Slideshow Review Modal */}
      <AnimatePresence>
        {showSlideshowReview && (
          <SlideshowReview
            discoveries={discoveries}
            onClose={() => setShowSlideshowReview(false)}
            onUpdate={loadAllData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}