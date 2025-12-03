
import React, { useState } from 'react';
import { Discovery } from "@/entities/Discovery";
import { SendEmail } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  X, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  User, 
  Mail, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Send,
  Save,
  Users as UsersIcon
} from 'lucide-react';
import { format } from "date-fns";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Helper function to escape HTML and prevent content injection
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (match) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });
}

export default function ReviewPanel({ discovery, onClose, onUpdate }) {
  const [expertNotes, setExpertNotes] = useState(discovery.expert_notes || '');
  const [analysisStatus, setAnalysisStatus] = useState(discovery.analysis_status);
  const [significanceLevel, setSignificanceLevel] = useState(discovery.significance_level);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const getConfidenceColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      analyzing: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      sent_to_expert: "bg-purple-100 text-purple-800 border-purple-200",
      verified: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return colors[status] || colors.analyzing;
  };

  const getSignificanceColor = (level) => {
    const colors = {
      exceptional: "bg-purple-100 text-purple-800 border-purple-200",
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[level] || colors.medium;
  };

  const updateDiscovery = async () => {
    setIsUpdating(true);
    setMessage('');

    try {
      const updateData = {
        expert_notes: expertNotes,
        analysis_status: analysisStatus,
        significance_level: significanceLevel
      };

      await Discovery.update(discovery.id, updateData);
      setMessage('Discovery updated successfully!');
      onUpdate(); // Refresh the parent component
    } catch (error) {
      console.error("Failed to update discovery:", error);
      setMessage('Failed to update discovery. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const sendToExpert = async () => {
    setIsSending(true);
    setMessage('');

    try {
      const subject = `Expert Review Required: ${escapeHTML(discovery.classification)}`;
      
      const body = `
<p>Dear Archaeological Expert,</p>

<p>A discovery has been flagged for expert review through our FossilFinder platform.</p>

<h3>Discovery Details:</h3>
<ul>
  <li><strong>Classification:</strong> ${escapeHTML(discovery.classification)}</li>
  <li><strong>AI Confidence:</strong> ${escapeHTML(String(discovery.confidence_score))}%</li>
  <li><strong>Time Period:</strong> ${escapeHTML(discovery.time_period)}</li>
  <li><strong>Location:</strong> ${escapeHTML(discovery.location)}</li>
  <li><strong>Significance:</strong> ${escapeHTML(discovery.significance_level)}</li>
  <li><strong>Submitted by:</strong> ${escapeHTML(discovery.created_by)}</li>
</ul>

<h3>AI Analysis:</h3>
<p>${escapeHTML(discovery.description)?.replace(/\n/g, '<br>')}</p>

${expertNotes ? `<h3>Admin Notes:</h3><p>${escapeHTML(expertNotes)?.replace(/\n/g, '<br>')}</p>` : ''}

<h3>AI Recommendations:</h3>
<p>${escapeHTML(discovery.recommendations || "No specific recommendations provided.")?.replace(/\n/g, '<br>')}</p>

<p>Please review this discovery and provide your expert verification.</p>

<p>Discovery image: <a href="${discovery.photo_url}">View Full Resolution</a></p>

<p>Best regards,<br>FossilFinder Admin Team</p>
      `;

      await SendEmail({
        to: "expert@archaeologist.com", // This would come from the experts database
        subject,
        body,
        from_name: "FossilFinder Admin"
      });

      // Update status to sent_to_expert
      await Discovery.update(discovery.id, {
        analysis_status: "sent_to_expert"
      });

      setMessage('Discovery sent to expert successfully!');
      setAnalysisStatus("sent_to_expert");
      onUpdate();
    } catch (error) {
      console.error("Failed to send to expert:", error);
      setMessage('Failed to send to expert. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Discovery Review</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <Alert className={message.includes('Failed') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className={message.includes('Failed') ? 'text-red-800' : 'text-green-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image and Basic Info */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={discovery.photo_url}
                  alt={discovery.classification || "Archaeological discovery"}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800">Discovery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Submitted by:</span>
                    <span>{discovery.created_by}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Uploaded:</span>
                    <span>{format(new Date(discovery.created_date), "MMM d, yyyy 'at' HH:mm")}</span>
                  </div>

                  {discovery.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">Location:</span>
                      <span>{discovery.location}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(discovery.photo_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Analysis and Controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800">AI Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">{discovery.classification || "Classification pending"}</h4>
                    <div className="flex flex-wrap gap-2">
                      {discovery.confidence_score && (
                        <Badge className={getConfidenceColor(discovery.confidence_score)}>
                          {discovery.confidence_score}% Confidence
                        </Badge>
                      )}
                      <Badge className={getStatusColor(discovery.analysis_status)}>
                        {discovery.analysis_status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      {discovery.significance_level && (
                        <Badge className={getSignificanceColor(discovery.significance_level)}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {discovery.significance_level?.charAt(0).toUpperCase() + discovery.significance_level?.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {discovery.time_period && (
                    <div>
                      <span className="font-medium text-slate-700">Time Period: </span>
                      <span className="text-slate-600">{discovery.time_period}</span>
                    </div>
                  )}

                  {discovery.description && (
                    <div>
                      <h5 className="font-medium text-slate-700 mb-2">Analysis Description:</h5>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {discovery.description}
                      </p>
                    </div>
                  )}

                  {discovery.recommendations && (
                    <div>
                      <h5 className="font-medium text-slate-700 mb-2">AI Recommendations:</h5>
                      <p className="text-sm text-slate-600 bg-amber-50 p-3 rounded-lg">
                        {discovery.recommendations}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800">Admin Review Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Analysis Status</label>
                      <Select value={analysisStatus} onValueChange={setAnalysisStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analyzing">Analyzing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="sent_to_expert">Sent to Expert</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Significance Level</label>
                      <Select value={significanceLevel} onValueChange={setSignificanceLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="exceptional">Exceptional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Expert Notes</label>
                    <Textarea
                      value={expertNotes}
                      onChange={(e) => setExpertNotes(e.target.value)}
                      placeholder="Add your expert review notes here..."
                      rows={4}
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-3">
                     <div className="flex gap-3">
                        <Button
                          onClick={updateDiscovery}
                          disabled={isUpdating}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {isUpdating ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Update Discovery
                            </>
                          )}
                        </Button>
                        <Button
                           asChild
                           variant="outline"
                           className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                           <Link to={createPageUrl(`Experts?discoveryId=${discovery.id}`)} target="_blank">
                              <UsersIcon className="w-4 h-4 mr-2" />
                              Find Expert
                           </Link>
                        </Button>
                     </div>
                    <Button
                      onClick={sendToExpert}
                      disabled={isSending}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      {isSending ? (
                        <>
                          <Send className="w-4 h-4 mr-2 animate-pulse" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Contact Expert by Email
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
