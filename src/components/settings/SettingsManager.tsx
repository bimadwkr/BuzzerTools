'use client';

import React, { useState, useEffect } from 'react';
import { ProviderConfig, ProviderType } from '@/lib/ai/types';
import {
  getStoredProviders,
  saveProviderConfig,
  removeProviderConfig,
  getDefaultProviderKey,
  setDefaultProviderKey,
} from '@/lib/storage';
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, Trash2, Plus, Sparkles, ExternalLink } from 'lucide-react';

const PROVIDERS_META: { type: ProviderType; name: string; description: string; placeholder: string; docUrl: string }[] = [
  {
    type: 'gemini',
    name: 'Google Gemini API',
    description: 'Fast and versatile multimodal models like Gemini Flash and Pro.',
    placeholder: 'AIzaSy...',
    docUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    type: 'openai',
    name: 'OpenAI API',
    description: 'Industry standard GPT-4o, GPT-4o-mini, and reasoning models.',
    placeholder: 'sk-proj-...',
    docUrl: 'https://platform.openai.com/api-keys',
  },
  {
    type: 'anthropic',
    name: 'Anthropic Claude API',
    description: 'Claude 3.5 Sonnet and Haiku models renowned for nuanced writing.',
    placeholder: 'sk-ant-...',
    docUrl: 'https://console.anthropic.com/',
  },
  {
    type: 'openai-compatible',
    name: 'OpenAI-Compatible Endpoint',
    description: 'Connect local models (Ollama, LM Studio) or proxy services via OpenAI API format.',
    placeholder: 'optional-api-key',
    docUrl: 'https://ollama.com/',
  },
];

