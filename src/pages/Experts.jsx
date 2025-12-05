import React, { useState, useEffect } from "react";
import { Discovery } from "@/entities/Discovery";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Mail, MapPin, GraduationCap, Search, BrainCircuit, FileText, Calendar, Loader2, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExpertsPage({ isDarkMode }) {
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [discovery, setDiscovery] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Research parameters
  const [specialization, setSpecialization] = useState("");
  const [region, setRegion] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [additionalCriteria, setAdditionalCriteria] = useState("");

  // Easter egg state
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const discoveryId = params.get('discoveryId');

    if (discoveryId) {
      loadDiscoveryAndFindExperts(discoveryId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadDiscoveryAndFindExperts = async (discoveryId) => {
    setIsLoading(true);
    setIsSearching(true);
    try {
      const discoveryData = await Discovery.filter({ id: discoveryId });
      if (!discoveryData || discoveryData.length === 0) {
        throw new Error("Discovery not found");
      }
      const currentDiscovery = discoveryData[0];
      setDiscovery(currentDiscovery);

      // Auto-fill parameters from discovery
      setSpecialization(currentDiscovery.classification || "");
      setTimePeriod(currentDiscovery.time_period || "");
      setRegion(currentDiscovery.location || "");

      // Auto-search with discovery data
      await searchExperts({
        specialization: currentDiscovery.classification,
        timePeriod: currentDiscovery.time_period,
        region: currentDiscovery.location,
        context: `Discovery Description: ${currentDiscovery.description || "N/A"}`
      });
    } catch (error) {
      console.error("Failed to load discovery:", error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const searchExperts = async (params) => {
    const spec = params?.specialization || specialization;
    const reg = params?.region || region;
    const period = params?.timePeriod || timePeriod;
    const criteria = params?.context || additionalCriteria;

    if (!spec && !reg && !period && !criteria) {
      return;
    }

    setIsSearching(true);
    try {
      const prompt = `
You are a research assistant. Find 4-8 archaeologists or paleontologists from the public web (universities, museums, research institutions, publications) who match these criteria:

${spec ? `- Specialization/Field: ${spec}` : ""}
${period ? `- Time Period Expertise: ${period}` : ""}
${reg ? `- Geographic Region: ${reg}` : ""}
${criteria ? `- Additional Context: ${criteria}` : ""}

For each expert, provide:
- name: Full name
- institution: University or organization
- email: Public email if available (otherwise empty string)
- specialization: Array of their areas of expertise
- region: Geographic region(s) they work in
- source_url: Link to their profile, homepage, or publication
- justification: Brief explanation of why they match the criteria (2-3 sentences)

Focus on finding experts who are actively publishing and well-regarded in their field.`;

      const aiResponse = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            experts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  institution: { type: "string" },
                  email: { type: "string" },
                  specialization: { type: "array", items: { type: "string" } },
                  region: { type: "string" },
                  source_url: { type: "string" },
                  justification: { type: "string" }
                },
                required: ["name", "institution", "specialization", "source_url", "justification"]
              }
            }
          }
        }
      });

      const webExperts = (aiResponse?.experts || []).map((e, idx) => ({
        id: `${idx}-${e.name?.toLowerCase().replace(/\s+/g, "-") || "expert"}`,
        ...e
      }));

      setFilteredExperts(webExperts);
    } catch (error) {
      console.error("Failed to find experts via web search:", error);
      setFilteredExperts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSearch = () => {
    searchExperts();
  };

  const specializationColors = {
    paleontology: "bg-green-100 text-green-800 border-green-200",
    prehistoric_archaeology: "bg-orange-100 text-orange-800 border-orange-200",
    classical_archaeology: "bg-purple-100 text-purple-800 border-purple-200",
    underwater_archaeology: "bg-blue-100 text-blue-800 border-blue-200",
    forensic_archaeology: "bg-red-100 text-red-800 border-red-200",
    biblical_archaeology: "bg-yellow-100 text-yellow-800 border-yellow-200",
    industrial_archaeology: "bg-gray-100 text-gray-800 border-gray-200",
    environmental_archaeology: "bg-emerald-100 text-emerald-800 border-emerald-200"
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100'} p-4 md:p-8`}>
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

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'} mb-3`}>
            {discovery ? "Recommended Experts" : "Research Experts"}
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
            {discovery 
              ? "AI-sourced expert matches from the web based on your discovery"
              : "Use AI to find archaeologists and paleontologists from universities and institutions worldwide"
            }
          </p>
        </motion.div>

        {discovery && (
          <Card className={`mb-8 ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-stone-800">
                <FileText className="w-6 h-6 text-amber-600" />
                Reviewing Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <img src={discovery.photo_url} alt="Discovery" className="w-24 h-24 rounded-lg object-cover shadow-md" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-stone-800">{discovery.classification}</h3>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Calendar className="w-4 h-4" />
                  <span>{discovery.time_period}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <MapPin className="w-4 h-4" />
                  <span>{discovery.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Research Parameters Form */}
        <Card className={`mb-8 ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}
          <CardHeader>
            <CardTitle className={`flex items-center gap-3 text-xl ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
              <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
              Research Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="specialization">Specialization / Field</Label>
                <Input
                  id="specialization"
                  placeholder="e.g., Paleontology, Classical Archaeology"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="timePeriod">Time Period</Label>
                <Input
                  id="timePeriod"
                  placeholder="e.g., Mesozoic Era, Bronze Age"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="region">Geographic Region</Label>
                <Input
                  id="region"
                  placeholder="e.g., Mediterranean, East Africa"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="criteria">Additional Criteria (Optional)</Label>
              <Textarea
                id="criteria"
                placeholder="Any additional requirements or context for the expert search..."
                value={additionalCriteria}
                onChange={(e) => setAdditionalCriteria(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleManualSearch}
              disabled={isSearching || (!specialization && !region && !timePeriod && !additionalCriteria)}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching the Web...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Research Experts
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isSearching && !isLoading && (
          <div className="text-center py-12">
            <Loader2 className={`w-16 h-16 ${isDarkMode ? 'text-cyan-400' : 'text-amber-500'} mx-auto mb-4 animate-spin`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-stone-600'} mb-2`}>
              Searching for experts across universities and institutions...
            </h3>
            <p className={isDarkMode ? 'text-slate-500' : 'text-stone-500'}>This may take a moment as we search the web.</p>
          </div>
        )}

        {!isSearching && !isLoading && filteredExperts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert, index) => {
              const specs = Array.isArray(expert.specialization)
                ? expert.specialization
                : (typeof expert.specialization === "string" ? [expert.specialization] : []);
              const hasJustification = Boolean(expert.justification);

              return (
                <motion.div
                  key={expert.id || `${expert.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200 ${hasJustification ? (isDarkMode ? 'border-cyan-400 border-2' : 'border-amber-400 border-2') : ''}`}>
                    {hasJustification && (
                      <div className="p-3 bg-amber-50 border-b-2 border-amber-400">
                        <div className="flex items-start gap-2">
                          <BrainCircuit className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-amber-800"><strong className="font-semibold">Why this expert:</strong> {expert.justification}</p>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-stone-800 mb-1">
                            {expert.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <GraduationCap className="w-4 h-4" />
                            {expert.institution}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Web Sourced
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-stone-600 mb-2 font-medium">Specializations:</p>
                        <div className="flex flex-wrap gap-2">
                          {specs.map((spec) => {
                            const key = spec?.toLowerCase().replace(/\s+/g, '_');
                            return (
                              <Badge
                                key={spec}
                                variant="secondary"
                                className={`text-xs ${specializationColors[key] || "bg-stone-100 text-stone-800 border-stone-200"}`}
                              >
                                {spec?.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {expert.region && (
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <MapPin className="w-4 h-4" />
                          {expert.region}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        {expert.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-stone-200 hover:bg-amber-50 hover:border-amber-200"
                            onClick={() => window.open(`mailto:${expert.email}`, '_blank')}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        )}
                        {expert.source_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`border-stone-200 hover:bg-amber-50 hover:border-amber-200 ${expert.email ? 'flex-1' : 'w-full'}`}
                            onClick={() => window.open(expert.source_url, '_blank')}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isSearching && !isLoading && filteredExperts.length === 0 && (
          <div className="text-center py-12">
            <Users className={`w-16 h-16 ${isDarkMode ? 'text-slate-600' : 'text-stone-300'} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-stone-600'} mb-2`}>
              No experts found yet
            </h3>
            <p className={isDarkMode ? 'text-slate-500' : 'text-stone-500'}>
              Enter your search criteria above and click "Research Experts" to find matching archaeologists and paleontologists.
            </p>
          </div>
        )}

        {/* Copyright Info Button - Easter Egg */}
        <div className="text-center py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPasswordBox(true)}
            className="text-xs text-stone-400 hover:text-stone-600 hover:bg-transparent"
          >
            COPYRIGHT INFO
          </Button>
        </div>
      </div>
    </div>
  );
}