import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Loader2, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LiveMessaging({ isDarkMode }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAdmin();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const loadAdmin = async () => {
    try {
      const admin = await base44.auth.me();
      setCurrentAdmin(admin);
    } catch (error) {
      console.error("Failed to load admin:", error);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await base44.entities.User.list();
      const nonAdminUsers = allUsers.filter(u => u.role !== 'admin');
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedUser) return;

    try {
      const sent = await base44.entities.LiveMessage.filter({
        to_user_email: selectedUser.email
      });

      const received = await base44.entities.LiveMessage.filter({
        from_user_email: selectedUser.email
      });

      const allMessages = [...sent, ...received]
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

      setMessages(allMessages);

      // Mark admin's received messages as read
      const unreadFromUser = received.filter(m => !m.is_read);
      for (const msg of unreadFromUser) {
        await base44.entities.LiveMessage.update(msg.id, { is_read: true });
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedUser || isSending) return;

    setIsSending(true);
    try {
      await base44.entities.LiveMessage.create({
        to_user_email: selectedUser.email,
        from_user_email: currentAdmin.email,
        from_user_name: `Admin ${currentAdmin.full_name || currentAdmin.email}`,
        message: messageText,
        is_read: false
      });

      setMessageText("");
      await loadMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getUnreadCount = (userEmail) => {
    return messages.filter(
      m => m.from_user_email === userEmail && !m.is_read
    ).length;
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[700px]">
      {/* Users List */}
      <Card className={`${isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'} h-full flex flex-col`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Users
          </CardTitle>
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`mt-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : ''}`}
          />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            filteredUsers.map(user => {
              const unread = getUnreadCount(user.email);
              return (
                <button
                  key={user.email}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedUser?.email === user.email
                      ? isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 border-2 border-blue-300'
                      : isDarkMode
                        ? 'bg-slate-900/50 hover:bg-slate-800/50 text-slate-300'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        {user.full_name || user.email}
                      </span>
                    </div>
                    {unread > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {unread}
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${
                    selectedUser?.email === user.email 
                      ? 'text-blue-100' 
                      : 'text-slate-500'
                  }`}>
                    {user.email}
                  </p>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className={`${isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'} md:col-span-2 h-full flex flex-col`}>
        {selectedUser ? (
          <>
            <CardHeader className="pb-3 border-b border-slate-200">
              <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                <MessageCircle className="w-5 h-5 text-blue-500" />
                {selectedUser.full_name || selectedUser.email}
              </CardTitle>
              <p className="text-sm text-slate-500">{selectedUser.email}</p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isFromAdmin = msg.from_user_email === currentAdmin?.email;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isFromAdmin
                            ? 'bg-blue-600 text-white'
                            : isDarkMode
                              ? 'bg-slate-700 text-slate-200'
                              : 'bg-slate-100 text-slate-800'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" />
                            <p className={`text-xs ${
                              isFromAdmin ? 'text-blue-100' : 'text-slate-500'
                            }`}>
                              {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className={`flex-1 min-h-[60px] ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : ''}`}
                  disabled={isSending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageText.trim() || isSending}
                  className="bg-blue-600 hover:bg-blue-700 h-[60px] px-6"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">Select a user to start messaging</p>
              <p className="text-sm mt-2">Choose a user from the list to send them a message</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}