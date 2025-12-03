import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminFilters({ activeFilter, onFilterChange, discoveries }) {
  const getFilterCount = (filterKey) => {
    switch (filterKey) {
      case "analyzing":
        return discoveries.filter(d => d.analysis_status === "analyzing").length;
      case "completed":
        return discoveries.filter(d => d.analysis_status === "completed").length;
      case "sent_to_expert":
        return discoveries.filter(d => d.analysis_status === "sent_to_expert").length;
      case "high_significance":
        return discoveries.filter(d => d.significance_level === "high" || d.significance_level === "exceptional").length;
      case "low_confidence":
        return discoveries.filter(d => d.confidence_score && d.confidence_score < 60).length;
      default:
        return discoveries.length;
    }
  };

  const filters = [
    { key: "all", label: "All Discoveries", color: "bg-slate-100 text-slate-800" },
    { key: "analyzing", label: "Under Analysis", color: "bg-blue-100 text-blue-800" },
    { key: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
    { key: "sent_to_expert", label: "Sent to Experts", color: "bg-purple-100 text-purple-800" },
    { key: "high_significance", label: "High Significance", color: "bg-red-100 text-red-800" },
    { key: "low_confidence", label: "Needs Review", color: "bg-yellow-100 text-yellow-800" }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-slate-50 rounded-lg">
      {filters.map((filter) => {
        const count = getFilterCount(filter.key);
        return (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange(filter.key)}
            className={`transition-all duration-200 ${
              activeFilter === filter.key
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md"
                : "hover:bg-white hover:shadow-sm"
            }`}
          >
            {filter.label}
            <Badge 
              variant="secondary" 
              className={`ml-2 text-xs ${
                activeFilter === filter.key 
                  ? "bg-white/20 text-white border-white/30" 
                  : filter.color
              }`}
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}