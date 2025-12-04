import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Map, MapPin, Calendar, TrendingUp, Loader2, Eye, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons by significance
const createCustomIcon = (significance) => {
  const colors = {
    exceptional: '#9333ea',
    high: '#dc2626',
    medium: '#f59e0b',
    low: '#6b7280'
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${colors[significance] || colors.medium};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

function MapBounds({ discoveries }) {
  const map = useMap();
  
  useEffect(() => {
    if (discoveries.length > 0) {
      const validDiscoveries = discoveries.filter(d => d.latitude && d.longitude);
      if (validDiscoveries.length > 0) {
        const bounds = L.latLngBounds(
          validDiscoveries.map(d => [d.latitude, d.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [discoveries, map]);
  
  return null;
}

export default function DiscoveryMapPage() {
  const [discoveries, setDiscoveries] = useState([]);
  const [filteredDiscoveries, setFilteredDiscoveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSignificance, setSelectedSignificance] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadDiscoveries();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    let filtered = discoveries.filter(d => d.latitude && d.longitude);
    
    if (selectedSignificance !== "all") {
      filtered = filtered.filter(d => d.significance_level === selectedSignificance);
    }
    
    setFilteredDiscoveries(filtered);
  }, [discoveries, selectedSignificance]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadDiscoveries = async () => {
    try {
      const data = await base44.entities.Discovery.list("-created_date");
      setDiscoveries(data);
    } catch (error) {
      console.error("Failed to load discoveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSignificanceColor = (level) => {
    const colors = {
      exceptional: "bg-purple-100 text-purple-800 border-purple-200",
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-amber-100 text-amber-800 border-amber-200",
      low: "bg-slate-100 text-slate-800 border-slate-200"
    };
    return colors[level] || colors.medium;
  };

  const discoveriesWithLocation = discoveries.filter(d => d.latitude && d.longitude);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center">
              <Map className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Discovery Map
              </h1>
              <p className="text-lg text-slate-600">
                Explore fossil discoveries from around the world
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{discoveriesWithLocation.length}</p>
                <p className="text-xs text-slate-500">Mapped Discoveries</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {discoveriesWithLocation.filter(d => d.significance_level === 'exceptional' || d.significance_level === 'high').length}
                </p>
                <p className="text-xs text-slate-500">High Significance</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {discoveriesWithLocation.filter(d => d.analysis_status === 'completed').length}
                </p>
                <p className="text-xs text-slate-500">Analyzed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{discoveries.length}</p>
                <p className="text-xs text-slate-500">Total Discoveries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filter by significance:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "All" },
                  { value: "exceptional", label: "Exceptional", color: "bg-purple-500" },
                  { value: "high", label: "High", color: "bg-red-500" },
                  { value: "medium", label: "Medium", color: "bg-amber-500" },
                  { value: "low", label: "Low", color: "bg-slate-500" }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedSignificance === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSignificance(option.value)}
                    className={selectedSignificance === option.value ? "bg-emerald-600" : ""}
                  >
                    {option.color && (
                      <div className={`w-3 h-3 rounded-full ${option.color} mr-2`} />
                    )}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-[600px] flex items-center justify-center bg-slate-100">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : discoveriesWithLocation.length === 0 ? (
              <div className="h-[600px] flex flex-col items-center justify-center bg-slate-50">
                <MapPin className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No mapped discoveries yet</h3>
                <p className="text-slate-500 text-center max-w-md">
                  Discoveries with GPS coordinates will appear here. Use the location button when uploading to mark your find on the map!
                </p>
              </div>
            ) : (
              <div className="h-[600px]">
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapBounds discoveries={filteredDiscoveries} />
                  
                  {filteredDiscoveries.map((discovery) => {
                    // Round to ~1km precision for privacy (2 decimal places ≈ 1.1km)
                    const approxLat = Math.round(discovery.latitude * 100) / 100;
                    const approxLng = Math.round(discovery.longitude * 100) / 100;
                    return (
                    <Marker
                      key={discovery.id}
                      position={[approxLat, approxLng]}
                      icon={createCustomIcon(discovery.significance_level)}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          {discovery.photo_url && (
                            <img
                              src={discovery.photo_url}
                              alt={discovery.classification}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <h3 className="font-semibold text-slate-800 mb-1">
                            {discovery.classification || "Analyzing..."}
                          </h3>
                          <div className="space-y-1 text-sm">
                            {discovery.time_period && (
                              <p className="text-slate-600">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {discovery.time_period}
                              </p>
                            )}
                            {discovery.significance_level && (
                              <Badge className={`${getSignificanceColor(discovery.significance_level)} text-xs`}>
                                {discovery.significance_level}
                              </Badge>
                            )}
                            {discovery.confidence_score && (
                              <p className="text-slate-500 text-xs">
                                {discovery.confidence_score}% confidence
                              </p>
                            )}
                            <p className="text-slate-400 text-xs">
                              {format(new Date(discovery.created_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                  })}
                </MapContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-3">
              📍 Locations are approximate (~1km) for privacy protection
            </p>
            <div className="flex items-center gap-6 flex-wrap">
              <span className="text-sm font-medium text-slate-700">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow" />
                <span className="text-sm text-slate-600">Exceptional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" />
                <span className="text-sm text-slate-600">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow" />
                <span className="text-sm text-slate-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-500 border-2 border-white shadow" />
                <span className="text-sm text-slate-600">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}