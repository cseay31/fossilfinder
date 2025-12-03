import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, AlertTriangle, Info, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMessageBanner() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await base44.entities.AdminMessage.filter(
        { is_active: true },
        "-created_date"
      );
      
      // Filter out expired messages
      const now = new Date();
      const activeMessages = data.filter(msg => {
        if (!msg.expires_at) return true;
        return new Date(msg.expires_at) > now;
      });
      
      setMessages(activeMessages);
    } catch (error) {
      console.error("Failed to load admin messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || messages.length === 0) return null;

  const getMessageConfig = (type) => {
    const configs = {
      info: {
        icon: Info,
        color: 'border-blue-200 bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      success: {
        icon: Sparkles,
        color: 'border-green-200 bg-green-50',
        iconColor: 'text-green-600',
        textColor: 'text-green-800',
        badgeColor: 'bg-green-100 text-green-800 border-green-200'
      },
      warning: {
        icon: AlertTriangle,
        color: 'border-yellow-200 bg-yellow-50',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-800',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      announcement: {
        icon: Megaphone,
        color: 'border-purple-200 bg-purple-50',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-800',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
      }
    };
    return configs[type] || configs.info;
  };

  return (
    <AnimatePresence>
      <div className="space-y-3">
        {messages.map((message, index) => {
          const config = getMessageConfig(message.message_type);
          const Icon = config.icon;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Alert className={`${config.color} border-2`}>
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
                <AlertDescription className={config.textColor}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={config.badgeColor}>
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {message.from_name}
                        </Badge>
                      </div>
                      <p className="font-medium">{message.message}</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
}