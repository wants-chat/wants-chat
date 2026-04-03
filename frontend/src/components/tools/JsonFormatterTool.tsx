import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface JsonFormatterToolProps {
  uiConfig?: UIConfig;
}

export const JsonFormatterTool: React.FC<JsonFormatterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setInput(codeContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeOperation, setActiveOperation] = useState<'format' | 'minify' | 'validate' | null>(null);

  const handleFormat = () => {
    setActiveOperation('format');
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleMinify = () => {
    setActiveOperation('minify');
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleValidate = () => {
    setActiveOperation('validate');
    try {
      JSON.parse(input);
      setError('');
      setOutput('Valid JSON!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.jsonFormatter.jsonFormatter', 'JSON Formatter')}
      </h2>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.jsonFormatter.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.jsonFormatter.inputJson', 'Input JSON')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name": "John", "age": 30}'
            className={`w-full h-48 p-3 rounded-lg font-mono text-sm border ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleFormat}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeOperation === 'format'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {t('tools.jsonFormatter.format', 'Format')}
          </button>
          <button
            onClick={handleMinify}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeOperation === 'minify'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {t('tools.jsonFormatter.minify', 'Minify')}
          </button>
          <button
            onClick={handleValidate}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeOperation === 'validate'
                ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                : theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-500 border border-gray-500'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {t('tools.jsonFormatter.validate', 'Validate')}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300 font-mono">{error}</div>
          </div>
        )}

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.jsonFormatter.output', 'Output')}
              </label>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.jsonFormatter.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.jsonFormatter.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className={`w-full h-48 p-3 rounded-lg font-mono text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              } focus:outline-none`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
