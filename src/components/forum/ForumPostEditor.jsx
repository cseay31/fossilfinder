import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Send, AlertTriangle, Loader2 } from 'lucide-react';

export default function ForumPostEditor({ currentUser, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // AI moderation check
      const moderationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a content moderator for an archaeology community forum. Review this post for inappropriate content.

Title: ${title.trim()}
Content: ${content.trim()}

Check for:
- Spam or promotional content
- Offensive language, hate speech, or personal attacks
- Misinformation or harmful content
- Content completely unrelated to archaeology/paleontology/fossils
- Vandalism, gibberish, or low-effort posts
- Harassment or bullying

Be reasonable - allow genuine questions, discussions, and sharing even if imperfect.

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
        setError(`Post rejected: ${moderationResult.reason}`);
        setIsSaving(false);
        return;
      }

      const tagArray = tags.split(",").map(t => t.trim()).filter(t => t);
      
      const postData = {
        title: title.trim(),
        category,
        tags: tagArray,
        content: content.trim(),
        author_name: currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Anonymous',
        views: 0,
        likes: 0,
        liked_by: [],
        reply_count: 0,
        is_pinned: false,
        is_locked: false
      };

      await base44.entities.ForumPost.create(postData);
      onSave();
    } catch (error) {
      console.error("Failed to create post:", error);
      setError(`Failed to create post: ${error.message || error}`);
    } finally {
      setIsSaving(false);
    }
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
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            Create New Post
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your post about?"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Discussion</SelectItem>
                  <SelectItem value="identification-help">Identification Help</SelectItem>
                  <SelectItem value="discoveries">Share Discoveries</SelectItem>
                  <SelectItem value="techniques">Techniques & Tips</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="fossil, help, trilobite"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Content * (Markdown supported)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or discoveries...

You can use Markdown:
# Header
**bold** and *italic*
- List items"
              className="mt-1 min-h-[250px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 rounded-b-xl flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Posts are AI-moderated for quality
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}