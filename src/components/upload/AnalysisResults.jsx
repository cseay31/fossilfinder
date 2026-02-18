import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Calendar, MapPin, TrendingUp, Users, RotateCcw } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AIInsightsPanel from "./AIInsightsPanel";

// Helper function to escape HTML and prevent content injection
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (match) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });
}

export default function AnalysisResults({ results, onStartNew }) {
  const getConfidenceColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
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

  // The sendToExperts function is removed as we are replacing it with a link to the experts page.

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-stone-800">
            Analysis Complete!
          </CardTitle>
          <p className="text-stone-600">
            Your archaeological finding has been successfully analyzed
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Image */}
          <div className="text-center">
            <img
              src={results.photo_url}
              alt="Analyzed archaeological finding"
              className="max-w-md mx-auto rounded-xl shadow-lg"
            />
          </div>

          <Separator />

          {/* Analysis Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-stone-600 mb-1">Classification</p>
                <p className="text-lg font-semibold text-stone-800">{results.classification}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-stone-600 mb-1">Confidence Level</p>
                <Badge className={`${getConfidenceColor(results.confidence_score)} font-semibold`}>
                  {results.confidence_score}% Confidence
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-stone-600 mb-1">Time Period</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span className="text-stone-800">{results.time_period}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-stone-600 mb-1">Significance</p>
                <Badge className={`${getSignificanceColor(results.significance_level)} font-semibold`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {results.significance_level?.charAt(0).toUpperCase() + results.significance_level?.slice(1)} Significance
                </Badge>
              </div>
            </div>
          </div>

          {/* Location */}
          {results.location && (
            <div>
              <p className="text-sm font-medium text-stone-600 mb-1">Discovery Location</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-500" />
                <span className="text-stone-700">{results.location}</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Detailed Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-3">Detailed Analysis</h3>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-stone-700 leading-relaxed">{results.description}</p>
            </div>
          </div>

          {/* Recommendations */}
          {results.recommendations && (
            <div>
              <h3 className="text-lg font-semibold text-stone-800 mb-3">Expert Recommendations</h3>
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
                <p className="text-stone-700 leading-relaxed">{results.recommendations}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <Separator />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <Link to={createPageUrl(`Experts?discoveryId=${results.id}`)}>
                <Users className="w-4 h-4 mr-2" />
                Find an Expert
              </Link>
            </Button>
            
            <Button
              variant="outline"
              onClick={onStartNew}
              className="flex-1 border-stone-300 hover:bg-stone-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Analyze Another
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}