import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search, User, Clock, RefreshCw, Filter, MousePointer, Keyboard, Send } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogViewer({ isDarkMode }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.AuditLog.list("-created_date", 500);
      setLogs(data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'click': return <MousePointer className="w-4 h-4" />;
      case 'input_change': return <Keyboard className="w-4 h-4" />;
      case 'form_submit': return <Send className="w-4 h-4" />;
      case 'page_view': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'click': return 'text-blue-400';
      case 'input_change': return 'text-purple-400';
      case 'form_submit': return 'text-green-400';
      case 'page_view': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.action_type !== filterType) return false;
    if (!searchQuery) return true;
    return (
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.page?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.element?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group logs by user
  const logsByUser = filteredLogs.reduce((acc, log) => {
    const key = log.user_email || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  const actionTypes = ['all', 'page_view', 'click', 'input_change', 'form_submit'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase mb-1`}>Total Logs</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{logs.length}</p>
          </CardContent>
        </Card>
        <Card className={isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase mb-1`}>Unique Users</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{Object.keys(logsByUser).length}</p>
          </CardContent>
        </Card>
        <Card className={isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase mb-1`}>Page Views</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {logs.filter(l => l.action_type === 'page_view').length}
            </p>
          </CardContent>
        </Card>
        <Card className={isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}>
          <CardContent className="p-4">
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase mb-1`}>Clicks</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {logs.filter(l => l.action_type === 'click').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className={isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className={`flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <FileText className="w-5 h-5 text-indigo-400" />
              Audit Logs
            </CardTitle>
            <Button
              onClick={loadLogs}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className={isDarkMode ? 'border-slate-700 text-slate-300' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : ''}
              />
            </div>
            <div className="flex gap-2">
              {actionTypes.map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant={filterType === type ? 'default' : 'outline'}
                  onClick={() => setFilterType(type)}
                  className={filterType === type ? 'bg-indigo-600' : isDarkMode ? 'border-slate-600 text-slate-300' : ''}
                >
                  {type.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Logs List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-400" />
                  <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading logs...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No logs found</p>
                </div>
              ) : (
                filteredLogs.map((log, index) => {
                  let details = {};
                  try {
                    details = JSON.parse(log.details || '{}');
                  } catch (e) {}

                  return (
                    <div
                      key={log.id || index}
                      className={`p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-900/30 border-slate-700/50 hover:bg-slate-800/50' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      } transition-colors`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                          <div className={getActionColor(log.action_type)}>
                            {getActionIcon(log.action_type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={isDarkMode ? 'border-slate-600' : ''}>
                              {log.action_type}
                            </Badge>
                            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {log.user_name || log.user_email}
                            </span>
                          </div>
                          
                          <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {log.page}
                            {log.element && <span className="text-slate-500"> • {log.element}</span>}
                          </p>
                          
                          {details.text && (
                            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mt-1 truncate`}>
                              "{details.text}"
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                              {format(new Date(log.created_date), 'MMM d, yyyy h:mm:ss a')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}