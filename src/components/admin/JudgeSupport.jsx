import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Users, MessageSquare, Plus, RefreshCw, Loader2, Send, Eye, Activity, HelpCircle, Search, UserCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function JudgeSupport({ isDarkMode }) {
  const [judgeSessions, setJudgeSessions] = useState([]);
  const [judges, setJudges] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddJudge, setShowAddJudge] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [newJudgeEmail, setNewJudgeEmail] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sessions, allUsers, allDiscoveries, user] = await Promise.all([
        base44.entities.JudgeSession.list("-created_date"),
        base44.entities.User.list(),
        base44.entities.Discovery.list("-created_date"),
        base44.auth.me()
      ]);
      setJudgeSessions(sessions);
      setJudges(allUsers);
      setDiscoveries(allDiscoveries);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load judge support data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addJudgeSession = async () => {
    if (!newJudgeEmail) return;
    
    const judge = judges.find(j => j.email === newJudgeEmail);
    if (!judge) return;

    try {
      await base44.entities.JudgeSession.create({
        judge_email: judge.email,
        judge_name: judge.full_name || judge.email,
        is_active: true,
        needs_help: false,
        last_activity: "Session created"
      });
      setNewJudgeEmail("");
      setShowAddJudge(false);
      loadData();
    } catch (error) {
      console.error("Failed to add judge session:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedJudge || !newMessage) return;
    
    setIsSending(true);
    try {
      await base44.entities.JudgeMessage.create({
        judge_email: selectedJudge.judge_email,
        message: newMessage,
        message_type: messageType,
        is_read: false,
        admin_name: currentUser?.full_name || "Admin"
      });
      setNewMessage("");
      setSelectedJudge(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getJudgeDiscoveries = (judgeEmail) => {
    return discoveries.filter(d => d.created_by === judgeEmail);
  };

  const getJudgeActivity = (judgeEmail) => {
    const judgeDiscoveries = getJudgeDiscoveries(judgeEmail);
    return {
      totalDiscoveries: judgeDiscoveries.length,
      lastDiscovery: judgeDiscoveries[0],
      analyzing: judgeDiscoveries.filter(d => d.analysis_status === 'analyzing').length,
      completed: judgeDiscoveries.filter(d => d.analysis_status === 'completed').length
    };
  };

  const activeJudges = judgeSessions.filter(j => j.is_active);
  const judgesNeedingHelp = judgeSessions.filter(j => j.needs_help);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase`}>Active Judges</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mt-1`}>{activeJudges.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <UserCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase`}>Needs Help</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mt-1`}>{judgesNeedingHelp.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/20">
                <HelpCircle className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase`}>Total Discoveries</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mt-1`}>
                  {judgeSessions.reduce((sum, j) => sum + getJudgeDiscoveries(j.judge_email).length, 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className={isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-3`}>
                <Users className="w-6 h-6 text-blue-400" />
                Judge Support Dashboard
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                Monitor and assist judges evaluating the project
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className={isDarkMode ? 'border-slate-600 text-slate-300' : ''}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setShowAddJudge(!showAddJudge)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Judge
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add Judge Form */}
          {showAddJudge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <Label className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Select User to Add as Judge</Label>
              <div className="flex gap-2 mt-2">
                <Select value={newJudgeEmail} onValueChange={setNewJudgeEmail}>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {judges.filter(j => !judgeSessions.find(js => js.judge_email === j.email)).map(judge => (
                      <SelectItem key={judge.email} value={judge.email}>
                        {judge.full_name || judge.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addJudgeSession} disabled={!newJudgeEmail}>
                  Add
                </Button>
              </div>
            </motion.div>
          )}

          {/* Judge List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : judgeSessions.length === 0 ? (
            <div className="text-center py-12">
              <Users className={`w-16 h-16 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No judges added yet. Click "Add Judge" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {judgeSessions.map((session, index) => {
                const activity = getJudgeActivity(session.judge_email);
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200'} ${session.needs_help ? 'border-orange-500 border-2' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {session.judge_name[0]}
                              </div>
                              <div>
                                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                  {session.judge_name}
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {session.judge_email}
                                </p>
                              </div>
                              {session.needs_help && (
                                <Badge className="bg-orange-500">
                                  <HelpCircle className="w-3 h-3 mr-1" />
                                  Needs Help
                                </Badge>
                              )}
                              {session.is_active && (
                                <Badge className="bg-green-500">Active</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase`}>Discoveries</p>
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activity.totalDiscoveries}</p>
                              </div>
                              <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase`}>Analyzing</p>
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{activity.analyzing}</p>
                              </div>
                              <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase`}>Completed</p>
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{activity.completed}</p>
                              </div>
                              <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase`}>Last Active</p>
                                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {activity.lastDiscovery ? format(new Date(activity.lastDiscovery.created_date), 'HH:mm') : 'N/A'}
                                </p>
                              </div>
                            </div>

                            {activity.lastDiscovery && (
                              <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-1`}>Latest Discovery:</p>
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={activity.lastDiscovery.photo_url} 
                                    alt="" 
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                      {activity.lastDiscovery.classification || 'Analyzing...'}
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                      {format(new Date(activity.lastDiscovery.created_date), 'MMM d, h:mm a')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => setSelectedJudge(session)}
                            variant="outline"
                            size="sm"
                            className={isDarkMode ? 'border-slate-600' : ''}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Modal */}
      {selectedJudge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`max-w-md w-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-2xl`}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Send Message to {selectedJudge.judge_name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedJudge(null)}
                >
                  ×
                </Button>
              </div>

              <div>
                <Label className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Message Type</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger className={`mt-1 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="help">Help</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="tip">Tip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Message</Label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message to the judge..."
                  rows={4}
                  className={`mt-1 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : ''}`}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage || isSending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Message
                </Button>
                <Button
                  onClick={() => setSelectedJudge(null)}
                  variant="outline"
                  className={isDarkMode ? 'border-slate-600' : ''}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}