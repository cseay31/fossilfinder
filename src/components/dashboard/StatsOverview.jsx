import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Search, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsOverview({ discoveries }) {
  const totalDiscoveries = discoveries.length;
  const analyzingCount = discoveries.filter(d => d.analysis_status === 'analyzing').length;
  const highConfidenceCount = discoveries.filter(d => d.confidence_score && d.confidence_score >= 80).length;
  const significantCount = discoveries.filter(d => d.significance_level === 'high' || d.significance_level === 'exceptional').length;

  const stats = [
    {
      title: "Total Discoveries",
      value: totalDiscoveries,
      icon: Camera,
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "Under Analysis",
      value: analyzingCount,
      icon: Search,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "High Confidence",
      value: highConfidenceCount,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Significant Finds",
      value: significantCount,
      icon: Users,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-stone-800">
                    {stat.value}
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