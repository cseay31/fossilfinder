import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThumbsUp, Clock, User, Eye, Send, Loader2, AlertTriangle, Pin, Lock } from 'lucide-react';
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';
import BackButton from '../components/mobile/BackButton';

export default function ForumPostPage({ isDarkMode }) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(true);
  const [newReply, setNewReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [postData, user] = await Promise.all([
        base44.entities.ForumPost.filter({ id }),
        base44.auth.me()
      ]);
      
      if (postData.length > 0) {
        setPost(postData[0]);
        await loadReplies(postData[0].id);
      }
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReplies = async (postId) => {
    try {
      const data = await base44.entities.ForumReply.filter({ post_id: postId }, "created_date");
      setReplies(data);
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleLikePost = async () => {
    if (!currentUser) return;

    const likedBy = post.liked_by || [];
    const hasLiked = likedBy.includes(currentUser.email);

    try {
      const updatedPost = {
        ...post,
        likes: hasLiked ? Math.max(0, (post.likes || 0) - 1) : (post.likes || 0) + 1,
        liked_by: hasLiked 
          ? likedBy.filter(email => email !== currentUser.email)
          : [...likedBy, currentUser.email]
      };
      
      await base44.entities.ForumPost.update(post.id, {
        likes: updatedPost.likes,
        liked_by: updatedPost.liked_by
      });
      
      setPost(updatedPost);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;
    if (post.is_locked) {
      setError("This post is locked and cannot receive new replies.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
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

      await base44.entities.ForumPost.update(post.id, {
        reply_count: (post.reply_count || 0) + 1
      });

      setPost(prev => ({ ...prev, reply_count: (prev.reply_count || 0) + 1 }));
      setNewReply("");
      loadReplies(post.id);
    } catch (error) {
      console.error("Failed to submit reply:", error);
      setError("Failed to submit reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category) => {
    const base = {
      general: "slate",
      "identification-help": "blue",
      discoveries: "green",
      techniques: "purple",
      resources: "amber",
      announcements: "red"
    }[category] || "slate";

    return isDarkMode 
      ? `bg-${base}-500/20 text-${base}-300`
      : `bg-${base}-100 text-${base}-800`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'} flex items-center justify-center`}>
        <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'} flex items-center justify-center p-4`}>
        <p className={isDarkMode ? 'text-white' : 'text-stone-800'}>Post not found</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'} pb-safe-bottom`}>
      <div className="sticky top-0 z-10 p-4 border-b backdrop-blur-xl" style={{
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      }}>
        <BackButton isDarkMode={isDarkMode} />
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Post */}
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-stone-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(post.category)}>
                {post.category?.replace(/-/g, ' ')}
              </Badge>
              {post.is_pinned && <Badge>Pinned</Badge>}
              {post.is_locked && <Badge>Locked</Badge>}
            </div>
            
            <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{post.title}</h1>
            
            <div className={`flex items-center gap-4 mb-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author_name || post.created_by?.split('@')[0]}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(post.created_date), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views || 0}
              </span>
            </div>

            <div className={`prose max-w-none mb-4 ${isDarkMode ? 'prose-invert' : ''}`}>
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLikePost}
              className={post.liked_by?.includes(currentUser?.email) ? "text-blue-600" : ""}
              style={{ userSelect: 'none' }}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              {post.likes || 0}
            </Button>
          </CardContent>
        </Card>

        {/* Replies */}
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-stone-200'}`}>
          <CardContent className="p-6">
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Replies ({replies.length})
            </h3>

            {isLoadingReplies ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : replies.length === 0 ? (
              <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                No replies yet
              </p>
            ) : (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-lg p-4`}>
                    <div className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {reply.author_name || reply.created_by?.split('@')[0]}
                    </div>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{reply.content}</p>
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {format(new Date(reply.created_date), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!post.is_locked && (
              <div className="mt-4 space-y-2">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                    className={`flex-1 ${isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : ''}`}
                  />
                  <Button
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !newReply.trim()}
                    style={{ userSelect: 'none' }}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}