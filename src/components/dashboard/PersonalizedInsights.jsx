import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";

export default function PersonalizedInsights({ discoveries, user, isDarkMode }) {
  // Calculate insights
  const completedDiscoveries = discoveries.filter(d => d.analysis_status === 'completed');
  const analyzingDiscoveries = discoveries.filter(d => d.analysis_status === 'analyzing');
  const highSignificance = discoveries.filter(d => d.significance_level === 'high' || d.significance_level === 'exceptional');
  const recentDiscoveries = discoveries.filter(d => differenceInDays(new Date(), new Date(d.created_date)) <= 7);
  const multiScans = discoveries.filter(d => d.scan_results || d.classification?.startsWith('Multi-Scan'));
  
  // Calculate most common time period
  const timePeriods = completedDiscoveries
    .filter(d => d.time_period)
    .reduce((acc, d) => {
      acc[d.time_period] = (acc[d.time_period] || 0) + 1;
      return acc;
    }, {});
  const mostCommonPeriod = Object.entries(timePeriods).sort((a, b) => b[1] - a[1])[0];

  // Calculate average confidence
  const avgConfidence = completedDiscoveries.length > 0
    ? Math.round(completedDiscoveries.reduce((sum, d) => sum + (d.confidence_score || 0), 0) / completedDiscoveries.length)
    : 0;

  // Generate recommendations
  const recommendations = [];
  
  if (discoveries.length === 0) {
    recommendations.push({
      type: 'start',
      icon: Target,
      title: 'Start Your Journey',
      message: 'Upload your first discovery to begin building your collection!',
      action: { label: 'Upload Photo', url: 'Upload' }
    });
  }
  
  if (highSignificance.length > 0 && !highSignificance.some(d => d.analysis_status === 'sent_to_expert')) {
    recommendations.push({
      type: 'expert',
      icon: Star,
      title: 'Expert Review Recommended',
      message: `You have ${highSignificance.length} high-significance ${highSignificance.length === 1 ? 'discovery' : 'discoveries'} that may benefit from expert review.`,
      action: { label: 'Find Experts', url: 'Experts' }
    });
  }

  if (multiScans.length === 0 && discoveries.length >= 3) {
    recommendations.push({
      type: 'feature',
      icon: Sparkles,
      title: 'Try Multi-Scan',
      message: 'Use Multi-Scan to analyze multiple rocks at once and highlight points of interest.',
      action: { label: 'Try It', url: 'MultiScan' }
    });
  }

  if (recentDiscoveries.length === 0 && discoveries.length > 0) {
    recommendations.push({
      type: 'activity',
      icon: Calendar,
      title: 'Keep Exploring',
      message: "You haven't uploaded any discoveries this week. Time to get back in the field!",
      action: { label: 'Upload Now', url: 'Upload' }
    });
  }

  // Alerts
  const alerts = [];
  
  if (analyzingDiscoveries.length > 0) {
    alerts.push({
      type: 'info',
      icon: TrendingUp,
      message: `${analyzingDiscoveries.length} ${analyzingDiscoveries.length === 1 ? 'discovery is' : 'discoveries are'} currently being analyzed.`
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User Stats Summary */}
      <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'} backdrop-blur-xl shadow-lg`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-stone-800'} flex items-center gap-2`}>
            <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
            Your Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{discoveries.length}</p>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Total Discoveries</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{highSignificance.length}</p>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>High Significance</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>{avgConfidence}%</p>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Avg Confidence</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{recentDiscoveries.length}</p>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>This Week</p>
            </div>
          </div>
          
          {mostCommonPeriod && (
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'} mb-1`}>Most Common Period</p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{mostCommonPeriod[0]}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts & Status */}
      <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-stone-800'} flex items-center gap-2`}>
            <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            Alerts & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 && discoveries.length > 0 && (
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
              <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>All discoveries analyzed!</p>
            </div>
          )}
          
          {alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}
            >
              <alert.icon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{alert.message}</p>
            </div>
          ))}

          {highSignificance.length > 0 && (
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
              <Star className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                {highSignificance.length} notable {highSignificance.length === 1 ? 'find' : 'finds'} in your collection!
              </p>
            </div>
          )}

          {discoveries.length === 0 && (
            <div className={`text-center py-4 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              <p className="text-sm">No activity yet. Start by uploading your first discovery!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'} backdrop-blur-xl shadow-lg`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-stone-800'} flex items-center gap-2`}>
            <Lightbulb className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length === 0 ? (
            <div className={`text-center py-4 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
              <p className="text-sm">You're doing great! Keep exploring.</p>
            </div>
          ) : (
            recommendations.slice(0, 3).map((rec, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}
              >
                <div className="flex items-start gap-3">
                  <rec.icon className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{rec.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'} mt-1`}>{rec.message}</p>
                    {rec.action && (
                      <Button asChild size="sm" variant="link" className={`p-0 h-auto mt-2 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`}>
                        <Link to={createPageUrl(rec.action.url)}>
                          {rec.action.label} →
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}