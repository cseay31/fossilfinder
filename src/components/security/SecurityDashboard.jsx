import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react';
import { format } from 'date-fns';

export default function SecurityDashboard({ isDarkMode }) {
  const [securityLogs, setSecurityLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    blocked: 0,
    botDetections: 0
  });
  
  useEffect(() => {
    loadSecurityLogs();
    
    const interval = setInterval(loadSecurityLogs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);
  
  const loadSecurityLogs = async () => {
    try {
      const logs = await base44.entities.SecurityLog.list('-created_date', 100);
      setSecurityLogs(logs);
      
      setStats({
        total: logs.length,
        critical: logs.filter(l => l.severity === 'critical').length,
        high: logs.filter(l => l.severity === 'high').length,
        blocked: logs.filter(l => l.blocked).length,
        botDetections: logs.filter(l => l.event_type === 'bot_detected').length
      });
    } catch (error) {
      console.error('Failed to load security logs:', error);
    }
  };
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className={isDarkMode ? 'text-cyan-400' : 'text-amber-600'} />
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                  {stats.total}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Total Events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500" />
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                  {stats.critical}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Critical
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="text-orange-500" />
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                  {stats.blocked}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Blocked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-500" />
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                  {stats.botDetections}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Bot Alerts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Security Events */}
      <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? 'text-white' : 'text-stone-800'} flex items-center gap-2`}>
            <Shield className={isDarkMode ? 'text-cyan-400' : 'text-amber-600'} />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityLogs.slice(0, 20).map((log) => (
              <div 
                key={log.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-slate-800/50 border-white/5' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                      <Badge variant="outline" className={isDarkMode ? 'text-slate-300' : ''}>
                        {log.event_type.replace(/_/g, ' ')}
                      </Badge>
                      {log.blocked && (
                        <Badge className="bg-red-600 text-white">Blocked</Badge>
                      )}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-700'} font-medium`}>
                      {log.user_email || 'Anonymous'}
                    </p>
                    {log.page && (
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-stone-500'} mt-1`}>
                        Page: {log.page}
                      </p>
                    )}
                    {log.details && (
                      <details className="mt-2">
                        <summary className={`text-xs cursor-pointer ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`}>
                          View Details
                        </summary>
                        <pre className={`text-xs mt-2 p-2 rounded ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-white text-stone-600'} overflow-x-auto`}>
                          {JSON.stringify(JSON.parse(log.details || '{}'), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-stone-400'} whitespace-nowrap`}>
                    {format(new Date(log.created_date), 'MMM d, HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            
            {securityLogs.length === 0 && (
              <div className="text-center py-8">
                <Shield className={`w-12 h-12 ${isDarkMode ? 'text-slate-600' : 'text-stone-300'} mx-auto mb-3`} />
                <p className={isDarkMode ? 'text-slate-400' : 'text-stone-500'}>
                  No security events logged yet
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}