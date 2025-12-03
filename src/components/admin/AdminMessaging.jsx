import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { format } from "date-fns";
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminMessaging() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state
  const [formMessage, setFormMessage] = useState("");
  const [fromName, setFromName] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  useEffect(() => {
    loadMessages();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      // Pre-fill with admin name if available
      if (user && !fromName) {
        const adminName = user.full_name || user.email.split('@')[0];
        setFromName(`Admin ${adminName}`);
      }
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await base44.entities.AdminMessage.list("-created_date");
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMessage = async () => {
    if (!formMessage.trim() || !fromName.trim()) {
      setStatusType("error");
      setStatusMessage("Please fill in message and from name.");
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    try {
      await base44.entities.AdminMessage.create({
        message: formMessage.trim(),
        from_name: fromName.trim(),
        message_type: messageType,
        is_active: true,
        expires_at: expiresAt || undefined
      });

      setStatusType("success");
      setStatusMessage("Message posted successfully!");
      
      // Reset form
      setFormMessage("");
      setMessageType("info");
      setExpiresAt("");
      setShowForm(false);
      
      await loadMessages();
    } catch (error) {
      console.error("Failed to create message:", error);
      setStatusType("error");
      setStatusMessage("Failed to post message. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (messageId, currentStatus) => {
    try {
      await base44.entities.AdminMessage.update(messageId, {
        is_active: !currentStatus
      });
      await loadMessages();
    } catch (error) {
      console.error("Failed to toggle message status:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await base44.entities.AdminMessage.delete(messageId);
      await loadMessages();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-800 border-blue-200",
      success: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      announcement: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[type] || colors.info;
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
              <Megaphone className="w-6 h-6 text-purple-600" />
              Dashboard Messages
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Post messages that appear on the Dashboard page for all users to see
          </p>
        </CardHeader>
        <CardContent>
          {/* Create Message Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-6 bg-slate-50 rounded-lg border-2 border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Message</h3>
              
              {statusMessage && (
                <Alert className={`mb-4 ${
                  statusType === "success" 
                    ? "border-green-200 bg-green-50" 
                    : "border-red-200 bg-red-50"
                }`}>
                  {statusType === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={
                    statusType === "success" ? "text-green-800" : "text-red-800"
                  }>
                    {statusMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fromName">From Name *</Label>
                  <Input
                    id="fromName"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Admin seayc31"
                    className="mt-1"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This will be displayed as "From: [your name]"
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Welcome to FossilFinder! We're excited to have you here..."
                    rows={3}
                    className="mt-1"
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="messageType">Message Type</Label>
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info (Blue)</SelectItem>
                        <SelectItem value="success">Success (Green)</SelectItem>
                        <SelectItem value="warning">Warning (Yellow)</SelectItem>
                        <SelectItem value="announcement">Announcement (Purple)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="mt-1"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateMessage}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSaving ? "Posting..." : "Post Message"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setStatusMessage("");
                    }}
                    variant="outline"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                No messages yet
              </h3>
              <p className="text-slate-500">
                Create your first dashboard message to welcome users!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-slate-50 rounded-lg p-4 border-2 ${
                    message.is_active && !isExpired(message.expires_at)
                      ? 'border-slate-200'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={getTypeColor(message.message_type)}>
                          {message.message_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {message.from_name}
                        </Badge>
                        {!message.is_active && (
                          <Badge variant="outline" className="text-xs bg-slate-100">
                            Hidden
                          </Badge>
                        )}
                        {isExpired(message.expires_at) && (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                            Expired
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-700 mb-2">{message.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Posted: {format(new Date(message.created_date), "MMM d, yyyy 'at' h:mm a")}</span>
                        {message.expires_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires: {format(new Date(message.expires_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(message.id, message.is_active)}
                        title={message.is_active ? "Hide message" : "Show message"}
                      >
                        {message.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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