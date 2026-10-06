import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminStats({ discoveries }) {
  const totalDiscoveries = discoveries.length;
  const uniqueUsers = new Set(discoveries.map(d => d.created_by)).size;
  const analyzingCount = discoveries.filter(d => d.analysis_status === 'analyzing').length;
  const completedCount = discoveries.filter(d => d.analysis_status === 'completed').length;
  const highSignificanceCount = discoveries.filter(d => d.significance_level === 'high' || d.significance_level === 'exceptional').length;
  const lowConfidenceCount = discoveries.filter(d => d.confidence_score && d.confidence_score < 60).length;

  const stats = [
    {
      title: "Total Discoveries",
      value: totalDiscoveries,
      icon: Search,
      color: "from-blue-500 to-blue-600",
      description: "All uploaded findings"
    },
    {
      title: "Active Users",
      value: uniqueUsers,
      icon: Users,
      color: "from-green-500 to-emerald-600",
      description: "Users with discoveries"
    },
    {
      title: "Under Analysis",
      value: analyzingCount,
      icon: Clock,
      color: "from-yellow-500 to-orange-600",
      description: "Currently processing"
    },
    {
      title: "Completed",
      value: completedCount,
      icon: CheckCircle,
      color: "from-emerald-500 to-green-600",
      description: "Analysis finished"
    },
    {
      title: "High Significance",
      value: highSignificanceCount,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      description: "Potentially important finds"
    },
    {
      title: "Needs Review",
      value: lowConfidenceCount,
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      description: "Low confidence scores"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500">
                    {stat.description}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}