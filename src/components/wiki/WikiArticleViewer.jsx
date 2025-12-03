import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Eye, Clock, User, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

export default function WikiArticleViewer({ article, onClose, onEdit }) {
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
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                {article.category?.replace(/-/g, ' ')}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Eye className="w-4 h-4" />
                {article.views || 0} views
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{article.title}</h2>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
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
                  <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700 text-sm">{children}</code>
                ) : (
                  <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto mb-4">
                    <code>{children}</code>
                  </pre>
                ),
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline">
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-indigo-300 pl-4 my-4 text-slate-600 italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Version {article.version || 1}</span>
              </div>
              {article.last_edited_by && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Last edited by {article.last_edited_by.split('@')[0]}</span>
                </div>
              )}
              {article.updated_date && (
                <span>• {format(new Date(article.updated_date), "MMM d, yyyy 'at' h:mm a")}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}