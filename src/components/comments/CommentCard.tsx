'use client';

import React, { useState } from 'react';
import { GeneratedComment } from '@/lib/ai/types';
import { Copy, Check, Edit2, Bookmark, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { toggleFavorite } from '@/lib/storage';

interface CommentCardProps {
  comment: GeneratedComment;
  index: number;
  onUpdate: (updated: GeneratedComment) => void;
  onRegenerateSingle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CommentCard({ comment, index, onUpdate, onRegenerateSingle, onDelete }: CommentCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isFav, setIsFav] = useState(comment.isFavorite || false);

  const handleCopy = () => {
    navigator.clipboard.writeText(comment.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdate({ ...comment, text: editText, wordCount: editText.trim().split(/\s+/).length });
    setIsEditing(false);
  };

  const handleToggleFav = () => {
    toggleFavorite(comment);
    setIsFav(!isFav);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
            Variation #{index + 1}
          </span>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>{comment.wordCount} words</span>
            <span>•</span>
            <span className="capitalize">{comment.tone}</span>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3 mb-4">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-foreground text-sm leading-relaxed mb-4 whitespace-pre-wrap">{comment.text}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            title="Copy text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Edit comment"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRegenerateSingle(comment.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Regenerate this variation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleToggleFav}
            className={`p-1.5 rounded-lg transition-colors ${
              isFav ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            title="Favorite comment"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => onDelete(comment.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete comment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
