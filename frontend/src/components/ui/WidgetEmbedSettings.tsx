'use client';

import React, { useState, useEffect } from 'react';
import {
  Code,
  Copy,
  Check,
  ExternalLink,
  Settings2,
  Palette,
  Globe,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  Monitor,
  Moon,
  Sun,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface WidgetConfig {
  id: string;
  widget_name: string;
  theme: 'light' | 'dark' | 'auto';
  primary_color: string;
  border_radius: number;
  show_header: boolean;
  show_footer: boolean;
  allowed_domains: string[];
  custom_css: string | null;
  embed_token: string;
  is_active: boolean;
  embedCode?: {
    script: string;
    iframe: string;
  };
}

interface WidgetEmbedSettingsProps {
  toolId: string;
  toolName?: string;
  onClose?: () => void;
}

export function WidgetEmbedSettings({ toolId, toolName, onClose }: WidgetEmbedSettingsProps) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'script' | 'iframe' | null>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  // Editable fields
  const [widgetName, setWidgetName] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [primaryColor, setPrimaryColor] = useState('#0D9488');
  const [borderRadius, setBorderRadius] = useState(8);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [customCss, setCustomCss] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadConfig();
  }, [toolId]);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/widgets/${toolId}/config`);
      if (response.data.success && response.data.data) {
        const cfg = response.data.data;
        setConfig(cfg);
        setWidgetName(cfg.widget_name || `${toolName || toolId} Widget`);
        setTheme(cfg.theme || 'auto');
        setPrimaryColor(cfg.primary_color || '#0D9488');
        setBorderRadius(cfg.border_radius ?? 8);
        setShowHeader(cfg.show_header ?? true);
        setShowFooter(cfg.show_footer ?? true);
        setAllowedDomains(cfg.allowed_domains || []);
        setCustomCss(cfg.custom_css || '');
        setIsActive(cfg.is_active ?? true);
      }
    } catch (err: any) {
      console.error('Error loading widget config:', err);
      setError(err.message || 'Failed to load widget configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setError(null);

    try {
      const data = {
        widget_name: widgetName,
        theme,
        primary_color: primaryColor,
        border_radius: borderRadius,
        show_header: showHeader,
        show_footer: showFooter,
        allowed_domains: allowedDomains,
        custom_css: customCss || null,
        is_active: isActive,
      };

      let response;
      if (config) {
        response = await api.put(`/widgets/${toolId}/config`, data);
      } else {
        response = await api.post(`/widgets/${toolId}/config`, data);
      }

      if (response.data.success) {
        setConfig(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to save');
      }
    } catch (err: any) {
      console.error('Error saving widget config:', err);
      setError(err.message || 'Failed to save widget configuration');
    } finally {
      setSaving(false);
    }
  };

  const regenerateToken = async () => {
    if (!confirm('Are you sure? This will invalidate all existing embed codes.')) {
      return;
    }

    try {
      const response = await api.post(`/widgets/${toolId}/regenerate-token`);
      if (response.data.success) {
        loadConfig();
      }
    } catch (err: any) {
      console.error('Error regenerating token:', err);
      setError(err.message || 'Failed to regenerate token');
    }
  };

  const copyToClipboard = async (text: string, type: 'script' | 'iframe') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const addDomain = () => {
    if (newDomain && !allowedDomains.includes(newDomain)) {
      setAllowedDomains([...allowedDomains, newDomain]);
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter(d => d !== domain));
  };

  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const codeBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';

  if (loading) {
    return (
      <div className={`p-6 ${bgColor} rounded-lg`}>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
          <span className={`ml-3 ${mutedColor}`}>Loading widget settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} rounded-lg border ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Code className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textColor}`}>Widget Embed Settings</h2>
              <p className={`text-sm ${mutedColor}`}>Embed this tool on your website</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${mutedColor}`}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-red-700 dark:text-red-400">{error}</div>
          </div>
        )}

        {/* Widget Name */}
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>Widget Name</label>
          <input
            type="text"
            value={widgetName}
            onChange={e => setWidgetName(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
            placeholder="My Widget"
          />
        </div>

        {/* Appearance Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theme */}
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>Theme</label>
            <div className="flex gap-2">
              {[
                { value: 'auto', icon: Monitor, label: 'Auto' },
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                    theme === opt.value
                      ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      : `${borderColor} ${mutedColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono text-sm`}
              />
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Border Radius: {borderRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={borderRadius}
            onChange={e => setBorderRadius(parseInt(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>

        {/* Display Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHeader}
              onChange={e => setShowHeader(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <span className={`text-sm ${textColor}`}>Show Header</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFooter}
              onChange={e => setShowFooter(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <span className={`text-sm ${textColor}`}>Show Footer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <span className={`text-sm ${textColor}`}>Widget Active</span>
          </label>
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 text-sm ${mutedColor} hover:${textColor}`}
          >
            <Settings2 className="w-4 h-4" />
            Advanced Settings
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              {/* Allowed Domains */}
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  <Globe className="w-4 h-4 inline mr-1" />
                  Allowed Domains
                </label>
                <p className={`text-xs ${mutedColor} mb-2`}>
                  Leave empty to allow all domains. Use *.example.com for wildcards.
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={e => setNewDomain(e.target.value)}
                    placeholder="example.com"
                    className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} text-sm`}
                    onKeyDown={e => e.key === 'Enter' && addDomain()}
                  />
                  <button
                    onClick={addDomain}
                    className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allowedDomains.map(domain => (
                    <span
                      key={domain}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${inputBg} ${textColor} border ${borderColor}`}
                    >
                      {domain}
                      <button
                        onClick={() => removeDomain(domain)}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {allowedDomains.length === 0 && (
                    <span className={`text-xs ${mutedColor}`}>All domains allowed</span>
                  )}
                </div>
              </div>

              {/* Custom CSS */}
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  <Palette className="w-4 h-4 inline mr-1" />
                  Custom CSS
                </label>
                <textarea
                  value={customCss}
                  onChange={e => setCustomCss(e.target.value)}
                  placeholder=".wants-widget { /* custom styles */ }"
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor} font-mono text-sm`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {config ? 'Save Changes' : 'Enable Widget'}
          </button>
        </div>

        {/* Embed Codes */}
        {config?.embedCode && (
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-medium ${textColor} flex items-center gap-2`}>
              <Code className="w-5 h-5" />
              Embed Codes
            </h3>

            {/* Script Tag */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-medium ${textColor}`}>
                  Script Tag (Recommended)
                </label>
                <button
                  onClick={() => copyToClipboard(config.embedCode!.script, 'script')}
                  className={`text-sm flex items-center gap-1 ${
                    copied === 'script' ? 'text-green-500' : 'text-teal-500 hover:text-teal-600'
                  }`}
                >
                  {copied === 'script' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className={`${codeBg} p-4 rounded-lg overflow-x-auto text-sm font-mono ${textColor}`}>
                {config.embedCode.script}
              </pre>
            </div>

            {/* Iframe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-medium ${textColor}`}>
                  Iframe (Alternative)
                </label>
                <button
                  onClick={() => copyToClipboard(config.embedCode!.iframe, 'iframe')}
                  className={`text-sm flex items-center gap-1 ${
                    copied === 'iframe' ? 'text-green-500' : 'text-teal-500 hover:text-teal-600'
                  }`}
                >
                  {copied === 'iframe' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className={`${codeBg} p-4 rounded-lg overflow-x-auto text-sm font-mono ${textColor} whitespace-pre-wrap`}>
                {config.embedCode.iframe}
              </pre>
            </div>

            {/* Security Note */}
            <div className={`flex items-start gap-3 p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
              <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                <strong>Security Note:</strong> Keep your embed token private. If compromised, regenerate it below.
              </div>
            </div>

            {/* Regenerate Token */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className={`text-sm font-medium ${textColor}`}>Embed Token</p>
                <p className={`text-xs ${mutedColor} font-mono`}>{config.embed_token}</p>
              </div>
              <button
                onClick={regenerateToken}
                className="px-4 py-2 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate Token
              </button>
            </div>
          </div>
        )}

        {/* No Config Yet */}
        {!config && !loading && (
          <div className={`text-center py-8 ${mutedColor}`}>
            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">Widget embedding is not yet enabled for this tool.</p>
            <p className="text-sm">Configure settings above and click "Enable Widget" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WidgetEmbedSettings;
