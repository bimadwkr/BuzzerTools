'use client';

import React, { useState, useEffect } from 'react';
import {
  ProviderConfig,
  GenerationParams,
  GeneratedComment,
  GenerationResult,
} from '@/lib/ai/types';
import {
  getStoredProviders,
  getDefaultProviderKey,
  saveToHistory,
  getStoredPresets,
  Preset,
} from '@/lib/storage';
import { CommentCard } from '../comments/CommentCard';
import {
  Sparkles,
  Settings,
  Sliders,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  Globe,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

const INTENTS = [
  'Agree and Add Value',
  'Disagree Respectfully',
  'Share a Perspective',
  'Ask a Thoughtful Question',
  'Provide a Helpful Answer',
  'Add a New Insight',
  'Share a Relevant Experience',
  'Give Constructive Feedback',
  'Challenge an Assumption',
  'Offer a Counterargument',
  'Write a Short Reaction',
  'Make a Light Joke',
  'Start a Conversation',
  'Subtle Product Mention',
  'Custom Instructions',
];

const TONES = [
  'Casual',
  'Friendly',
  'Professional',
  'Analytical',
  'Empathetic',
  'Curious',
  'Witty',
  'Direct',
  'Thought-provoking',
  'Persuasive',
  'Skeptical',
  'Supportive',
  'Academic',
  'Humorous',
  'Custom Tone',
];

const PLATFORMS = ['Auto Detect', 'Reddit', 'Quora', 'Threads', 'X / Twitter', 'Generic Discussion'];
const CAPITALIZATIONS = [
  'Normal capitalization',
  'all lowercase',
  'ALL UPPERCASE',
  'Sentence case',
  'Preserve natural capitalization',
];
const LENGTHS = ['Very Short: 3–10 words', 'Short: 10–25 words', 'Medium: 25–60 words', 'Long: 60–120 words', 'Custom word range'];
const LANGUAGES = ['Auto Detect', 'English', 'Indonesian', 'Custom Language'];
const VARIATIONS = [1, 3, 5, 10];

export function CommentGenerator() {
  const [providers, setProviders] = useState<Record<string, ProviderConfig>>({});
  const [defaultProviderKey, setDefaultProviderKeyStr] = useState<string>('');
  const [activeProviderKey, setActiveProviderKey] = useState<string>('');
  const [activeModel, setActiveModel] = useState<string>('');

  // Form states
  const [sourcePost, setSourcePost] = useState('');
  const [platform, setPlatform] = useState('Auto Detect');
  const [intent, setIntent] = useState('Agree and Add Value');
  const [customIntent, setCustomIntent] = useState('');
  const [tone, setTone] = useState('Casual');
  const [customTone, setCustomTone] = useState('');
  const [capitalization, setCapitalization] = useState('Normal capitalization');
  const [length, setLength] = useState('Medium: 25–60 words');
  const [customLength, setCustomLength] = useState({ min: 25, max: 60 });
  const [language, setLanguage] = useState('English');
  const [customLanguage, setCustomLanguage] = useState('');
  const [variationsCount, setVariationsCount] = useState(3);

  // Writing style toggles
  const [writingStyle, setWritingStyle] = useState({
    contractions: true,
    minimalPunctuation: false,
    noEmojis: true,
    noHashtags: true,
    noGenericPhrases: true,
    noIntroPhrases: true,
    noExcessiveFormality: false,
    noRepetitiveStructure: true,
  });

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creativity, setCreativity] = useState(0.7);
  const [additionalContext, setAdditionalContext] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [wordsToAvoid, setWordsToAvoid] = useState('');
  const [requiredKeywords, setRequiredKeywords] = useState('');

  // Presets
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<GeneratedComment[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    const provs = getStoredProviders();
    const defKey = getDefaultProviderKey();
    setProviders(provs);
    setDefaultProviderKeyStr(defKey);

    if (defKey && provs[defKey]) {
      setActiveProviderKey(defKey);
      setActiveModel(provs[defKey].model);
    } else {
      const firstKey = Object.keys(provs)[0];
      if (firstKey) {
        setActiveProviderKey(firstKey);
        setActiveModel(provs[firstKey].model);
      }
    }

    setPresets(getStoredPresets());
  }, []);

  const handleProviderChange = (key: string) => {
    setActiveProviderKey(key);
    if (providers[key]) {
      setActiveModel(providers[key].model);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    setPlatform(preset.platform);
    setIntent(preset.intent);
    setTone(preset.tone);
    setCapitalization(preset.capitalization);
    setLength(preset.length);
    setLanguage(preset.language);
    setVariationsCount(preset.variationsCount);
  };

  const handleGenerate = async () => {
    if (!sourcePost.trim()) {
      setError('Please paste a source post first.');
      return;
    }
    if (!activeProviderKey || !providers[activeProviderKey]) {
      setError('Please configure and select a valid AI provider in Settings.');
      return;
    }

    setLoading(true);
    setError('');
    setComments([]);

    const providerConfig: ProviderConfig = {
      ...providers[activeProviderKey],
      model: activeModel || providers[activeProviderKey].model,
    };

    const params: GenerationParams = {
      sourcePost,
      platform,
      intent,
      customIntent,
      tone,
      customTone,
      capitalization,
      writingStyle,
      length,
      customLength,
      language,
      customLanguage,
      variationsCount,
      advanced: {
        creativity,
        additionalContext,
        customInstructions,
        wordsToAvoid,
        requiredKeywords,
      },
      providerConfig,
    };

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate comments');
      }

      const generated: GeneratedComment[] = data.comments.map((text: string, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        text,
        wordCount: text.trim().split(/\s+/).length,
        intent,
        tone,
      }));

      setComments(generated);

      const resultRecord: GenerationResult = {
        comments: generated,
        provider: activeProviderKey,
        model: activeModel,
        timestamp: Date.now(),
      };
      saveToHistory(resultRecord);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComment = (updated: GeneratedComment) => {
    setComments(comments.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const handleRegenerateSingle = async (id: string) => {
    // Regenerate single comment by requesting 1 variation with same params
    if (!providers[activeProviderKey]) return;
    try {
      const providerConfig = { ...providers[activeProviderKey], model: activeModel };
      const params: GenerationParams = {
        sourcePost,
        platform,
        intent,
        customIntent,
        tone,
        customTone,
        capitalization,
        writingStyle,
        length,
        customLength,
        language,
        customLanguage,
        variationsCount: 1,
        advanced: { creativity, additionalContext, customInstructions, wordsToAvoid, requiredKeywords },
        providerConfig,
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok && data.comments?.[0]) {
        const newText = data.comments[0];
        setComments(
          comments.map((c) =>
            c.id === id ? { ...c, text: newText, wordCount: newText.trim().split(/\s+/).length } : c
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyAll = () => {
    const allText = comments.map((c, i) => `[Variation ${i + 1}]\n${c.text}`).join('\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const hasConfiguredProviders = Object.keys(providers).length > 0;

  if (!hasConfiguredProviders) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Settings className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Welcome to Buzzer Tools</h1>
        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          Buzzer Tools requires at least one AI provider API key configured before you can generate contextual comments for Reddit, Quora, Threads, and X.
        </p>
        <Link
          href="/settings"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Configure AI Provider in Settings</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Preset Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Presets & Templates</span>
            <p className="text-xs text-muted-foreground">Quickly load proven response configurations</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPresetId}
            onChange={(e) => handleApplyPreset(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a preset...</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.platform})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Post */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Source Post / Discussion</span>
              </label>
              <button
                onClick={() => setSourcePost('')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
            <textarea
              value={sourcePost}
              onChange={(e) => setSourcePost(e.target.value)}
              placeholder="Paste a Reddit post, Quora question, Threads post, or X discussion..."
              rows={6}
              className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{sourcePost.length} characters</span>
              <span>{sourcePost.trim() ? sourcePost.trim().split(/\s+/).length : 0} words</span>
            </div>
          </div>

          {/* AI Provider & Model */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI Provider & Model</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Provider</label>
                <select
                  value={activeProviderKey}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                >
                  {Object.keys(providers).map((key) => (
                    <option key={key} value={key}>
                      {key.toUpperCase()} {key === defaultProviderKey ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Model ID</label>
                <input
                  type="text"
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value)}
                  placeholder="e.g. gpt-4o-mini, gemini-2.5-flash"
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Platform & Intent */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Platform & Response Intent</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Variations</label>
                <select
                  value={variationsCount}
                  onChange={(e) => setVariationsCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {VARIATIONS.map((v) => (
                    <option key={v} value={v}>
                      {v} {v === 1 ? 'comment' : 'comments'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Intent / Strategy</label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {INTENTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              {intent === 'Custom Instructions' && (
                <input
                  type="text"
                  value={customIntent}
                  onChange={(e) => setCustomIntent(e.target.value)}
                  placeholder="Enter custom intent instructions..."
                  className="w-full mt-2 p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          </div>

          {/* Tone & Style */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Tone, Length & Style</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {tone === 'Custom Tone' && (
                  <input
                    type="text"
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder="Enter custom tone..."
                    className="w-full mt-2 p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Comment Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LENGTHS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Capitalization</label>
                <select
                  value={capitalization}
                  onChange={(e) => setCapitalization(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CAPITALIZATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={writingStyle.contractions}
                  onChange={(e) => setWritingStyle({ ...writingStyle, contractions: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span>Use contractions</span>
              </label>
              <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={writingStyle.noEmojis}
                  onChange={(e) => setWritingStyle({ ...writingStyle, noEmojis: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span>No emojis</span>
              </label>
              <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={writingStyle.noHashtags}
                  onChange={(e) => setWritingStyle({ ...writingStyle, noHashtags: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span>No hashtags</span>
              </label>
              <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={writingStyle.noGenericPhrases}
                  onChange={(e) => setWritingStyle({ ...writingStyle, noGenericPhrases: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span>No AI filler phrases</span>
              </label>
            </div>
          </div>

          {/* Advanced Settings Expandable */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 flex items-center justify-between text-sm font-semibold text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <span>Advanced Settings</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAdvanced && (
              <div className="p-5 space-y-4 border-t border-border text-sm">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Creativity (Temperature)</span>
                    <span>{creativity}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={creativity}
                    onChange={(e) => setCreativity(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Custom Instructions</label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Extra guidance for the AI..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Words to Avoid</label>
                  <input
                    type="text"
                    value={wordsToAvoid}
                    onChange={(e) => setWordsToAvoid(e.target.value)}
                    placeholder="e.g. synergy, leverage, game-changer"
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Required Keywords</label>
                  <input
                    type="text"
                    value={requiredKeywords}
                    onChange={(e) => setRequiredKeywords(e.target.value)}
                    placeholder="e.g. open source, latency"
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating {variationsCount} Comments...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Comments</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Comments Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl shadow-sm">
            <div>
              <h2 className="text-base font-bold text-foreground">Generated Comments</h2>
              <p className="text-xs text-muted-foreground">
                {comments.length > 0 ? `${comments.length} variations ready` : 'No comments generated yet'}
              </p>
            </div>
            {comments.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyAll}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate All</span>
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl space-y-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Crafting high-quality comments with {activeProviderKey.toUpperCase()}...</p>
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Ready to generate</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Paste your source post on the left, choose your intent and tone, and click Generate Comments.
              </p>
            </div>
          )}

          {!loading && comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  index={index}
                  onUpdate={handleUpdateComment}
                  onRegenerateSingle={handleRegenerateSingle}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
