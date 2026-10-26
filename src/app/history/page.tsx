'use client';

import React, { useState, useEffect } from 'react';
import { GenerationResult } from '@/lib/ai/types';
import { getStoredHistory, clearHistory } from '@/lib/storage';
import { History as HistoryIcon, Trash2, Calendar, Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getStoredHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Generation History</h1>
          <p className="text-sm text-muted-foreground">Review and reopen past comment generations.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl text-center p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No generation history</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Generated comments will appear here automatically for quick reference.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Go to Generator</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item, idx) => (
            <div key={item.timestamp || idx} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-primary">{item.provider}</span>
                  <span>•</span>
                  <span>{item.model}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                  {item.comments.length} variations
                </span>
              </div>

              <div className="space-y-3">
                {item.comments.map((comment, cIdx) => (
                  <div key={comment.id || cIdx} className="bg-secondary/40 p-4 rounded-xl flex items-start justify-between gap-4">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    <button
                      onClick={() => handleCopy(comment.text, comment.id || `${idx}-${cIdx}`)}
                      className="flex-shrink-0 p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy comment"
                    >
                      {copiedId === (comment.id || `${idx}-${cIdx}`) ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
