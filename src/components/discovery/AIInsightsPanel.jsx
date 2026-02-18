import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, BookOpen, Link2, Tags, Layers, Search, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIInsightsPanel({ discovery, isDarkMode }) {
  const [relatedDiscoveries, setRelatedDiscoveries] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const researchSuggestions = (() => {
    if (!discovery?.research_suggestions) return [];
    try { return JSON.parse(discovery.research_suggestions); } catch { return []; }
  })();

  useEffect(() => {
    if (discovery?.id && discovery?.category) {
      loadRelatedDiscoveries();
    }
  }, [discovery?.id]);

  const loadRelatedDiscoveries = async () => {
    setIsLoadingRelated(true);
    try {
      const all = await base44.entities.Discovery.filter({ visibility: "public" }, "-created_date", 50);
      const related = all
        .filter(d => d.id !== discovery.id && (
          d.category === discovery.category ||
          d.time_period === discovery.time_period ||
          (d.tags || []).some(t => (discovery.tags || []).includes(t))
        ))
        .slice(0, 3);
      setRelatedDiscoveries(related);
    } catch (e) {
      console.error("Failed to load related discoveries", e);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  if (!discovery) return null;

  const cardBg = isDarkMode ? "bg-slate-900/60 border-white/10" : "bg-white/90 border-0";
  const headingColor = isDarkMode ? "text-white" : "text-stone-800";
  const textColor = isDarkMode ? "text-slate-300" : "text-stone-700";
  const mutedColor = isDarkMode ? "text-slate-400" : "text-stone-500";
  const sectionBg = isDarkMode ? "bg-slate-800/50 border-white/5" : "bg-stone-50 border-stone-100";

  return (
    <Card className={`${cardBg} backdrop-blur-xl shadow-lg`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 text-lg ${headingColor}`}>
            <Sparkles className={`w-5 h-5 ${isDarkMode ? "text-cyan-400" : "text-amber-500"}`} />
            AI Insights
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className={mutedColor}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CardContent className="space-y-5 pt-0">

              {/* AI Summary */}
              {discovery.ai_summary && (
                <div className={`p-3 rounded-lg border ${sectionBg}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${mutedColor} mb-1`}>Quick Summary</p>
                  <p className={`text-sm ${textColor}`}>{discovery.ai_summary}</p>
                </div>
              )}

              {/* Tags */}
              {discovery.tags?.length > 0 && (
                <div>
                  <div className={`flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider ${mutedColor}`}>
                    <Tags className="w-3 h-3" />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {discovery.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className={`text-xs ${isDarkMode ? "bg-slate-700 text-slate-200 border-slate-600" : "bg-amber-50 text-amber-800 border-amber-200"} border`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {discovery.key_features?.length > 0 && (
                <div>
                  <div className={`flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider ${mutedColor}`}>
                    <Layers className="w-3 h-3" />
                    Key Identifying Features
                  </div>
                  <ul className="space-y-1">
                    {discovery.key_features.map((feat, i) => (
                      <li key={i} className={`text-sm flex items-start gap-2 ${textColor}`}>
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDarkMode ? "bg-cyan-400" : "bg-amber-500"}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Species */}
              {discovery.related_species?.length > 0 && (
                <div>
                  <div className={`flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider ${mutedColor}`}>
                    <Search className="w-3 h-3" />
                    Related Species / Types to Explore
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {discovery.related_species.map((s, i) => (
                      <Badge key={i} variant="outline" className={`text-xs ${isDarkMode ? "border-emerald-500/40 text-emerald-300" : "border-emerald-300 text-emerald-700"}`}>
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Suggestions */}
              {researchSuggestions.length > 0 && (
                <div>
                  <div className={`flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider ${mutedColor}`}>
                    <BookOpen className="w-3 h-3" />
                    Research Suggestions
                  </div>
                  <div className="space-y-2">
                    {researchSuggestions.map((s, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${sectionBg}`}>
                        <p className={`text-sm font-medium ${textColor}`}>{s.title}</p>
                        <p className={`text-xs mt-0.5 ${mutedColor}`}>{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Discoveries */}
              <div>
                <div className={`flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider ${mutedColor}`}>
                  <Link2 className="w-3 h-3" />
                  Similar Community Discoveries
                </div>
                {isLoadingRelated ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className={`text-xs ${mutedColor}`}>Finding related discoveries...</span>
                  </div>
                ) : relatedDiscoveries.length > 0 ? (
                  <div className="space-y-2">
                    {relatedDiscoveries.map(d => (
                      <a
                        key={d.id}
                        href={`/discovery-detail?id=${d.id}`}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border ${sectionBg} hover:opacity-80 transition-opacity cursor-pointer block`}
                      >
                        {d.photo_url && (
                          <img src={d.photo_url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${textColor}`}>{d.classification || "Unknown"}</p>
                          <p className={`text-xs truncate ${mutedColor}`}>{d.time_period || d.category || ""}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${mutedColor}`}>No similar discoveries found yet in the community.</p>
                )}
              </div>

            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}