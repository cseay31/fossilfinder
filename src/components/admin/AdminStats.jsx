import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminStats({ discoveries }) {
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
      description: "All uploaded findings",
      isClickable: true
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
    <>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-200 ${
                stat.isClickable ? 'cursor-pointer' : ''
              }`}
              onClick={stat.isClickable ? () => setShowPasswordBox(true) : undefined}
            >
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
    </>
  );
}