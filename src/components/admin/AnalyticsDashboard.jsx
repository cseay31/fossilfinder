import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Camera, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Activity,
  X
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AnalyticsDashboard({ discoveries }) {
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [password, setPassword] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const handlePasswordSubmit = () => {
    if (password.toLowerCase() === "connor") {
      setShowSecret(true);
      setShowPasswordBox(false);
      setPassword("");
    } else {
      setPassword("");
    }
  };

  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  // Calculate analytics data
  const analytics = useMemo(() => {
    const uniqueUsers = new Set(discoveries.map(d => d.created_by)).size;
    
    // Status breakdown
    const statusBreakdown = discoveries.reduce((acc, d) => {
      const status = d.analysis_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Significance breakdown
    const significanceBreakdown = discoveries.reduce((acc, d) => {
      const sig = d.significance_level || 'unknown';
      acc[sig] = (acc[sig] || 0) + 1;
      return acc;
    }, {});

    // Confidence score ranges
    const confidenceRanges = {
      'High (80-100%)': 0,
      'Medium (60-79%)': 0,
      'Low (0-59%)': 0
    };
    discoveries.forEach(d => {
      if (d.confidence_score >= 80) confidenceRanges['High (80-100%)']++;
      else if (d.confidence_score >= 60) confidenceRanges['Medium (60-79%)']++;
      else if (d.confidence_score) confidenceRanges['Low (0-59%)']++;
    });

    // Discoveries over last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM dd'),
        count: discoveries.filter(d => {
          const createdDate = new Date(d.created_date);
          return isWithinInterval(createdDate, {
            start: startOfDay(date),
            end: endOfDay(date)
          });
        }).length
      };
    });

    // Average confidence score
    const validConfidenceScores = discoveries
      .filter(d => d.confidence_score)
      .map(d => d.confidence_score);
    const avgConfidence = validConfidenceScores.length > 0
      ? Math.round(validConfidenceScores.reduce((a, b) => a + b, 0) / validConfidenceScores.length)
      : 0;

    return {
      uniqueUsers,
      statusBreakdown,
      significanceBreakdown,
      confidenceRanges,
      last7Days,
      avgConfidence
    };
  }, [discoveries]);

  // Chart colors
  const COLORS = {
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
    gray: '#6b7280'
  };

  const statusColors = {
    analyzing: COLORS.blue,
    completed: COLORS.green,
    sent_to_expert: COLORS.purple,
    verified: COLORS.green
  };

  const significanceColors = {
    low: COLORS.gray,
    medium: COLORS.yellow,
    high: COLORS.red,
    exceptional: COLORS.purple
  };

  // Prepare pie chart data
  const statusPieData = Object.entries(analytics.statusBreakdown).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: statusColors[status] || COLORS.gray
  }));

  const significancePieData = Object.entries(analytics.significanceBreakdown).map(([sig, count]) => ({
    name: sig.charAt(0).toUpperCase() + sig.slice(1),
    value: count,
    color: significanceColors[sig] || COLORS.gray
  }));

  const confidenceBarData = Object.entries(analytics.confidenceRanges).map(([range, count]) => ({
    range,
    count
  }));

  return (
    <div className="space-y-6">
      {/* Password Box Modal */}
      <AnimatePresence>
        {showPasswordBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowPasswordBox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Enter Password</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowPasswordBox(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="password"
                  maxLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handlePasswordKeyPress}
                  placeholder="6 characters"
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                <Button 
                  onClick={handlePasswordSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret Display */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSecret(false)}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center"
            >
              <div className="text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 leading-none">
                67
              </div>
              <p className="text-white text-2xl mt-8">Click anywhere to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card 
            className="bg-white/80 backdrop-blur-sm shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setShowPasswordBox(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Total Discoveries
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {discoveries.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {analytics.uniqueUsers}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Avg Confidence
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {analytics.avgConfidence}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Analyzing
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {analytics.statusBreakdown.analyzing || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discoveries Over Time */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Discoveries Over Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={COLORS.blue} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.blue, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence Score Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Confidence Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confidenceBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill={COLORS.green} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Significance Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Significance Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={significancePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {significancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}