import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AGENT_NAME = "admin_assistant";

export default function AdminAssistantChat({ isDarkMode, currentUser }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe && unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initConversation = async () => {
    try {
      const existing = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      if (existing && existing.length > 0) {
        const conv = await base44.agents.getConversation(existing[0].id);
        setConversation(conv);
        setMessages(conv.messages || []);
      } else {
        const conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: {
            name: `Admin Assistant — ${currentUser?.full_name || currentUser?.email}`,
            description: "Admin day-to-day assistant"
          }
        });
        setConversation(conv);
        setMessages(conv.messages || []);
      }
    } catch (err) {
      console.error("Failed to initialize admin assistant:", err);
    } finally {
      setIsInitializing(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !conversation || isSending) return;
    setIsSending(true);
    setInput("");
    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: text
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={isDarkMode ? "bg-slate-800/30 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className={`text-xl flex items-center gap-3 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-gradient-to-br from-cyan-500 to-purple-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              Admin Assistant
            </CardTitle>
            <CardDescription className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Ask for settings changes, moderation help, or insights about your app. Always asks for approval before changes.
            </CardDescription>
          </div>
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${isDarkMode ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin-only
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className={`h-[500px] overflow-y-auto rounded-xl border p-4 mb-4 ${isDarkMode ? "bg-slate-900/50 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}
        >
          {isInitializing ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className={`w-6 h-6 animate-spin ${isDarkMode ? "text-cyan-400" : "text-blue-500"}`} />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <Sparkles className={`w-10 h-10 mb-3 ${isDarkMode ? "text-cyan-400" : "text-blue-500"}`} />
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                How can I help you manage FossilFinder today?
              </p>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Try: "Turn off the forum", "Set an announcement banner", or "How many users joined this week?"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} isDarkMode={isDarkMode} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your request..."
            disabled={isSending || isInitializing}
            className={isDarkMode ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500" : ""}
          />
          <Button
            onClick={sendMessage}
            disabled={isSending || isInitializing || !input.trim()}
            className={isDarkMode ? "bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"}
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message, isDarkMode }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-gradient-to-br from-cyan-500 to-purple-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
        isUser
          ? isDarkMode ? "bg-cyan-600 text-white" : "bg-blue-600 text-white"
          : isDarkMode ? "bg-slate-800 border border-slate-700 text-slate-200" : "bg-white border border-slate-200 text-slate-800"
      }`}>
        {message.content && (
          isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )
        )}
        {message.tool_calls?.length > 0 && (
          <div className={`mt-2 space-y-1 ${isUser ? "" : "border-t pt-2"} ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
            {message.tool_calls.map((tc, i) => (
              <div key={i} className={`text-xs px-2 py-1 rounded ${isDarkMode ? "bg-slate-900/60 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                <span className="font-mono">{tc.name}</span>
                {tc.status && <span className="ml-2 opacity-70">• {tc.status}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}