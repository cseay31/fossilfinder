import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Mail, Calendar, Send, CheckCircle, Eye, X, AlertTriangle, Copy } from 'lucide-react';
import { format } from "date-fns";
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageManagement() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(messages.filter(m => m.status === filterStatus));
    }
  }, [messages, filterStatus]);

  useEffect(() => {
    if (selectedMessage) {
      checkIfUserExists(selectedMessage.email);
    }
  }, [selectedMessage]);

  const loadMessages = async () => {
    try {
      const data = await base44.entities.ContactMessage.list("-created_date");
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfUserExists = async (email) => {
    setIsCheckingUser(true);
    try {
      const users = await base44.entities.User.filter({ email });
      setUserExists(users && users.length > 0);
    } catch (error) {
      console.error("Failed to check user:", error);
      setUserExists(false);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await base44.entities.ContactMessage.update(messageId, { status: "read" });
      await loadMessages();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setResponseText("");
    setStatusMessage("");
    if (message.status === "new") {
      await markAsRead(message.id);
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      setStatusMessage("Please enter a response message.");
      return;
    }

    if (!userExists) {
      setStatusMessage("Cannot send email: This user is not registered in the app. Please copy their email and respond manually.");
      return;
    }

    setIsSending(true);
    setStatusMessage("");

    try {
      const currentUser = await base44.auth.me();

      // Send email response - only works for registered users
      await base44.integrations.Core.SendEmail({
        to: selectedMessage.email,
        subject: `Re: ${selectedMessage.subject}`,
        body: `
<h2>Response from FossilFinder Admin</h2>

<p>Hello ${selectedMessage.name},</p>

<p>Thank you for contacting us. Here's our response to your message:</p>

<hr />

<p>${responseText.replace(/\n/g, '<br>')}</p>

<hr />

<h3>Your Original Message:</h3>
<p><strong>Subject:</strong> ${selectedMessage.subject}</p>
<p>${selectedMessage.message.replace(/\n/g, '<br>')}</p>

<hr />

<p>Best regards,<br>FossilFinder Team</p>
        `,
        from_name: "FossilFinder Admin"
      });

      // Update message status
      await base44.entities.ContactMessage.update(selectedMessage.id, {
        status: "replied",
        admin_response: responseText,
        responded_by: currentUser.email,
        responded_at: new Date().toISOString()
      });

      setStatusMessage("Response sent successfully!");
      setResponseText("");
      await loadMessages();

      // Close modal after 2 seconds
      setTimeout(() => {
        setSelectedMessage(null);
        setStatusMessage("");
      }, 2000);
    } catch (error) {
      console.error("Failed to send response:", error);
      setStatusMessage("Failed to send response. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveResponse = async () => {
    if (!responseText.trim()) {
      setStatusMessage("Please enter a response message.");
      return;
    }

    setIsSending(true);
    setStatusMessage("");

    try {
      const currentUser = await base44.auth.me();

      // Just save the response without sending email
      await base44.entities.ContactMessage.update(selectedMessage.id, {
        status: "replied",
        admin_response: responseText,
        responded_by: currentUser.email,
        responded_at: new Date().toISOString()
      });

      setStatusMessage("Response saved successfully! (Email not sent - user not registered)");
      setResponseText("");
      await loadMessages();

      // Close modal after 2 seconds
      setTimeout(() => {
        setSelectedMessage(null);
        setStatusMessage("");
      }, 2000);
    } catch (error) {
      console.error("Failed to save response:", error);
      setStatusMessage("Failed to save response. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(selectedMessage.email);
    setStatusMessage("Email address copied to clipboard!");
    setTimeout(() => setStatusMessage(""), 2000);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      read: "bg-yellow-100 text-yellow-800 border-yellow-200",
      replied: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[status] || colors.new;
  };

  const newCount = messages.filter(m => m.status === "new").length;
  const readCount = messages.filter(m => m.status === "read").length;
  const repliedCount = messages.filter(m => m.status === "replied").length;

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          onClick={() => setFilterStatus("all")}
          className={filterStatus === "all" ? "bg-blue-600" : ""}
        >
          All Messages
          <Badge variant="secondary" className="ml-2">{messages.length}</Badge>
        </Button>
        <Button
          variant={filterStatus === "new" ? "default" : "outline"}
          onClick={() => setFilterStatus("new")}
          className={filterStatus === "new" ? "bg-blue-600" : ""}
        >
          New
          <Badge variant="secondary" className="ml-2">{newCount}</Badge>
        </Button>
        <Button
          variant={filterStatus === "read" ? "default" : "outline"}
          onClick={() => setFilterStatus("read")}
          className={filterStatus === "read" ? "bg-blue-600" : ""}
        >
          Read
          <Badge variant="secondary" className="ml-2">{readCount}</Badge>
        </Button>
        <Button
          variant={filterStatus === "replied" ? "default" : "outline"}
          onClick={() => setFilterStatus("replied")}
          className={filterStatus === "replied" ? "bg-blue-600" : ""}
        >
          Replied
          <Badge variant="secondary" className="ml-2">{repliedCount}</Badge>
        </Button>
      </div>

      {/* Messages List */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Contact Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                No messages found
              </h3>
              <p className="text-slate-500">
                {filterStatus === "all" 
                  ? "No contact messages have been received yet."
                  : `No ${filterStatus} messages.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800">{message.subject}</h3>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {message.name} ({message.email})
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(message.created_date), "MMM d, yyyy 'at' HH:mm")}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMessage(message);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedMessage.subject}</h2>
                  <Badge className={`${getStatusColor(selectedMessage.status)} mt-2`}>
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Message Info */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-slate-700">From:</span>
                    <span className="text-slate-600">{selectedMessage.name} ({selectedMessage.email})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyEmailToClipboard}
                      className="ml-2"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Email
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-slate-700">Received:</span>
                    <span className="text-slate-600">
                      {format(new Date(selectedMessage.created_date), "MMMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  {!isCheckingUser && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-700">User Status:</span>
                      {userExists ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Registered User - Email Available
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Not Registered - Manual Email Required
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Original Message */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Message:</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Previous Response (if exists) */}
                {selectedMessage.admin_response && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Previous Response:</h3>
                    <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
                      <p className="text-slate-700 whitespace-pre-wrap mb-2">{selectedMessage.admin_response}</p>
                      <p className="text-xs text-slate-500">
                        Sent by {selectedMessage.responded_by} on {format(new Date(selectedMessage.responded_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {statusMessage && (
                  <Alert className={statusMessage.includes('success') || statusMessage.includes('copied') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {statusMessage.includes('success') || statusMessage.includes('copied') ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={statusMessage.includes('success') || statusMessage.includes('copied') ? 'text-green-800' : 'text-red-800'}>
                      {statusMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Response Form */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    {selectedMessage.status === "replied" ? "Send Another Response:" : "Send Response:"}
                  </h3>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                    rows={6}
                    className="mb-4"
                    disabled={isSending}
                  />
                  
                  {userExists ? (
                    <Button
                      onClick={handleSendResponse}
                      disabled={isSending || !responseText.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isSending ? (
                        <>
                          <Send className="w-4 h-4 mr-2 animate-pulse" />
                          Sending Email...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Email Response
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          This user is not registered in the app. You can save your response for records, but you'll need to email them manually at: <strong>{selectedMessage.email}</strong>
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleSaveResponse}
                        disabled={isSending || !responseText.trim()}
                        variant="outline"
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        {isSending ? (
                          <>
                            <Send className="w-4 h-4 mr-2 animate-pulse" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Response (No Email Sent)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}