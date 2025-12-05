import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  Clock,
  MessageSquare,
  Search,
  User
} from 'lucide-react';
import { format } from "date-fns";
import { motion } from 'framer-motion';

export default function ModerationPanel() {
  const [moderationHistory, setModerationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadModerationHistory();
  }, []);

  const loadModerationHistory = async () => {
    try {
      const data = await base44.entities.UserModeration.list("-created_date");
      setModerationHistory(data);
    } catch (error) {
      console.error("Failed to load moderation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = moderationHistory.filter(record =>
    record.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (actionType) => {
    const colors = {
      verbal_warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      formal_warning: "bg-orange-100 text-orange-800 border-orange-200",
      ban: "bg-red-100 text-red-800 border-red-200",
      unban: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[actionType] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getActionIcon = (actionType) => {
    const icons = {
      verbal_warning: MessageSquare,
      formal_warning: AlertTriangle,
      ban: Ban,
      unban: CheckCircle
    };
    const Icon = icons[actionType] || Shield;
    return <Icon className="w-4 h-4" />;
  };

  const getActionLabel = (actionType) => {
    const labels = {
      verbal_warning: "Verbal Warning",
      formal_warning: "Formal Warning",
      ban: "Banned",
      unban: "Unbanned"
    };
    return labels[actionType] || actionType;
  };

  // Stats
  const totalActions = moderationHistory.length;
  const verbalWarnings = moderationHistory.filter(r => r.action_type === "verbal_warning").length;
  const formalWarnings = moderationHistory.filter(r => r.action_type === "formal_warning").length;
  const bans = moderationHistory.filter(r => r.action_type === "ban").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Actions</p>
                <p className="text-2xl font-bold text-white">{totalActions}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Verbal Warnings</p>
                <p className="text-2xl font-bold text-white">{verbalWarnings}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Formal Warnings</p>
                <p className="text-2xl font-bold text-white">{formalWarnings}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Active Bans</p>
                <p className="text-2xl font-bold text-white">{bans}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Ban className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation History */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-400" />
            Moderation History
            <Badge variant="outline" className="ml-auto">
              {moderationHistory.length} actions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by user email or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                No moderation actions found
              </h3>
              <p className="text-slate-500">
                {searchTerm ? "Try adjusting your search terms." : "No moderation actions have been taken yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getActionColor(record.action_type)}>
                          {getActionIcon(record.action_type)}
                          <span className="ml-1">{getActionLabel(record.action_type)}</span>
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{record.user_email}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-2">
                        <strong>Reason:</strong> {record.reason}
                      </p>
                      
                      {record.notes && (
                        <p className="text-sm text-slate-400 mb-2">
                          <strong>Notes:</strong> {record.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Moderator: {record.moderator_email}</span>
                        <span>•</span>
                        <span>{format(new Date(record.created_date), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}