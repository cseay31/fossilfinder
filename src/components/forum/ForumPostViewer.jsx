import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, ThumbsUp, MessageCircle, Clock, User, Eye, Send, Loader2, AlertTriangle, Pin, Lock } from 'lucide-react';
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';

export default function ForumPostViewer({ post, currentUser, onClose }) {
  const [replies, setReplies] = useState([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(true);
  const [newReply, setNewReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [localPost, setLocalPost] = useState(post);

  useEffect(() => {
    loadReplies();
  }, [post.id]);

  const loadReplies = async () => {
    try {
      const data = await base44.entities.ForumReply.filter({ post_id: post.id }, "created_date");
      setReplies(data);
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleLikePost = async () => {
    if (!currentUser) return;

    const likedBy = localPost.liked_by || [];
    const hasLiked = likedBy.includes(currentUser.email);

    try {
      const updatedPost = {
        ...localPost,
        likes: hasLiked ? Math.max(0, (localPost.likes || 0) - 1) : (localPost.likes || 0) + 1,
        liked_by: hasLiked 
          ? likedBy.filter(email => email !== currentUser.email)
          : [...likedBy, currentUser.email]
      };
      
      await base44.entities.ForumPost.update(post.id, {
        likes: updatedPost.likes,
        liked_by: updatedPost.liked_by
      });
      
      setLocalPost(updatedPost);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleLikeReply = async (reply) => {
    if (!currentUser) return;

    const likedBy = reply.liked_by || [];
    const hasLiked = likedBy.includes(currentUser.email);

    try {
      await base44.entities.ForumReply.update(reply.id, {
        likes: hasLiked ? Math.max(0, (reply.likes || 0) - 1) : (reply.likes || 0) + 1,
        liked_by: hasLiked 
          ? likedBy.filter(email => email !== currentUser.email)
          : [...likedBy, currentUser.email]
      });
      loadReplies();
    } catch (error) {
      console.error("Failed to like reply:", error);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;
    if (localPost.is_locked) {
      setError("This post is locked and cannot receive new replies.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // AI moderation check
      const moderationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a content moderator for an archaeology community forum. Review this reply for inappropriate content.

Reply content: ${newReply.trim()}

Check for:
- Spam or promotional content
- Offensive language, hate speech, or personal attacks
- Completely off-topic or nonsensical content
- Harassment or bullying

Be reasonable - allow genuine responses even if brief.

Return your assessment.`,
        response_json_schema: {
          type: "object",
          properties: {
            is_appropriate: { type: "boolean" },
            reason: { type: "string" }
          }
        }
      });

      if (!moderationResult.is_appropriate) {
        setError(`Reply rejected: ${moderationResult.reason}`);
        setIsSubmitting(false);
        return;
      }

      await base44.entities.ForumReply.create({
        post_id: post.id,
        content: newReply.trim(),
        author_name: currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Anonymous',
        likes: 0,
        liked_by: []
      });

      // Update reply count
      await base44.entities.ForumPost.update(post.id, {
        reply_count: (localPost.reply_count || 0) + 1
      });

      setLocalPost(prev => ({ ...prev, reply_count: (prev.reply_count || 0) + 1 }));
      setNewReply("");
      loadReplies();
    } catch (error) {
      console.error("Failed to submit reply:", error);
      setError("Failed to submit reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: "bg-slate-100 text-slate-800 border-slate-200",
      "identification-help": "bg-blue-100 text-blue-800 border-blue-200",
      discoveries: "bg-green-100 text-green-800 border-green-200",
      techniques: "bg-purple-100 text-purple-800 border-purple-200",
      resources: "bg-amber-100 text-amber-800 border-amber-200",
      announcements: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[category] || colors.general;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(localPost.category)}>
                {localPost.category?.replace(/-/g, ' ')}
              </Badge>
              {localPost.is_pinned && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Pin className="w-3 h-3 mr-1" />
                  Pinned
                </Badge>
              )}
              {localPost.is_locked && (
                <Badge className="bg-slate-100 text-slate-800 border-slate-200">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{localPost.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {localPost.author_name || localPost.created_by?.split('@')[0]}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(localPost.created_date), "MMM d, yyyy 'at' h:mm a")}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {localPost.views || 0} views
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Post content */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold text-slate-800 mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="text-slate-700 mb-3 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-700">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                  code: ({ inline, children }) => inline ? (
                    <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700 text-sm">{children}</code>
                  ) : (
                    <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto mb-3">
                      <code>{children}</code>
                    </pre>
                  ),
                }}
              >
                {localPost.content}
              </ReactMarkdown>
            </div>

            {localPost.tags && localPost.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {localPost.tags.map((tag, idx) => (
                  <span key={idx} className="text-sm text-blue-600">#{tag}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLikePost}
                className={localPost.liked_by?.includes(currentUser?.email)
                  ? "text-blue-600 bg-blue-50 border-blue-200"
                  : ""}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {localPost.likes || 0} Likes
              </Button>
              <span className="text-sm text-slate-500">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                {localPost.reply_count || 0} Replies
              </span>
            </div>
          </div>

          {/* Replies section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Replies ({replies.length})
            </h3>

            {isLoadingReplies ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : replies.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No replies yet. Be the first to respond!
              </p>
            ) : (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-slate-800">
                          {reply.author_name || reply.created_by?.split('@')[0]}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          {format(new Date(reply.created_date), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-700 mb-2">{reply.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeReply(reply)}
                      className={`text-xs ${reply.liked_by?.includes(currentUser?.email)
                        ? "text-blue-600"
                        : "text-slate-500"}`}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {reply.likes || 0}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply input */}
        {!localPost.is_locked && (
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
            {error && (
              <Alert className="mb-3 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-3">
              <Textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 min-h-[60px] max-h-[120px]"
              />
              <Button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !newReply.trim()}
                className="bg-blue-600 hover:bg-blue-700 self-end"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Replies are AI-moderated</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}