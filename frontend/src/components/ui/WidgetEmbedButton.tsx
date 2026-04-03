'use client';

import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  X,
  ExternalLink,
  Settings,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api, API_BASE_URL } from '../../lib/api';
import { cn } from '../../lib/utils';

interface WidgetEmbedButtonProps {
  toolSlug: string;
  toolName: string;
  className?: string;
}

interface WidgetConfig {
  id: string;
  embedToken: string;
  toolId: string;
  isActive: boolean;
  theme: string;
  widgetName: string;
  embedCode: {
    script: string;
    iframe: string;
  };
}

export function WidgetEmbedButton({ toolSlug, toolName, className }: WidgetEmbedButtonProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the same API_BASE_URL as the rest of the app (from .env)
  const apiBaseUrl = API_BASE_URL;

  const loadOrCreateWidget = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to get existing config
      let response = await api.get(`/widgets/${toolSlug}/config`);
      console.log('Widget GET response:', response);

      if (response.success && response.data) {
        console.log('Widget config data:', response.data);
        setWidgetConfig(response.data);
      } else {
        // Create new config
        response = await api.post(`/widgets/${toolSlug}/config`, {
          theme: 'auto',
          allowed_domains: ['*'],
          is_enabled: true,
        });
        console.log('Widget POST response:', response);

        if (response.success) {
          console.log('Widget created data:', response.data);
          setWidgetConfig(response.data);
        } else {
          throw new Error(response.error || 'Failed to create widget');
        }
      }
    } catch (err: any) {
      console.error('Widget config error:', err);
      setError(err.message || 'Failed to load widget configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    await loadOrCreateWidget();
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getScriptCode = () => {
    if (!widgetConfig) return '';
    return `<!-- Wants Widget: ${toolName} -->
<script src="${apiBaseUrl}/js/tool-widget.js"
        data-token="${widgetConfig.embedToken}"
        data-theme="auto"></script>
<div id="wants-widget"></div>`;
  };

  const getIframeCode = () => {
    if (!widgetConfig) return '';
    return `<iframe
  src="${apiBaseUrl}/api/v1/widgets/embed/${widgetConfig.embedToken}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;">
</iframe>`;
  };

  const getReactCode = () => {
    if (!widgetConfig) return '';
    return `import { useEffect } from 'react';

function WantsWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${apiBaseUrl}/js/tool-widget.js';
    script.dataset.token = '${widgetConfig.embedToken}';
    script.dataset.theme = 'auto';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="wants-widget" />;
}`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isDarkMode
            ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
            : "bg-purple-100 text-purple-700 hover:bg-purple-200",
          className
        )}
      >
        <Code className="w-4 h-4" />
        Embed Widget
      </button>
    );
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={() => setIsOpen(false)}
      >
        {/* Modal Content */}
        <div
          className={cn(
            "w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden",
            isDarkMode ? "bg-[#1a1a1a]" : "bg-white"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between px-6 py-4 border-b",
            isDarkMode ? "border-[#333]" : "border-gray-200"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isDarkMode ? "bg-purple-600/20" : "bg-purple-100"
              )}>
                <Code className={cn(
                  "w-5 h-5",
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                )} />
              </div>
              <div>
                <h2 className={cn(
                  "text-lg font-semibold",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  Embed {toolName}
                </h2>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Add this widget to your website
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode ? "hover:bg-[#333]" : "hover:bg-gray-100"
              )}
            >
              <X className={cn("w-5 h-5", isDarkMode ? "text-gray-400" : "text-gray-500")} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className={cn(
                  "w-8 h-8 animate-spin",
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                )} />
              </div>
            ) : error ? (
              <div className={cn(
                "p-4 rounded-lg text-center",
                isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
              )}>
                {error}
              </div>
            ) : widgetConfig ? (
              <div className="space-y-6">
                {/* Widget Token */}
                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Widget Token
                  </label>
                  <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg font-mono text-sm",
                    isDarkMode ? "bg-[#2a2a2a]" : "bg-gray-100"
                  )}>
                    <span className={cn(
                      "flex-1 truncate",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      {widgetConfig.embedToken}
                    </span>
                    <button
                      onClick={() => copyToClipboard(widgetConfig.embedToken, 'token')}
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        isDarkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-gray-200"
                      )}
                    >
                      {copied === 'token' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className={cn("w-4 h-4", isDarkMode ? "text-gray-400" : "text-gray-500")} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Script Tag */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      HTML Script Tag (Recommended)
                    </label>
                    <button
                      onClick={() => copyToClipboard(getScriptCode(), 'script')}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-xs",
                        isDarkMode
                          ? "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      )}
                    >
                      {copied === 'script' ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className={cn(
                    "p-4 rounded-lg text-xs overflow-x-auto",
                    isDarkMode ? "bg-[#2a2a2a] text-green-400" : "bg-gray-900 text-green-400"
                  )}>
                    {getScriptCode()}
                  </pre>
                </div>

                {/* iFrame */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      iFrame Embed
                    </label>
                    <button
                      onClick={() => copyToClipboard(getIframeCode(), 'iframe')}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-xs",
                        isDarkMode
                          ? "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      )}
                    >
                      {copied === 'iframe' ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className={cn(
                    "p-4 rounded-lg text-xs overflow-x-auto",
                    isDarkMode ? "bg-[#2a2a2a] text-blue-400" : "bg-gray-900 text-blue-400"
                  )}>
                    {getIframeCode()}
                  </pre>
                </div>

                {/* React */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      React Component
                    </label>
                    <button
                      onClick={() => copyToClipboard(getReactCode(), 'react')}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-xs",
                        isDarkMode
                          ? "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      )}
                    >
                      {copied === 'react' ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className={cn(
                    "p-4 rounded-lg text-xs overflow-x-auto",
                    isDarkMode ? "bg-[#2a2a2a] text-yellow-400" : "bg-gray-900 text-yellow-400"
                  )}>
                    {getReactCode()}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className={cn(
            "px-6 py-4 border-t flex items-center justify-between",
            isDarkMode ? "border-[#333]" : "border-gray-200"
          )}>
            <a
              href="/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1 text-sm",
                isDarkMode ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
              )}
            >
              <ExternalLink className="w-4 h-4" />
              View API Documentation
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                isDarkMode
                  ? "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              )}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WidgetEmbedButton;
