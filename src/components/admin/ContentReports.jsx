import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flag, Eye, CheckCircle, XCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function ContentReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await base44.entities.ContentReport.list("-created_date");
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReport = async (reportId, status, notes = "") => {
    setProcessingId(reportId);
    try {
      const user = await base44.auth.me();
      await base44.entities.ContentReport.update(reportId, {
        status: status,
        admin_notes: notes,
        reviewed_by: user.email
      });
      await loadReports();
    } catch (error) {
      console.error("Failed to update report:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
      action_taken: 'bg-green-100 text-green-800 border-green-300',
      dismissed: 'bg-slate-100 text-slate-600 border-slate-300'
    };
    return styles[status] || styles.pending;
  };

  const getVerdictBadge = (verdict) => {
    const styles = {
      appropriate: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      inappropriate: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
      uncertain: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle }
    };
    return styles[verdict] || styles.uncertain;
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const reviewedReports = reports.filter(r => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <Flag className="w-6 h-6 text-red-400" />
            Pending Reports ({pendingReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingReports.length === 0 ? (
            <Alert className="border-slate-700/50 bg-slate-800/50">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-slate-300">No pending reports. All clear!</AlertDescription>
            </Alert>
          ) : (
            pendingReports.map((report, index) => {
              const verdictStyle = getVerdictBadge(report.ai_verdict);
              const VerdictIcon = verdictStyle.icon;

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-slate-300 border-slate-600">
                              {report.content_type}
                            </Badge>
                            <Badge className={verdictStyle.color}>
                              <VerdictIcon className="w-3 h-3 mr-1" />
                              AI: {report.ai_verdict}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">
                            <strong className="text-slate-300">Reported by:</strong> {report.reporter_email}
                          </p>
                          <p className="text-sm text-slate-400 mb-2">
                            <strong className="text-slate-300">Reason:</strong> {report.reason}
                          </p>
                          <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">AI Analysis:</p>
                            <p className="text-sm text-slate-300">{report.ai_analysis}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/DiscoveryDetail?id=${report.content_id}`, '_blank')}
                          className="border-slate-600 text-slate-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => updateReport(report.id, 'action_taken')}
                          disabled={processingId === report.id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {processingId === report.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Remove Content
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateReport(report.id, 'dismissed')}
                          disabled={processingId === report.id}
                          variant="outline"
                          className="border-slate-600 text-slate-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      {reviewedReports.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-3">
              <Eye className="w-6 h-6 text-slate-400" />
              Reviewed Reports ({reviewedReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewedReports.slice(0, 10).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusBadge(report.status)}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-slate-400">{report.content_type}</span>
                  {report.reviewed_by && (
                    <span className="text-xs text-slate-500">by {report.reviewed_by}</span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(report.created_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}