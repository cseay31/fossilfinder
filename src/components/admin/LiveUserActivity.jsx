import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, Loader2, Eye, Clock, User, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function LiveUserActivity({ isDarkMode }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadActivities();
    }, 20000); // Refresh every 20 seconds (battery optimized)

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadActivities = async () => {
    try {
      const data = await base44.entities.UserActivity.list("-last_seen");
      
      // Filter to show only activities from last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentActivities = data.filter(a => {
        const lastSeen = new Date(a.last_seen);
        return lastSeen > fiveMinutesAgo;
      });
      
      setActivities(recentActivities);
    } catch (error) {
      console.error("Failed to load user activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPageIcon = (page) => {
    switch(page.toLowerCase()) {
      case 'upload': return '📸';
      case 'dashboard': return '🔍';
      case 'experts': return '👥';
      case 'education': return '📚';
      case 'multiscan': return '🎯';
      case 'forum': return '💬';
      case 'discoverymap': return '🗺️';
      case 'admin': return '⚡';
      default: return '📄';
    }
  };

  const isUserActive = (lastSeen) => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    return new Date(lastSeen) > thirtySecondsAgo;
  };

  const activeUsers = activities.filter(a => isUserActive(a.last_seen));
  const recentUsers = activities.filter(a => !isUserActive(a.last_seen));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-3`}>
                <Activity className="w-6 h-6 text-green-400" />
                Live User Activity
                <Badge className="bg-green-500">{activeUsers.length} Active Now</Badge>
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                Real-time monitoring of user sessions and actions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="outline"
                size="sm"
                className={autoRefresh ? 'bg-green-500/20 border-green-500' : ''}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={loadActivities}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-3 flex items-center gap-2`}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active Now ({activeUsers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeUsers.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${isDarkMode ? 'bg-slate-900/50 border-green-500/30' : 'bg-white border-green-200'} border-2`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
                        {activity.user_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} truncate`}>
                            {activity.user_name}
                          </h4>
                          <Badge className="bg-green-500 text-xs">LIVE</Badge>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} truncate mb-2`}>
                          {activity.user_email}
                        </p>
                        
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} space-y-2`}>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getPageIcon(activity.current_page)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                {activity.current_page}
                              </p>
                              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} truncate`}>
                                {activity.last_action}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-green-500">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(activity.last_seen), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Users */}
      {recentUsers.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-3 flex items-center gap-2`}>
            <Clock className="w-5 h-5 text-slate-400" />
            Recently Active ({recentUsers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUsers.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${isDarkMode ? 'bg-slate-900/30 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center text-white font-bold shrink-0">
                        {activity.user_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} truncate mb-1`}>
                          {activity.user_name}
                        </h4>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} truncate mb-2`}>
                          {activity.user_email}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getPageIcon(activity.current_page)}</span>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {activity.current_page}
                          </p>
                        </div>
                        
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          {formatDistanceToNow(new Date(activity.last_seen), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Activity */}
      {activities.length === 0 && !isLoading && (
        <Card className={isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}>
          <CardContent className="p-12 text-center">
            <Activity className={`w-16 h-16 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              No user activity detected in the last 5 minutes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}