import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, MapPin, Calendar, ChevronRight, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function MultiScanDiscoveriesPage({ isDarkMode }) {
  const [discoveries, setDiscoveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);
  const [hoveredPoi, setHoveredPoi] = useState(null);

  useEffect(() => {
    loadDiscoveries();
  }, []);

  const loadDiscoveries = async () => {
    try {
      const data = await base44.entities.Discovery.list('-created_date');
      // Filter to only multi-scan discoveries
      const multiScans = data.filter(d => d.scan_results || d.classification?.startsWith('Multi-Scan'));
      setDiscoveries(multiScans);
    } catch (error) {
      console.error("Failed to load discoveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.3)' };
      case 'medium': return { border: '#eab308', bg: 'rgba(234, 179, 8, 0.3)' };
      case 'low': return { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.3)' };
      default: return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.3)' };
    }
  };

  const getSignificanceColor = (level) => {
    const colors = {
      exceptional: 'bg-purple-100 text-purple-800 border-purple-300',
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-amber-100 text-amber-800 border-amber-300',
      low: 'bg-slate-100 text-slate-600 border-slate-300'
    };
    return colors[level] || colors.medium;
  };

  const parseScanResults = (discovery) => {
    if (!discovery.scan_results) return [];
    try {
      return JSON.parse(discovery.scan_results);
    } catch {
      return [];
    }
  };

  if (selectedDiscovery) {
    const scanResults = parseScanResults(selectedDiscovery);
    
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-cyan-50 via-stone-50 to-cyan-100'} p-4 md:p-8`}>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedDiscovery(null)} className={isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : ''}>
              ← Back to List
            </Button>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Scan Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image with overlay */}
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/90 border-0'} backdrop-blur-xl shadow-xl overflow-hidden`}>
              <div className="relative bg-stone-900">
                <img
                  src={selectedDiscovery.photo_url}
                  alt="Scanned rock"
                  className="w-full h-auto max-h-[500px] object-contain mx-auto block"
                />
                
                {scanResults.length > 0 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {scanResults.map((poi, idx) => {
                      const colors = getConfidenceColor(poi.confidence);
                      const isHovered = hoveredPoi === idx;
                      return (
                        <g key={idx}>
                          <circle
                            cx={poi.center_x}
                            cy={poi.center_y}
                            r={poi.radius || 8}
                            fill={isHovered ? colors.bg : 'transparent'}
                            stroke={colors.border}
                            strokeWidth={isHovered ? "1" : "0.5"}
                            strokeDasharray={isHovered ? "0" : "2,1"}
                            className="transition-all duration-200"
                          />
                          <text
                            x={poi.center_x}
                            y={poi.center_y - (poi.radius || 8) - 2}
                            textAnchor="middle"
                            fill={colors.border}
                            fontSize="3"
                            fontWeight="bold"
                          >
                            {idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </Card>

            {/* Details */}
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/90 border-0'} backdrop-blur-xl shadow-xl`}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getSignificanceColor(selectedDiscovery.significance_level)}>
                    {selectedDiscovery.significance_level || 'medium'} significance
                  </Badge>
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                    <Target className="w-3 h-3 mr-1" />
                    {scanResults.length} points found
                  </Badge>
                </div>

                <div className={`space-y-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}>
                  {selectedDiscovery.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedDiscovery.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedDiscovery.created_date), 'MMMM d, yyyy')}
                  </div>
                </div>

                {selectedDiscovery.description && (
                  <p className={`${isDarkMode ? 'text-slate-200 bg-slate-800/50' : 'text-stone-700 bg-stone-50'} rounded-lg p-3`}>{selectedDiscovery.description}</p>
                )}

                {/* Points of Interest */}
                {scanResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Points of Interest</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {scanResults.map((poi, idx) => {
                        const colors = getConfidenceColor(poi.confidence);
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all`}
                            style={{ borderLeftColor: colors.border }}
                            onMouseEnter={() => setHoveredPoi(idx)}
                            onMouseLeave={() => setHoveredPoi(null)}
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: colors.border }}>
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{poi.label}</span>
                                <Badge variant="outline" className="text-xs" style={{ borderColor: colors.border, color: colors.border }}>
                                  {poi.confidence}
                                </Badge>
                              </div>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-600'} mt-1`}>{poi.explanation}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-cyan-50 via-stone-50 to-cyan-100'} p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'} mb-2`}>Multi-Scan Discoveries</h1>
          <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>View all your rock scans with highlighted points of interest</p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className={`w-10 h-10 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'} animate-spin mx-auto mb-4`} />
            <p className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>Loading discoveries...</p>
          </div>
        ) : discoveries.length === 0 ? (
          <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
            <CardContent className="p-12 text-center">
              <Target className={`w-16 h-16 ${isDarkMode ? 'text-slate-500' : 'text-stone-300'} mx-auto mb-4`} />
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-stone-700'} mb-2`}>No Multi-Scan Discoveries</h3>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-stone-500'} mb-6`}>You haven't created any multi-scan discoveries yet.</p>
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                <Link to={createPageUrl("MultiScan")}>
                  <Target className="w-4 h-4 mr-2" />
                  Start Scanning
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoveries.map((discovery, index) => {
              const scanResults = parseScanResults(discovery);
              return (
                <motion.div
                  key={discovery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/90 border-0'} backdrop-blur-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all group`}
                    onClick={() => setSelectedDiscovery(discovery)}
                  >
                    <div className="relative h-48 bg-stone-900">
                      <img
                        src={discovery.photo_url}
                        alt="Scan"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <Badge className="absolute top-2 right-2 bg-cyan-500">
                        <Target className="w-3 h-3 mr-1" />
                        {scanResults.length} points
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getSignificanceColor(discovery.significance_level)}>
                          {discovery.significance_level || 'medium'}
                        </Badge>
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                          {format(new Date(discovery.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {discovery.location && (
                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-600'} flex items-center gap-1 truncate`}>
                          <MapPin className="w-3 h-3" />
                          {discovery.location}
                        </p>
                      )}
                      <Button variant="ghost" size="sm" className={`w-full mt-2 ${isDarkMode ? 'text-cyan-400 hover:bg-cyan-900/30' : 'text-cyan-700 hover:bg-cyan-50'}`}>
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}