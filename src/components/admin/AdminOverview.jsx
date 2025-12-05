import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Search, MessageSquare, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, Star, Activity, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, isAfter } from 'date-fns';

export default function AdminOverview({ discoveries }) {
  const [users, setUsers] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [usersData, postsData, commentsData, messagesData] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.ForumPost.list('-created_date', 100),
        base44.entities.DiscoveryComment.list('-created_date', 100),
        base44.entities.ContactMessage.filter({ status: 'new' })
      ]);
      setUsers(usersData);
      setForumPosts(postsData);
      setComments(commentsData);
      setMessages(messagesData);
    } catch (error) {
      console.error("Failed to load overview data:", error);
    }
  };

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
    forumPosts: forumPosts.length,
    forumPostsThisWeek: forumPosts.filter(p => isAfter(new Date(p.created_date), last7Days)).length,
    totalComments: comments.length,
    pendingMessages: messages.length,
    totalLikes: discoveries.reduce((sum, d) => sum + (d.likes || 0), 0)
  };

  const StatCard = ({ icon: Icon, iconColor, bgColor, title, value, subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl ${bgColor}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          </div>
          {trend && (
            <div className="mt-3 flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          title="Total Users"
          value={stats.totalUsers}
        />
        <StatCard
          icon={Search}
          iconColor="text-amber-600"
          bgColor="bg-amber-100"
          title="Total Discoveries"
          value={stats.totalDiscoveries}
          subtitle={`+${stats.newToday} today`}
          trend={`+${stats.newThisWeek} this week`}
        />
        <StatCard
          icon={MessageSquare}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-100"
          title="Forum Posts"
          value={stats.forumPosts}
          subtitle={`+${stats.forumPostsThisWeek} this week`}
        />
        <StatCard
          icon={Activity}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          title="Total Engagement"
          value={stats.totalLikes + stats.totalComments}
          subtitle={`${stats.totalLikes} likes, ${stats.totalComments} comments`}
        />
      </div>

      {/* Discovery Status & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-600" />
              Discovery Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">Currently Analyzing</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">{stats.analyzingCount}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-slate-700">Completed</span>
              </div>
              <Badge className="bg-green-100 text-green-800">{stats.completedCount}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="text-slate-700">Exceptional Finds</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">{stats.exceptionalCount}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-600" />
                <span className="text-slate-700">High Significance</span>
              </div>
              <Badge className="bg-amber-100 text-amber-800">{stats.highSignificance}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Requires Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingMessages > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-600" />
                  <span className="text-slate-700">Unread Contact Messages</span>
                </div>
                <Badge className="bg-red-100 text-red-800">{stats.pendingMessages}</Badge>
              </div>
            )}
            {stats.analyzingCount > 5 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-slate-700">High Analysis Queue</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">{stats.analyzingCount} pending</Badge>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">Staff Picks</span>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800">{stats.staffPicks}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-600" />
                <span className="text-slate-700">Featured Discoveries</span>
              </div>
              <Badge className="bg-amber-100 text-amber-800">{stats.featured}</Badge>
            </div>
            {stats.pendingMessages === 0 && stats.analyzingCount <= 5 && (
              <div className="flex items-center justify-center p-6 text-slate-500">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                All caught up! No urgent items.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}