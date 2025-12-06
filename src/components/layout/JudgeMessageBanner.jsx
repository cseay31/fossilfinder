import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Info, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JudgeMessageBanner() {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dismissedMessages, setDismissedMessages] = useState([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      const allMessages = await base44.entities.JudgeMessage.filter({
        judge_email: user.email,
        is_read: false
      });
      setMessages(allMessages);
    } catch (error) {
      console.error("Failed to load judge messages:", error);
    }
  };

  const dismissMessage = async (messageId) => {
    try {
      await base44.entities.JudgeMessage.update(messageId, { is_read: true });
      setDismissedMessages([...dismissedMessages, messageId]);
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error("Failed to dismiss message:", error);
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "help": return HelpCircle;
      case "welcome": return Sparkles;
      case "tip": return Info;
      default: return MessageSquare;
    }
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case "help": return "border-orange-200 bg-orange-50";
      case "welcome": return "border-purple-200 bg-purple-50";
      case "tip": return "border-cyan-200 bg-cyan-50";
      default: return "border-blue-200 bg-blue-50";
    }
  };

  const visibleMessages = messages.filter(m => !dismissedMessages.includes(m.id));

  if (visibleMessages.length === 0) return null;

  return (
    <div className="space-y-2 p-4">
      <AnimatePresence>
        {visibleMessages.map((message) => {
          const Icon = getMessageIcon(message.message_type);
          const style = getMessageStyle(message.message_type);
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert className={`${style} border-2 relative`}>
                <Icon className="h-5 w-5" />
                <AlertDescription className="ml-2 pr-8">
                  <div>
                    <p className="font-semibold mb-1">Message from {message.admin_name}:</p>
                    <p>{message.message}</p>
                  </div>
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => dismissMessage(message.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Alert>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}