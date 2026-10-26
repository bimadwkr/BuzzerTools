'use client';

import React, { useState, useEffect } from 'react';
import { GeneratedComment } from '@/lib/ai/types';
import { getStoredFavorites, toggleFavorite } from '@/lib/storage';
import { Bookmark, Copy, Check, Trash2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<GeneratedComment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setFavorites(getStoredFavorites());
  }, []);

  const handleRemove = (comment: GeneratedComment) => {
    toggleFavorite(comment);
    setFavorites(getStoredFavorites());
  };

  const handleCopy = (comment: GeneratedComment) => {
    navigator.clipboard.writeText(comment.text);
    setCopiedId(comment.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Favorite Comments</h1>
        <p className="text-sm text-muted-foreground">Access your bookmarked and saved comment variations.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl text-center p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No favorite comments yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Click the bookmark icon on any generated comment to save it to your favorites.
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
        <div className="space-y-4">
          {favorites.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground capitalize">{comment.intent}</span>
                    <span>•</span>
                    <span className="capitalize">{comment.tone} tone</span>
                    <span>•</span>
                    <span>{comment.wordCount} words</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium flex items-center space-x-1">
                    <Bookmark className="w-3 h-3 fill-current" />
                    <span>Saved</span>
                  </span>
                </div>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  onClick={() => handleCopy(comment)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  {copiedId === comment.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === comment.id ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleRemove(comment)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
