import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, TrendingUp, Loader2, User, Mail, ExternalLink, Eye } from 'lucide-react';
import { format } from "date-fns";

export default function AdminDiscoveryCard({ discovery, index, onUpdate, onReview }) {
  const getConfidenceColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      analyzing: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      sent_to_expert: "bg-purple-100 text-purple-800 border-purple-200",
      verified: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return colors[status] || colors.analyzing;
  };

  const getSignificanceColor = (level) => {
    const colors = {
      exceptional: "bg-purple-100 text-purple-800 border-purple-200",
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[level] || colors.medium;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-200 overflow-hidden">
        <div className="aspect-video relative overflow-hidden bg-slate-100">
          {discovery.photo_url ? (
            <img
              src={discovery.photo_url}
              alt={discovery.classification || "Archaeological discovery"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full items-center justify-center text-slate-400" style={{ display: discovery.photo_url ? 'none' : 'flex' }}>
            No image available
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-3 right-3">
            <Badge className={getStatusColor(discovery.analysis_status)}>
              {discovery.analysis_status === 'analyzing' && (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              )}
              {discovery.analysis_status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          {discovery.created_by && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-black/60 text-white border-black/20">
                <User className="w-3 h-3 mr-1" />
                {discovery.created_by.split('@')[0]}
              </Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800 text-lg">
              {discovery.classification || "Analyzing..."}
            </h3>
            
            {/* User Information */}
            {discovery.created_by && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{discovery.created_by}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {discovery.confidence_score && (
                <Badge variant="secondary" className={`${getConfidenceColor(discovery.confidence_score)} text-xs`}>
                  {discovery.confidence_score}% Confidence
                </Badge>
              )}
              
              {discovery.significance_level && (
                <Badge variant="secondary" className={`${getSignificanceColor(discovery.significance_level)} text-xs`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {discovery.significance_level?.charAt(0).toUpperCase() + discovery.significance_level?.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {discovery.time_period && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{discovery.time_period}</span>
            </div>
          )}

          {discovery.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{discovery.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>Uploaded {format(new Date(discovery.created_date), "MMM d, yyyy 'at' HH:mm")}</span>
          </div>

          {discovery.description && discovery.analysis_status === 'completed' && (
            <p className="text-sm text-slate-600 line-clamp-2">
              {discovery.description.substring(0, 120)}...
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(discovery)}
              className="flex-1 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(discovery.photo_url, '_blank')}
              className="border-slate-200 hover:bg-slate-50"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}