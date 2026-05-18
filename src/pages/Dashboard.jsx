import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, MapPin, TrendingUp, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import DiscoveryCard from "../components/dashboard/DiscoveryCard";
import StatsOverview from "../components/dashboard/StatsOverview";
import FilterBar from "../components/dashboard/FilterBar";
import PersonalizedInsights from "../components/dashboard/PersonalizedInsights";
import RecentActivity from "../components/dashboard/RecentActivity";
import ShellLoader from "../components/admin/ShellLoader";
import StreakTracker from "../components/engagement/StreakTracker";
import DailyChallenge from "../components/engagement/DailyChallenge";
import PullToRefresh from "../components/mobile/PullToRefresh";

export default function Dashboard({ isDarkMode }) {
  const [discoveries, setDiscoveries] = useState([]);
  const [filteredDiscoveries, setFilteredDiscoveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadDiscoveries();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  useEffect(() => {
    let filtered = discoveries;
    
    switch (activeFilter) {
      case "analyzing":
        filtered = discoveries.filter(d => d.analysis_status === "analyzing");
        break;
      case "completed":
        filtered = discoveries.filter(d => d.analysis_status === "completed");
        break;
      case "multi-scan":
        filtered = discoveries.filter(d => d.scan_results);
        break;
      case "high-confidence":
        filtered = discoveries.filter(d => d.confidence_score && d.confidence_score >= 80);
        break;
      case "significant":
        filtered = discoveries.filter(d => d.significance_level === "high" || d.significance_level === "exceptional");
        break;
      default:
        filtered = discoveries;
    }
    
    setFilteredDiscoveries(filtered);
  }, [discoveries, activeFilter]);

  const loadDiscoveries = async () => {
    try {
      const data = await base44.entities.Discovery.list("-created_date");
      setDiscoveries(data);
    } catch (error) {
      console.error("Failed to load discoveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8 pb-safe-bottom`}>
      <PullToRefresh onRefresh={loadDiscoveries} isDarkMode={isDarkMode}>
        <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'} mb-2`}>
            {currentUser ? `Welcome, ${currentUser.full_name?.split(' ')[0] || 'Explorer'}!` : 'Dashboard'}
          </h1>
          <p className={`text-sm md:text-lg ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
            Track your findings
          </p>
        </motion.div>

        <div className="space-y-4 md:space-y-6">
          {/* Engagement Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <StreakTracker isDarkMode={isDarkMode} />
            <DailyChallenge isDarkMode={isDarkMode} />
          </div>

          {/* Personalized Insights */}
          <PersonalizedInsights discoveries={discoveries} user={currentUser} isDarkMode={isDarkMode} />

          {/* Recent Activity */}
          <RecentActivity 
            discoveries={discoveries} 
            isDarkMode={isDarkMode} 
            currentUser={currentUser}
            onUpdate={(updated) => {
              setDiscoveries(discoveries.map(d => d.id === updated.id ? updated : d));
            }}
          />

          <StatsOverview discoveries={discoveries} isDarkMode={isDarkMode} />

          <Card 
            data-discoveries-section
            className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}
          >
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-stone-800'} flex items-center gap-3`}>
                  <Search className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
                  Your Discoveries
                </CardTitle>
                <a
                  href={base44.agents.getWhatsAppConnectURL('discovery_documenter')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              
              {isLoading ? (
                <ShellLoader isLoading={isLoading} message="Loading your discoveries..." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredDiscoveries.map((discovery, index) => (
                    <DiscoveryCard 
                      key={discovery.id} 
                      discovery={discovery} 
                      index={index}
                      currentUser={currentUser}
                      onUpdate={(updated) => {
                        setDiscoveries(discoveries.map(d => d.id === updated.id ? updated : d));
                      }}
                    />
                  ))}
                </div>
              )}

              {!isLoading && filteredDiscoveries.length === 0 && (
                <div className="text-center py-12">
                  <Search className={`w-16 h-16 ${isDarkMode ? 'text-slate-600' : 'text-stone-300'} mx-auto mb-4`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-stone-600'} mb-2`}>
                    No discoveries found
                  </h3>
                  <p className={isDarkMode ? 'text-slate-500' : 'text-stone-500'}>
                    {activeFilter === "all" 
                      ? "Upload your first archaeological photo to get started!"
                      : "Try adjusting your filters to see more results."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </PullToRefresh>
    </div>
  );
}