import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Search, TrendingUp, Calendar, AlertTriangle, MessageSquare, Gavel, Megaphone, SlidersHorizontal, LayoutDashboard, Settings, Award, FileText, Trophy, Map, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminDiscoveryCard from "../components/admin/AdminDiscoveryCard";
import AdminStats from "../components/admin/AdminStats";
import UserManagement from "../components/admin/UserManagement";
import AdminFilters from "../components/admin/AdminFilters";
import ReviewPanel from "../components/admin/ReviewPanel";
import SiteSettings from "../components/admin/SiteSettings";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard";
import MessageManagement from "../components/admin/MessageManagement";
import ModerationPanel from "../components/admin/ModerationPanel";
import AdminMessaging from "../components/admin/AdminMessaging";
import SlideshowReview from "../components/admin/SlideshowReview";
import AdminOverview from "../components/admin/AdminOverview";

export default function AdminPage() {
  const [discoveries, setDiscoveries] = useState([]);
  const [filteredDiscoveries, setFilteredDiscoveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);
  const [showSlideshowReview, setShowSlideshowReview] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        if (user.role !== 'admin') {
          // Redirect non-admins away from admin page
          window.location.href = '/';
          return;
        }
        
        // Load discoveries if user is admin
        try {
          const data = await base44.entities.Discovery.list("-created_date");
          setDiscoveries(data);
        } catch (error) {
          console.error("Failed to load discoveries:", error);
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to verify admin access:", error);
        window.location.href = '/';
      }
    };

    checkAdminAccess();
  }, []);

  useEffect(() => {
    let filtered = discoveries;
    
    switch (activeFilter) {
      case "analyzing":
        filtered = discoveries.filter(d => d.analysis_status === "analyzing");
        break;
      case "completed":
        filtered = discoveries.filter(d => d.analysis_status === "completed");
        break;
      case "sent_to_expert":
        filtered = discoveries.filter(d => d.analysis_status === "sent_to_expert");
        break;
      case "high_significance":
        filtered = discoveries.filter(d => d.significance_level === "high" || d.significance_level === "exceptional");
        break;
      case "low_confidence":
        filtered = discoveries.filter(d => d.confidence_score && d.confidence_score < 60);
        break;
      default:
        filtered = discoveries;
    }
    
    setFilteredDiscoveries(filtered);
  }, [discoveries, activeFilter]);

  const loadAllDiscoveries = async () => {
    try {
      const data = await base44.entities.Discovery.list("-created_date");
      setDiscoveries(data);
    } catch (error) {
      console.error("Failed to load discoveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewDiscovery = (discovery) => {
    setSelectedDiscovery(discovery);
  };

  const handleCloseReview = () => {
    setSelectedDiscovery(null);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-600 mb-4">
              You need administrator privileges to access this page.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Admin Dashboard
              </h1>
              <p className="text-lg text-slate-600">
                System-wide archaeological discoveries and user management
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Shield className="w-3 h-3 mr-1" />
              Administrator Access
            </Badge>
            <span className="text-slate-500">Logged in as {currentUser.full_name || currentUser.email}</span>
          </div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-sm flex-wrap h-auto gap-1 p-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="discoveries" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Discoveries
            </TabsTrigger>
            <TabsTrigger value="showcase" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Showcase
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverview discoveries={discoveries} />
          </TabsContent>

          <TabsContent value="discoveries" className="space-y-6">
            <AdminStats discoveries={discoveries} />
            
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
                      <Search className="w-6 h-6 text-blue-600" />
                      System-wide Discoveries
                      <Badge variant="outline">
                        {discoveries.length} total
                      </Badge>
                    </CardTitle>
                    <Button 
                      onClick={() => setShowSlideshowReview(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Slideshow Review
                    </Button>
                  </div>
                </CardHeader>
              <CardContent>
                <AdminFilters 
                  activeFilter={activeFilter} 
                  onFilterChange={setActiveFilter}
                  discoveries={discoveries}
                />
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDiscoveries.slice(0, 30).map((discovery, index) => (
                      <AdminDiscoveryCard 
                        key={discovery.id} 
                        discovery={discovery} 
                        index={index}
                        onUpdate={loadAllDiscoveries}
                        onReview={handleReviewDiscovery}
                      />
                    ))}
                  </div>
                )}
                {filteredDiscoveries.length > 30 && (
                  <p className="text-center text-slate-500 mt-4">
                    Showing 30 of {filteredDiscoveries.length} discoveries
                  </p>
                )}

                {!isLoading && filteredDiscoveries.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                      No discoveries found
                    </h3>
                    <p className="text-slate-500">
                      {activeFilter === "all" 
                        ? "No users have uploaded discoveries yet."
                        : "Try adjusting your filters to see more results."
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="showcase" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-600" />
                  Community Showcase Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Staff Picks</p>
                          <p className="text-2xl font-bold text-indigo-700">
                            {discoveries.filter(d => d.is_staff_pick).length}
                          </p>
                        </div>
                        <Award className="w-8 h-8 text-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">Featured</p>
                          <p className="text-2xl font-bold text-amber-700">
                            {discoveries.filter(d => d.is_featured).length}
                          </p>
                        </div>
                        <FileText className="w-8 h-8 text-amber-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <p className="text-slate-600">Use the Slideshow Review to manage Staff Picks and Featured discoveries.</p>
                <Button 
                  onClick={() => setShowSlideshowReview(true)}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Open Slideshow Review
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <MessageManagement />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <AdminMessaging />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <ModerationPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SiteSettings />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard discoveries={discoveries} />
          </TabsContent>
        </Tabs>

        {/* Review Panel Modal */}
          <AnimatePresence>
            {selectedDiscovery && (
              <ReviewPanel
                discovery={selectedDiscovery}
                onClose={handleCloseReview}
                onUpdate={loadAllDiscoveries}
              />
            )}
          </AnimatePresence>

          {/* Slideshow Review Modal */}
          <AnimatePresence>
            {showSlideshowReview && (
              <SlideshowReview
                discoveries={discoveries}
                onClose={() => setShowSlideshowReview(false)}
                onUpdate={loadAllDiscoveries}
              />
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}