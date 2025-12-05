import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ChevronRight, Camera, Target, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, formatDistanceToNow } from "date-fns";

export default function RecentActivity({ discoveries, isDarkMode }) {
  const recentItems = discoveries.slice(0, 5);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSignificanceBadge = (level) => {
    const styles = {
      exceptional: 'bg-purple-100 text-purple-800 border-purple-200',
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return styles[level] || styles.medium;
  };

  if (recentItems.length === 0) {
    return (
      <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
        <CardHeader>
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-stone-800'} flex items-center gap-2`}>
            <Clock className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Camera className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-stone-300'}`} />
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>No recent activity</p>
            <Button asChild className="mt-4" size="sm">
              <Link to={createPageUrl("Upload")}>Upload Your First Discovery</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-stone-800'} flex items-center gap-2`}>
            <Clock className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
            Recent Activity
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className={isDarkMode ? 'text-cyan-400' : 'text-amber-600'}>
            <Link to={createPageUrl("Dashboard")}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentItems.map((discovery) => {
            const isMultiScan = discovery.scan_results || discovery.classification?.startsWith('Multi-Scan');
            
            return (
              <div 
                key={discovery.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-800/70' : 'bg-stone-50 hover:bg-stone-100'} transition-colors cursor-pointer`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-stone-200">
                  {discovery.photo_url ? (
                    <img 
                      src={discovery.photo_url} 
                      alt={discovery.classification || 'Discovery'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-5 h-5 text-stone-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(discovery.analysis_status)}
                    <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                      {discovery.classification || 'Analyzing...'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                      {formatDistanceToNow(new Date(discovery.created_date), { addSuffix: true })}
                    </span>
                    {discovery.significance_level && (
                      <Badge className={`text-xs py-0 ${getSignificanceBadge(discovery.significance_level)}`}>
                        {discovery.significance_level}
                      </Badge>
                    )}
                    {isMultiScan && (
                      <Badge variant="outline" className="text-xs py-0 border-cyan-300 text-cyan-700">
                        <Target className="w-3 h-3 mr-1" />
                        Scan
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Confidence */}
                {discovery.confidence_score && (
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      discovery.confidence_score >= 80 
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : discovery.confidence_score >= 50 
                          ? isDarkMode ? 'text-amber-400' : 'text-amber-600'
                          : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {discovery.confidence_score}%
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>confidence</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}