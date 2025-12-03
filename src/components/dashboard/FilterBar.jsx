import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FilterBar({ activeFilter, onFilterChange }) {
  const filters = [
    { key: "all", label: "All Discoveries", icon: null },
    { key: "analyzing", label: "Under Analysis", color: "bg-blue-100 text-blue-800" },
    { key: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
    { key: "high-confidence", label: "High Confidence", color: "bg-emerald-100 text-emerald-800" },
    { key: "significant", label: "Significant", color: "bg-purple-100 text-purple-800" }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-stone-50 rounded-lg">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className={`transition-all duration-200 ${
            activeFilter === filter.key
              ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md"
              : "hover:bg-white hover:shadow-sm"
          }`}
        >
          {filter.label}
          {filter.color && (
            <Badge variant="secondary" className={`ml-2 ${filter.color} text-xs`}>
              •
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}