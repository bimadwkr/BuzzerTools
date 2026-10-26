'use client';

import React, { useState, useEffect } from 'react';
import { getStoredPresets, savePreset, deletePreset, Preset, DEFAULT_PRESETS } from '@/lib/storage';
import { Sliders, Plus, Trash2, Edit2, Check, Globe } from 'lucide-react';

export default function PresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<Preset>({
    id: '',
    name: '',
    description: '',
    platform: 'Reddit',
    intent: 'Agree and Add Value',
    tone: 'Casual',
    capitalization: 'Normal capitalization',
    length: 'Medium: 25–60 words',
    language: 'English',
    variationsCount: 3,
  });

  useEffect(() => {
    setPresets(getStoredPresets());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPreset.name.trim()) return;

    const presetToSave = {
      ...currentPreset,
      id: currentPreset.id || `${Date.now()}`,
    };

    savePreset(presetToSave);
    setPresets(getStoredPresets());
    setIsEditing(false);
    setCurrentPreset({
      id: '',
      name: '',
      description: '',
      platform: 'Reddit',
      intent: 'Agree and Add Value',
      tone: 'Casual',
      capitalization: 'Normal capitalization',
      length: 'Medium: 25–60 words',
      language: 'English',
      variationsCount: 3,
    });
  };

  const handleEdit = (preset: Preset) => {
    setCurrentPreset(preset);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    deletePreset(id);
    setPresets(getStoredPresets());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Generation Presets</h1>
          <p className="text-sm text-muted-foreground">Manage reusable templates for comment styles and intents.</p>
        </div>
        <button
          onClick={() => {
            setCurrentPreset({
              id: '',
              name: '',
              description: '',
              platform: 'Reddit',
              intent: 'Agree and Add Value',
              tone: 'Casual',
              capitalization: 'Normal capitalization',
              length: 'Medium: 25–60 words',
              language: 'English',
              variationsCount: 3,
            });
            setIsEditing(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Preset</span>
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground">{currentPreset.id ? 'Edit Preset' : 'Create New Preset'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Preset Name</label>
              <input
                type="text"
                required
                value={currentPreset.name}
                onChange={(e) => setCurrentPreset({ ...currentPreset, name: e.target.value })}
                placeholder="e.g. Expert Tech Reply"
                className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Platform</label>
              <select
                value={currentPreset.platform}
                onChange={(e) => setCurrentPreset({ ...currentPreset, platform: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Auto Detect">Auto Detect</option>
                <option value="Reddit">Reddit</option>
                <option value="Quora">Quora</option>
                <option value="Threads">Threads</option>
                <option value="X / Twitter">X / Twitter</option>
                <option value="Generic Discussion">Generic Discussion</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <input
                type="text"
                value={currentPreset.description}
                onChange={(e) => setCurrentPreset({ ...currentPreset, description: e.target.value })}
                placeholder="Brief description of this preset's style..."
                className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
            >
              Save Preset
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presets.map((preset) => (
          <div key={preset.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-foreground">{preset.name}</h3>
                <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>{preset.platform}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">{preset.intent}</span>
                <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">{preset.tone} tone</span>
                <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">{preset.variationsCount} variations</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
              <button
                onClick={() => handleEdit(preset)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Edit preset"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(preset.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete preset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
