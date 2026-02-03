import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Clock, User, Tag, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import BackButton from '../components/mobile/BackButton';

export default function WikiArticlePage({ isDarkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      const data = await base44.entities.WikiArticle.filter({ id });
      if (data.length > 0) {
        setArticle(data[0]);
        // Increment view count
        await base44.entities.WikiArticle.update(data[0].id, {
          views: (data[0].views || 0) + 1
        });
      }
    } catch (error) {
      console.error("Failed to load article:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'} flex items-center justify-center`}>
        <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'} flex items-center justify-center p-4`}>
        <p className={isDarkMode ? 'text-white' : 'text-stone-800'}>Article not found</p>
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

      <div className="max-w-4xl mx-auto p-4">
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-stone-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}>
                {article.category?.replace(/-/g, ' ')}
              </Badge>
              <div className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Eye className="w-4 h-4" />
                {article.views || 0} views
              </div>
            </div>
            
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{article.title}</h1>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-6">
                {article.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className={`prose prose-slate max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className={`text-3xl font-bold mt-6 mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{children}</h1>,
                  h2: ({ children }) => <h2 className={`text-2xl font-semibold mt-5 mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{children}</h2>,
                  h3: ({ children }) => <h3 className={`text-xl font-semibold mt-4 mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{children}</h3>,
                  p: ({ children }) => <p className={`mb-4 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{children}</li>,
                  strong: ({ children }) => <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{children}</strong>,
                  code: ({ inline, children }) => inline ? (
                    <code className={`px-1 py-0.5 rounded text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>{children}</code>
                  ) : (
                    <pre className={`rounded-lg p-4 overflow-x-auto mb-4 ${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-900 text-slate-100'}`}>
                      <code>{children}</code>
                    </pre>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            <div className={`mt-8 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Version {article.version || 1}</span>
                </div>
                {article.last_edited_by && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Edited by {article.last_edited_by.split('@')[0]}</span>
                  </div>
                )}
                {article.updated_date && (
                  <span>• {format(new Date(article.updated_date), "MMM d, yyyy")}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}