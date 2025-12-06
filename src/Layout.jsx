import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import ActivityTracker from "./components/tracking/ActivityTracker";
import { Camera, Search, FileText, Users, Compass, Shield, MessageSquare, MessageCircle, Map, Ban, ScanLine, Target, Moon, Sun, Trophy, Wrench } from "lucide-react";
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

export default function Layout({ children, currentPageName }) {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fossilfinder-theme');
      return saved === null ? true : saved === 'dark';
    }
    return true;
  });

  React.useEffect(() => {
    localStorage.setItem('fossilfinder-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  const location = useLocation();
  const [discoveries, setDiscoveries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    loadDiscoveries();
    loadCurrentUser();
    checkMaintenanceMode();
  }, []);

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
                    title: "Scan Results",
                    url: createPageUrl("MultiScanDiscoveries"),
                    icon: Target,
                  },
                  {
                              title: "Community",
                              url: createPageUrl("CommunityShowcase"),
                              icon: Trophy,
                            },
                  {
                    title: "Forum",
                    url: createPageUrl("Forum"),
                    icon: MessageCircle,
                  },
        {
          title: "Discovery Map",
          url: createPageUrl("DiscoveryMap"),
          icon: Map,
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
      <div className={`min-h-screen flex w-full ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-amber-50 to-stone-100'}`}>
        {/* Northern Lights Background for Dark Mode */}
        {isDarkMode && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
              <div className="absolute top-10 left-1/2 w-72 h-72 bg-purple-500/15 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
              <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '3s' }} />
            </div>
          </div>
        )}
        <style>
          {isDarkMode ? `
            :root {
              --sidebar-background: 15 23 42;
              --sidebar-foreground: 203 213 225;
              --sidebar-primary: 34 211 238;
              --sidebar-primary-foreground: 15 23 42;
              --sidebar-accent: 30 41 59;
              --sidebar-accent-foreground: 203 213 225;
              --sidebar-border: 51 65 85;
              --sidebar-ring: 34 211 238;
            }
          ` : `
            :root {
              --sidebar-background: 255 255 255;
              --sidebar-foreground: 92 73 60;
              --sidebar-primary: 120 82 54;
              --sidebar-primary-foreground: 255 255 255;
              --sidebar-accent: 245 232 213;
              --sidebar-accent-foreground: 92 73 60;
              --sidebar-border: 229 216 196;
              --sidebar-ring: 120 82 54;
            }
          `}
        </style>
        
        <Sidebar className={`border-r ${isDarkMode ? 'border-white/10 bg-slate-900/60' : 'border-stone-200 bg-white/80'} backdrop-blur-xl z-10`}>
          <SidebarHeader className={`border-b ${isDarkMode ? 'border-white/10' : 'border-stone-200'} p-6`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500 to-emerald-600' : 'bg-gradient-to-br from-amber-600 to-stone-700'} rounded-xl flex items-center justify-center shadow-lg`}>
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'} text-lg`}>FossilFinder</h2>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-300/70' : 'text-stone-500'} font-medium`}>Archaeological AI Analysis</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-stone-600'} uppercase tracking-wider px-3 py-3`}>
                Analysis Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-amber-50 hover:text-amber-800'} transition-all duration-200 rounded-xl mb-1 font-medium ${
                            location.pathname === item.url 
                              ? isDarkMode 
                                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 shadow-sm border border-cyan-500/30' 
                                : 'bg-gradient-to-r from-amber-100 to-stone-100 text-amber-800 shadow-sm'
                              : isDarkMode
                                ? 'text-slate-300 hover:text-cyan-300'
                                : item.title === "Admin Panel" 
                                  ? 'text-blue-700 hover:bg-blue-50 hover:text-blue-800'
                                  : item.title === "Multi-Scan" || item.title === "Scan Results"
                                        ? 'text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800'
                                        : item.title === "Forum"
                                          ? 'text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800'
                                          : item.title === "Discovery Map"
                                            ? 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                                            : 'text-stone-700'
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
              <SidebarGroupLabel className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-stone-600'} uppercase tracking-wider px-3 py-3`}>
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className={`px-3 py-2 space-y-3 ${isDarkMode ? 'bg-white/5 rounded-lg mx-2' : ''}`}>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400/60' : 'text-stone-400'}`} />
                    <span className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>Total Discoveries</span>
                    <span className={`ml-auto font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{totalDiscoveries}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Search className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400/60' : 'text-stone-400'}`} />
                    <span className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>Under Analysis</span>
                    <span className={`ml-auto font-bold ${isDarkMode ? 'text-emerald-400' : 'text-amber-600'}`}>{analyzingCount}</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className={`border-t ${isDarkMode ? 'border-white/10' : 'border-stone-200'} p-4 space-y-3`}>
            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-2">
              <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                {isDarkMode ? 'Northern Lights' : 'Light Mode'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`rounded-full w-9 h-9 p-0 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-300' 
                    : 'bg-stone-100 hover:bg-stone-200 text-amber-600'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>

            {/* Copyright */}
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-stone-400'} text-center font-bold`}>© Connor Seay 2025, All rights reserved</p>

            {/* Contact Admin Button */}
            <SidebarMenuButton 
              asChild 
              className={`${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-blue-50 hover:text-blue-800'} transition-all duration-200 rounded-xl font-medium ${
                location.pathname === createPageUrl("Contact")
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-sm'
                  : isDarkMode ? 'text-slate-300' : 'text-stone-700'
              }`}
            >
              <Link to={createPageUrl("Contact")} className="flex items-center gap-3 px-3 py-3">
                <MessageSquare className="w-5 h-5" />
                <span>Contact Admin</span>
              </Link>
            </SidebarMenuButton>

            {/* User Profile */}
            <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-white/5 rounded-xl p-2' : ''}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                currentUser?.role === 'admin' 
                  ? isDarkMode ? 'bg-gradient-to-br from-cyan-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : isDarkMode ? 'bg-gradient-to-br from-slate-500 to-slate-600' : 'bg-gradient-to-br from-stone-400 to-stone-500'
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
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-800'} text-sm truncate`}>
                  {currentUser?.full_name || 'User'}
                  {currentUser?.role === 'admin' && (
                    <span className={`text-xs ml-1 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>(Admin)</span>
                  )}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'} truncate`}>
                  {currentUser?.role === 'admin' ? 'System Administrator' : 'Field Analyst'}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col relative z-10">
          <AnnouncementBanner />
          <ModerationNotification />
          <AdminMessageBanner />

          <header className={`${isDarkMode ? 'bg-slate-900/70 border-white/10' : 'bg-white/70 border-stone-200'} backdrop-blur-sm border-b px-6 py-4 md:hidden`}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className={`${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-stone-100'} p-2 rounded-lg transition-colors duration-200`} />
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>FossilFinder</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {React.cloneElement(children, { isDarkMode })}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}