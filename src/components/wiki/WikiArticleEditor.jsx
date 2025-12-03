import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Save, Eye, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';

export default function WikiArticleEditor({ article, onSave, onClose }) {
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [category, setCategory] = useState(article?.category || "getting-started");
  const [tags, setTags] = useState(article?.tags?.join(", ") || "");
  const [content, setContent] = useState(article?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    // Auto-generate slug from title
    if (!article && title) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(autoSlug);
    }
  }, [title, article]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
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
        prompt: `You are a content moderator for an archaeology education wiki. Review this article for inappropriate content.

Title: ${title.trim()}
Content: ${content.trim()}

Check for:
- Spam or promotional content
- Offensive language or hate speech
- Misinformation or harmful content
- Content unrelated to archaeology/paleontology/education
- Vandalism or gibberish

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
        setError(`Content rejected: ${moderationResult.reason}`);
        setIsSaving(false);
        return;
      }

      const tagArray = tags.split(",").map(t => t.trim()).filter(t => t);
      
      const articleData = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        tags: tagArray,
        content: content.trim(),
        last_edited_by: currentUser?.email || "anonymous",
        version: article ? (article.version || 1) + 1 : 1
      };

      if (article) {
        // Update existing article
        await base44.entities.WikiArticle.update(article.id, articleData);
      } else {
        // Create new article
        await base44.entities.WikiArticle.create(articleData);
      }

      onSave();
    } catch (error) {
      console.error("Failed to save article:", error);
      setError(`Failed to save article: ${error.message || error}`);
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
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {article ? 'Edit Article' : 'Create New Article'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="getting-started">Getting Started</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                    <SelectItem value="archaeology">Archaeology</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tutorial, basics, upload"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Content Editor with Preview */}
            <div>
              <Label>Content * (Markdown supported)</Label>
              <Tabs defaultValue="edit" className="mt-1">
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit" className="mt-4">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="# Article Title&#10;&#10;Write your article content here using Markdown...&#10;&#10;## Section&#10;&#10;- List item 1&#10;- List item 2"
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <div className="mt-2 text-xs text-slate-500">
                    <strong>Markdown tips:</strong> # Header, **bold**, *italic*, [link](url), - list item
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="min-h-[400px] border rounded-lg p-6 bg-slate-50">
                    {content ? (
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="text-3xl font-bold text-slate-800 mt-6 mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-2xl font-semibold text-slate-800 mt-5 mb-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xl font-semibold text-slate-800 mt-4 mb-2">{children}</h3>,
                            p: ({ children }) => <p className="text-slate-700 mb-4 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-700">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                            code: ({ inline, children }) => inline ? (
                              <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-700 text-sm">{children}</code>
                            ) : (
                              <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto mb-4">
                                <code>{children}</code>
                              </pre>
                            ),
                          }}
                        >
                          {content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No content to preview</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 rounded-b-xl flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {article && (
              <span>Current version: {article.version || 1} • Will be saved as version {(article.version || 1) + 1}</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {article ? 'Save Changes' : 'Publish Article'}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}