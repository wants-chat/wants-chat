'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Clock,
  AlertTriangle,
  Activity,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';

interface ApiKey {
  id: string;
  name: string;
  keyHint: string;
  scopes: string[];
  rateLimit: number;
  isActive: boolean;
  lastUsedAt: string | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

interface ApiKeyStats {
  total_requests: number;
  requests_today: number;
  avg_response_time: number;
  error_rate: number;
}

export function ApiKeysManager() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyVisible, setNewKeyVisible] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedKeyStats, setSelectedKeyStats] = useState<{ id: string; stats: ApiKeyStats } | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [scopes, setScopes] = useState<string[]>(['read', 'write']);
  const [rateLimit, setRateLimit] = useState(1000);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api-keys');
      if (response.success) {
        setApiKeys(response.data || []);
      } else {
        throw new Error(response.error || response.message || 'Failed to load API keys');
      }
    } catch (err: any) {
      console.error('Error loading API keys:', err);
      setError(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setError(t('apiKeys.enterName'));
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await api.post('/api-keys', {
        name: newKeyName.trim(),
        scopes,
        rate_limit: rateLimit,
        expires_in_days: expiresIn,
      });

      if (response.success) {
        setNewKeyVisible(response.data.key);
        setApiKeys([response.data, ...apiKeys]);
        setNewKeyName('');
        setShowCreateForm(false);
      } else {
        throw new Error(response.error || response.message || 'Failed to create API key');
      }
    } catch (err: any) {
      console.error('Error creating API key:', err);
      setError(err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm(t('apiKeys.revokeConfirm'))) {
      return;
    }

    try {
      const response = await api.delete(`/api-keys/${keyId}`);
      if (response.success) {
        setApiKeys(apiKeys.filter(k => k.id !== keyId));
      } else {
        throw new Error(response.error || response.message || 'Failed to revoke API key');
      }
    } catch (err: any) {
      console.error('Error revoking API key:', err);
      setError(err.message || 'Failed to revoke API key');
    }
  };

  const loadKeyStats = async (keyId: string) => {
    try {
      const response = await api.get(`/api-keys/${keyId}/usage`);
      if (response.success) {
        setSelectedKeyStats({ id: keyId, stats: response.data });
      }
    } catch (err: any) {
      console.error('Error loading key stats:', err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter(s => s !== scope));
    } else {
      setScopes([...scopes, scope]);
    }
  };

  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';

  return (
    <div className={`${bgColor} rounded-lg border ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Key className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textColor}`}>{t('apiKeys.cardTitle')}</h2>
              <p className={`text-sm ${mutedColor}`}>{t('apiKeys.cardSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('apiKeys.createButton')}
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-red-700 dark:text-red-400">{error}</div>
          </div>
        )}

        {/* New Key Created */}
        {newKeyVisible && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200 mb-2">
                  {t('apiKeys.createSuccess')}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  {t('apiKeys.copyWarning')}
                </p>
                <div className="flex items-center gap-2">
                  <code className={`flex-1 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} font-mono text-sm break-all`}>
                    {newKeyVisible}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newKeyVisible)}
                    className={`p-2 rounded-lg ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => setNewKeyVisible(null)}
                  className="mt-3 text-sm text-green-700 dark:text-green-300 hover:underline"
                >
                  {t('apiKeys.savedKey')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className={`mb-6 p-4 rounded-lg border ${borderColor} ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h3 className={`text-md font-medium ${textColor} mb-4`}>{t('apiKeys.createNew')}</h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-1`}>{t('apiKeys.name')}</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder={t('apiKeys.namePlaceholder')}
                  className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>{t('apiKeys.permissions')}</label>
                <div className="flex flex-wrap gap-2">
                  {['read', 'write', 'delete'].map(scope => (
                    <button
                      key={scope}
                      onClick={() => toggleScope(scope)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        scopes.includes(scope)
                          ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                          : `${borderColor} ${mutedColor}`
                      }`}
                    >
                      {scope.charAt(0).toUpperCase() + scope.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>{t('apiKeys.rateLimit')}</label>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={e => setRateLimit(parseInt(e.target.value) || 1000)}
                    min={10}
                    max={100000}
                    className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>{t('apiKeys.expiresIn')}</label>
                  <input
                    type="number"
                    value={expiresIn || ''}
                    onChange={e => setExpiresIn(e.target.value ? parseInt(e.target.value) : null)}
                    min={1}
                    placeholder={t('apiKeys.never')}
                    className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textColor}`}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`px-4 py-2 rounded-lg border ${borderColor} ${mutedColor}`}
                >
                  {t('apiKeys.cancel')}
                </button>
                <button
                  onClick={createApiKey}
                  disabled={creating || !newKeyName.trim()}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {t('apiKeys.createKey')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
            <span className={`ml-3 ${mutedColor}`}>{t('apiKeys.loading')}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && apiKeys.length === 0 && (
          <div className="text-center py-12">
            <Key className={`w-12 h-12 mx-auto mb-4 ${mutedColor} opacity-50`} />
            <p className={`${textColor} mb-2`}>{t('apiKeys.noKeys')}</p>
            <p className={`text-sm ${mutedColor}`}>{t('apiKeys.noKeysDescription')}</p>
          </div>
        )}

        {/* API Keys List */}
        {!loading && apiKeys.length > 0 && (
          <div className="space-y-3">
            {apiKeys.map(key => (
              <div
                key={key.id}
                className={`p-4 rounded-lg border ${borderColor} ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${textColor}`}>{key.name}</span>
                      {!key.isActive && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          {t('apiKeys.revoked')}
                        </span>
                      )}
                      {key.expiresAt && new Date(key.expiresAt) < new Date() && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                          {t('apiKeys.expired')}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm ${mutedColor} font-mono flex items-center gap-2`}>
                      <span>{key.keyHint}</span>
                      <button
                        onClick={() => copyToClipboard(key.keyHint)}
                        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600`}
                        title="Copy key hint"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className={`w-3.5 h-3.5 ${mutedColor}`} />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(key.scopes || []).map(scope => (
                        <span
                          key={scope}
                          className={`px-2 py-0.5 text-xs rounded-full ${inputBg} ${mutedColor}`}
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                    <div className={`flex items-center gap-4 mt-3 text-xs ${mutedColor}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('apiKeys.created')} {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      {key.lastUsedAt && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {t('apiKeys.lastUsed')} {new Date(key.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadKeyStats(key.id)}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 ${mutedColor}`}
                      title="View Stats"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                    {key.isActive && (
                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {selectedKeyStats?.id === key.id && selectedKeyStats.stats && (
                  <div className={`mt-4 pt-4 border-t ${borderColor} grid grid-cols-4 gap-4`}>
                    <div>
                      <div className={`text-xs ${mutedColor}`}>{t('apiKeys.totalRequests')}</div>
                      <div className={`text-lg font-semibold ${textColor}`}>
                        {(selectedKeyStats.stats.totalRequests ?? selectedKeyStats.stats.total_requests ?? 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs ${mutedColor}`}>{t('apiKeys.today')}</div>
                      <div className={`text-lg font-semibold ${textColor}`}>
                        {(selectedKeyStats.stats.requestsToday ?? selectedKeyStats.stats.requests_today ?? 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs ${mutedColor}`}>{t('apiKeys.avgResponse')}</div>
                      <div className={`text-lg font-semibold ${textColor}`}>
                        {(selectedKeyStats.stats.avgResponseTime ?? selectedKeyStats.stats.avg_response_time ?? 0).toFixed(0)}ms
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs ${mutedColor}`}>{t('apiKeys.errorRate')}</div>
                      <div className={`text-lg font-semibold ${
                        (selectedKeyStats.stats.errorRate ?? selectedKeyStats.stats.error_rate ?? 0) > 5 ? 'text-red-500' : textColor
                      }`}>
                        {(selectedKeyStats.stats.errorRate ?? selectedKeyStats.stats.error_rate ?? 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* API Documentation Link */}
        <div className={`mt-6 pt-6 border-t ${borderColor}`}>
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:underline`}
          >
            <ExternalLink className="w-4 h-4" />
            {t('apiKeys.viewDocs')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default ApiKeysManager;
