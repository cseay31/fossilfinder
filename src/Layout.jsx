import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Camera, Search, FileText, Users, Compass, Shield, MessageSquare, BookOpen, Ban } from "lucide-react";
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
  const location = useLocation();
  const [discoveries, setDiscoveries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    loadDiscoveries();
    loadCurrentUser();
  }, []);

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
      title: "Wiki",
      url: createPageUrl("Wiki"),
      icon: BookOpen,
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-amber-50 to-stone-100">
        <style>
          {`
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
        
        <Sidebar className="border-r border-stone-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-stone-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-stone-700 rounded-xl flex items-center justify-center shadow-lg">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-stone-800 text-lg">FossilFinder</h2>
                <p className="text-xs text-stone-500 font-medium">Archaeological AI Analysis</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-stone-600 uppercase tracking-wider px-3 py-3">
                Analysis Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-amber-50 hover:text-amber-800 transition-all duration-200 rounded-xl mb-1 font-medium ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-amber-100 to-stone-100 text-amber-800 shadow-sm' 
                            : item.title === "Admin Panel" 
                              ? 'text-blue-700 hover:bg-blue-50 hover:text-blue-800'
                              : item.title === "Wiki"
                                ? 'text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800'
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
              <SidebarGroupLabel className="text-xs font-semibold text-stone-600 uppercase tracking-wider px-3 py-3">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-600">Total Discoveries</span>
                    <span className="ml-auto font-bold text-stone-800">{totalDiscoveries}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Search className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-600">Under Analysis</span>
                    <span className="ml-auto font-bold text-amber-600">{analyzingCount}</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-stone-200 p-4 space-y-3">
            {/* Copyright */}
            <p className="text-xs text-stone-400 text-center font-bold">© Connor Seay 2025, All rights reserved</p>

            {/* Contact Admin Button */}
            <SidebarMenuButton 
              asChild 
              className={`hover:bg-blue-50 hover:text-blue-800 transition-all duration-200 rounded-xl font-medium ${
                location.pathname === createPageUrl("Contact")
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-sm' 
                  : 'text-stone-700'
              }`}
            >
              <Link to={createPageUrl("Contact")} className="flex items-center gap-3 px-3 py-3">
                <MessageSquare className="w-5 h-5" />
                <span>Contact Admin</span>
              </Link>
            </SidebarMenuButton>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                currentUser?.role === 'admin' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                  : 'bg-gradient-to-br from-stone-400 to-stone-500'
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
                <p className="font-semibold text-stone-800 text-sm truncate">
                  {currentUser?.full_name || 'User'}
                  {currentUser?.role === 'admin' && (
                    <span className="text-xs ml-1 text-blue-600">(Admin)</span>
                  )}
                </p>
                <p className="text-xs text-stone-500 truncate">
                  {currentUser?.role === 'admin' ? 'System Administrator' : 'Field Analyst'}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <AnnouncementBanner />
          <ModerationNotification />
          <AdminMessageBanner />
          
          <header className="bg-white/70 backdrop-blur-sm border-b border-stone-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-stone-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-stone-800">FossilFinder</h1>
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