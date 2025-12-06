import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Send, MessageCircle, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveMessagePopup() {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    if (messages.length > 0 && !isOpen) {
      const unread = messages.filter(m => !m.is_read && m.to_user_email === currentUser?.email).length;
      setUnreadCount(unread);
      if (unread > 0) {
        setIsOpen(true);
      }
    }
  }, [messages, currentUser]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      markAsRead();
    }
  }, [messages, isOpen, isMinimized]);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadMessages = async () => {
    try {
      if (!currentUser) return;
      
      const received = await base44.entities.LiveMessage.filter({
        to_user_email: currentUser.email
      });
      
      const sent = await base44.entities.LiveMessage.filter({
        from_user_email: currentUser.email
      });

      const allMessages = [...received, ...sent]
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
        .slice(-20);

      setMessages(allMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const markAsRead = async () => {
    try {
      const unreadMessages = messages.filter(
        m => !m.is_read && m.to_user_email === currentUser?.email
      );

      for (const msg of unreadMessages) {
        await base44.entities.LiveMessage.update(msg.id, { is_read: true });
      }
      
      if (unreadMessages.length > 0) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      await base44.entities.LiveMessage.create({
        to_user_email: "admin", // Send to admin
        from_user_email: currentUser.email,
        from_user_name: currentUser.full_name || currentUser.email,
        message: replyText,
        is_read: false
      });

      setReplyText("");
      await loadMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClose = () => {
    setIsOpen(false);
    setUnreadCount(0);
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Notification Badge */}
      <AnimatePresence>
        {!isOpen && unreadCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1">
                {unreadCount}
              </Badge>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Message Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="bg-white border-2 border-blue-200 shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between rounded-t-lg">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">Admin Messages</span>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              {!isMinimized && (
                <>
                  <div className="p-4 h-80 overflow-y-auto bg-slate-50 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isFromMe = msg.from_user_email === currentUser.email;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              isFromMe 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border-2 border-blue-200 text-slate-800'
                            }`}>
                              {!isFromMe && (
                                <p className="text-xs font-semibold mb-1 text-blue-600">
                                  {msg.from_user_name || 'Admin'}
                                </p>
                              )}
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-xs mt-1 ${isFromMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                {new Date(msg.created_date).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input */}
                  <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                        className="flex-1"
                        disabled={isSending}
                      />
                      <Button
                        onClick={sendReply}
                        disabled={!replyText.trim() || isSending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}