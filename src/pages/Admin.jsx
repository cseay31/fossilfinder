
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Search, TrendingUp, Calendar, AlertTriangle, MessageSquare, Gavel, Megaphone } from "lucide-react";
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

export default function AdminPage() {
  const [discoveries, setDiscoveries] = useState([]);
  const [filteredDiscoveries, setFilteredDiscoveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);

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

        <Tabs defaultValue="discoveries" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-sm">
            <TabsTrigger value="discoveries" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              All Discoveries
            </TabsTrigger>
            <TabsTrigger value="dashboard-messages" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Dashboard Messages
            </TabsTrigger>
            <TabsTrigger value="contact-messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Contact Messages
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Site Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discoveries" className="space-y-6">
            <AdminStats discoveries={discoveries} />
            
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
                  <Search className="w-6 h-6 text-blue-600" />
                  System-wide Discoveries
                  <Badge variant="outline" className="ml-auto">
                    {discoveries.length} total
                  </Badge>
                </CardTitle>
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
                    {filteredDiscoveries.map((discovery, index) => (
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

          <TabsContent value="dashboard-messages" className="space-y-6">
            <AdminMessaging />
          </TabsContent>

          <TabsContent value="contact-messages" className="space-y-6">
            <MessageManagement />
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
      </div>
    </div>
  );
}
