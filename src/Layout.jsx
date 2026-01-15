import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import ActivityTracker from "./components/tracking/ActivityTracker";
import LoadingScreen from "./components/layout/LoadingScreen";
import InitialLoadingScreen from "./components/layout/InitialLoadingScreen";
import { Camera, Search, FileText, Users, Compass, Shield, MessageSquare, MessageCircle, Map, Ban, ScanLine, Target, Trophy, Wrench, TrendingUp, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import AnnouncementBanner from "./components/layout/AnnouncementBanner";

import ModerationNotification from "./components/layout/ModerationNotification";
import AdminMessageBanner from "./components/dashboard/AdminMessageBanner";
import ModerationWatcher from "./components/layout/ModerationWatcher";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [discoveries, setDiscoveries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    loadDiscoveries();
    loadCurrentUser();
    checkMaintenanceMode();
    
    // Hide initial loading screen after 9 seconds
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 9000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const checkMaintenanceMode = async () => {
    try {
      const settings = await base44.entities.AppSettings.list();
      if (settings.length > 0 && settings[0].maintenance_mode) {
        setMaintenanceMode(true);
        setMaintenanceMessage(settings[0].maintenance_message || 'Site is currently under maintenance.');
      }
    } catch (error) {
      console.error("Failed to check maintenance mode:", error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load current user:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadDiscoveries = async () => {
    try {
      const data = await base44.entities.Discovery.list();
      setDiscoveries(data);
    } catch (error) {
      console.error("Failed to load discoveries for stats:", error);
    }
  };

  // Check maintenance mode (non-admin users only)
  if (!isLoadingUser && maintenanceMode && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-orange-800 mb-3">
              Site Maintenance
            </h1>
            <Alert className="border-orange-200 bg-orange-50 mb-4">
              <Wrench className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                {maintenanceMessage}
              </AlertDescription>
            </Alert>
            <p className="text-slate-600 mb-6">
              We'll be back shortly. Thank you for your patience!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is banned
  if (!isLoadingUser && currentUser?.is_banned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-3">
              Account Suspended
            </h1>
            <Alert className="border-red-200 bg-red-50 mb-4">
              <Ban className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Your account has been suspended by an administrator.
              </AlertDescription>
            </Alert>
            {currentUser.ban_reason && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-red-700 mb-2">Reason:</p>
                <p className="text-sm text-red-900">{currentUser.ban_reason}</p>
              </div>
            )}
            <p className="text-slate-600 mb-6">
              If you believe this is a mistake, please contact an administrator through alternative means.
            </p>
            <Button
              onClick={() => base44.auth.logout()}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      title: "Analyze Photo",
      url: createPageUrl("Upload"),
      icon: Camera,
    },
    {
      title: "Discoveries",
      url: createPageUrl("Dashboard"),
      icon: Search,
    },
    {
      title: "Experts",
      url: createPageUrl("Experts"),
      icon: Users,
    },
    {
      title: "Education",
      url: createPageUrl("Education"),
      icon: FileText,
    },
    {
      title: "Multi-Scan",
      url: createPageUrl("MultiScan"),
      icon: ScanLine,
    },
    {
      title: "FosFeed",
      url: createPageUrl("FosFeed"),
      icon: TrendingUp,
    },
                  {
                    title: "Discovery Map",
                    url: createPageUrl("DiscoveryMap"),
                    icon: Map,
                  },
    {
      title: "Wiki",
      url: createPageUrl("Wiki"),
      icon: FileText,
    },
    ];

  // Add admin navigation for admin users
  if (currentUser?.role === 'admin') {
    navigationItems.push({
      title: "Admin Panel",
      url: createPageUrl("Admin"),
      icon: Shield,
    });
  }

  const totalDiscoveries = discoveries.length;
  const analyzingCount = discoveries.filter(d => d.analysis_status === 'analyzing').length;

  return (
    <SidebarProvider>
      <ActivityTracker />
      <ModerationWatcher currentUser={currentUser} />
      {isInitialLoad && <InitialLoadingScreen />}
      {isLoading && <LoadingScreen />}
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            <div className="absolute top-10 left-1/2 w-72 h-72 bg-purple-500/15 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          </div>
        </div>
        <style>
          {`
            :root {
              --sidebar-background: 15 23 42;
              --sidebar-foreground: 226 232 240;
              --sidebar-primary: 99 102 241;
              --sidebar-primary-foreground: 255 255 255;
              --sidebar-accent: 30 41 59;
              --sidebar-accent-foreground: 226 232 240;
              --sidebar-border: 51 65 85;
              --sidebar-ring: 99 102 241;
            }
          `}
        </style>
        
        <Sidebar className="border-r border-white/5 bg-slate-900/80 backdrop-blur-3xl z-10 shadow-2xl shadow-black/50">
          <SidebarHeader className="border-b border-white/5 p-6 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg drop-shadow-lg">FossilFinder</h2>
                <p className="text-xs text-cyan-300/70 font-medium">Archaeological AI Analysis</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-white/60 uppercase tracking-wider px-3 py-3">
                Analysis Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-white/5 transition-all duration-200 rounded-xl mb-1 font-medium ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white shadow-lg shadow-cyan-500/10 border border-cyan-500/20' 
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3 bg-slate-950/40 rounded-lg mx-2 border border-white/5">
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">Total Discoveries</span>
                    <span className="ml-auto font-bold text-white">{totalDiscoveries}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Search className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-300">Under Analysis</span>
                    <span className="ml-auto font-bold text-cyan-400">{analyzingCount}</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/5 p-4 space-y-3 bg-slate-950/50">
            {/* Contact Admin Button */}
            <SidebarMenuButton 
              asChild 
              className={`hover:bg-white/5 transition-all duration-200 rounded-xl font-medium ${
                location.pathname === createPageUrl("Contact")
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white shadow-lg border border-cyan-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Link to={createPageUrl("Contact")} className="flex items-center gap-3 px-3 py-3">
                <MessageSquare className="w-5 h-5" />
                <span>Contact Admin</span>
              </Link>
            </SidebarMenuButton>

            {/* User Profile */}
            <div className="flex items-center gap-3 bg-slate-950/60 rounded-xl p-2 border border-white/5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
                currentUser?.role === 'admin' 
                  ? 'bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-cyan-500/50'
                  : 'bg-gradient-to-br from-slate-500 to-slate-700'
              }`}>
                {currentUser?.role === 'admin' ? (
                  <Shield className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {currentUser?.full_name?.[0] || currentUser?.email?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate drop-shadow-lg">
                  {currentUser?.full_name || 'User'}
                  {currentUser?.role === 'admin' && (
                    <span className="text-xs ml-1 text-cyan-300">(Admin)</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {currentUser?.role === 'admin' ? 'System Administrator' : 'Field Analyst'}
                </p>
                </div>
                </div>

                {/* Logout Button */}
                <Button
                onClick={() => base44.auth.logout()}
                variant="outline"
                className="w-full bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300"
                >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
                </Button>

                {/* Copyright */}
                <p className="text-xs text-slate-500 text-center font-bold">© Connor Seay 2025, All rights reserved</p>
                </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col relative z-10">
          <AnnouncementBanner />
          <ModerationNotification />
          <AdminMessageBanner />

          {/* Floating Mobile Menu Button */}
          <div className="md:hidden fixed bottom-6 right-6 z-50">
            <SidebarTrigger className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-xl border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </SidebarTrigger>
          </div>

          <header className="bg-slate-900/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-white/10 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-white drop-shadow-lg">FossilFinder</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}