export function SettingsManager() {
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>({});
  const [defaultKey, setDefaultKey] = useState<string>('');

  // Form states per provider type
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    gemini: '',
    openai: '',
    anthropic: '',
    'openai-compatible': '',
  });
  const [baseUrls, setBaseUrls] = useState<Record<string, string>>({
    'openai-compatible': 'http://localhost:11434/v1',
  });
  const [models, setModels] = useState<Record<string, string>>({
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-20241022',
    'openai-compatible': 'llama3',
  });
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  // Status states
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [fetchingModels, setFetchingModels] = useState<Record<string, boolean>>({});
  const [availableModelsMap, setAvailableModelsMap] = useState<Record<string, string[]>>({});
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const stored = getStoredProviders();
    const def = getDefaultProviderKey();
    setConfigs(stored);
    setDefaultKey(def);

    const initialKeys: Record<string, string> = {};
    const initialModels: Record<string, string> = {};
    const initialBaseUrls: Record<string, string> = { 'openai-compatible': 'http://localhost:11434/v1' };

    Object.entries(stored).forEach(([k, v]) => {
      initialKeys[k] = v.apiKey;
      initialModels[k] = v.model;
      if (v.baseUrl) initialBaseUrls[k] = v.baseUrl;
    });

    setApiKeys((prev) => ({ ...prev, ...initialKeys }));
    setModels((prev) => ({ ...prev, ...initialModels }));
    setBaseUrls((prev) => ({ ...prev, ...initialBaseUrls }));
  }, []);

  const handleTestConnection = async (type: ProviderType) => {
    const apiKey = apiKeys[type];
    const baseUrl = baseUrls[type];
    if (!apiKey && type !== 'openai-compatible') {
      setStatusMsg({ type: 'error', text: `Please enter an API key for ${type}` });
      return;
    }

    setTesting((prev) => ({ ...prev, [type]: true }));
    setStatusMsg(null);

    try {
      const res = await fetch('/api/connection-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: type, apiKey, baseUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Connection test successful for ${type.toUpperCase()}!` });
      } else {
        throw new Error(data.error || 'Connection test failed');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || `Connection failed for ${type}` });
    } finally {
      setTesting((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleFetchModels = async (type: ProviderType) => {
    const apiKey = apiKeys[type];
    const baseUrl = baseUrls[type];
    setFetchingModels((prev) => ({ ...prev, [type]: true }));
    setStatusMsg(null);

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: type, apiKey, baseUrl }),
      });
      const data = await res.json();
      if (data.success && data.models?.length > 0) {
        setAvailableModelsMap((prev) => ({ ...prev, [type]: data.models }));
        setStatusMsg({ type: 'success', text: `Successfully retrieved models for ${type.toUpperCase()}` });
      } else {
        throw new Error(data.error || 'No models returned');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to fetch models. You can enter a model ID manually.' });
    } finally {
      setFetchingModels((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = (type: ProviderType) => {
    const apiKey = apiKeys[type];
    const model = models[type];
    const baseUrl = baseUrls[type];

    if (!apiKey && type !== 'openai-compatible') {
      setStatusMsg({ type: 'error', text: `API key is required for ${type}` });
      return;
    }

    const config: ProviderConfig = {
      provider: type,
      apiKey,
      model: model || 'default',
      baseUrl: baseUrl || undefined,
      enabled: true,
    };

    saveProviderConfig(config);
    setConfigs(getStoredProviders());
    if (!defaultKey) {
      setDefaultProviderKey(type);
      setDefaultKey(type);
    }
    setStatusMsg({ type: 'success', text: `Successfully saved configuration for ${type.toUpperCase()}` });
  };

  const handleRemove = (type: ProviderType) => {
    removeProviderConfig(type);
    setConfigs(getStoredProviders());
    setDefaultKey(getDefaultProviderKey());
    setStatusMsg({ type: 'success', text: `Removed configuration for ${type.toUpperCase()}` });
  };

  const handleSetDefault = (type: string) => {
    setDefaultProviderKey(type);
    setDefaultKey(type);
    setStatusMsg({ type: 'success', text: `Set ${type.toUpperCase()} as default provider` });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Provider Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your AI API credentials and select default models for generation.</p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 ${
            statusMsg.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{statusMsg.text}</span>
        </div>
      )}

      <div className="space-y-6">
        {PROVIDERS_META.map((meta) => {
          const isConfigured = !!configs[meta.type];
          const isDefault = defaultKey === meta.type;
          const availableModels = availableModelsMap[meta.type] || [];

          return (
            <div key={meta.type} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isConfigured ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {meta.type[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-foreground">{meta.name}</h3>
                      {isConfigured && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                          Configured
                        </span>
                      )}
                      {isDefault && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={meta.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-primary hover:underline font-medium px-3 py-1.5 rounded-lg bg-primary/5"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border">
                {meta.type === 'openai-compatible' && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Base URL</label>
                    <input
                      type="text"
                      value={baseUrls[meta.type] || ''}
                      onChange={(e) => setBaseUrls({ ...baseUrls, [meta.type]: e.target.value })}
                      placeholder="http://localhost:11434/v1"
                      className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">API Key</label>
                  <div className="relative">
                    <input
                      type={showKey[meta.type] ? 'text' : 'password'}
                      value={apiKeys[meta.type] || ''}
                      onChange={(e) => setApiKeys({ ...apiKeys, [meta.type]: e.target.value })}
                      placeholder={meta.placeholder}
                      className="w-full p-2.5 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey({ ...showKey, [meta.type]: !showKey[meta.type] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKey[meta.type] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Model</label>
                    <button
                      onClick={() => handleFetchModels(meta.type)}
                      disabled={fetchingModels[meta.type]}
                      className="text-xs text-primary hover:underline flex items-center space-x-1 font-medium"
                    >
                      {fetchingModels[meta.type] && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>Fetch Models</span>
                    </button>
                  </div>
                  {availableModels.length > 0 ? (
                    <select
                      value={models[meta.type] || ''}
                      onChange={(e) => setModels({ ...models, [meta.type]: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={models[meta.type] || ''}
                      onChange={(e) => setModels({ ...models, [meta.type]: e.target.value })}
                      placeholder="e.g. gpt-4o-mini, gemini-2.5-flash"
                      className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestConnection(meta.type)}
                    disabled={testing[meta.type]}
                    className="px-4 py-2 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {testing[meta.type] && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Test Connection</span>
                  </button>
                  {isConfigured && !isDefault && (
                    <button
                      onClick={() => handleSetDefault(meta.type)}
                      className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors text-foreground"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {isConfigured && (
                    <button
                      onClick={() => handleRemove(meta.type)}
                      className="px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 text-xs font-medium transition-colors flex items-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleSave(meta.type)}
                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
