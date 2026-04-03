import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, ArrowRight, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface UrlEncoderToolProps {
  uiConfig?: UIConfig;
}

export const UrlEncoderTool = ({ uiConfig }: UrlEncoderToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
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

  const handleEncode = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text to encode');
      return;
    }
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
    } catch (err) {
      setError('Failed to encode URL');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter URL to decode');
      return;
    }
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (err) {
      setError('Invalid URL encoding. Please check your input.');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.urlEncoder.title')}
      </h2>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.urlEncoder.codeLoaded')}</span>
          </div>
        )}

        {/* Input Section */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.urlEncoder.input')}
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder={t('tools.urlEncoder.inputPlaceholder')}
            className={`w-full h-32 px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEncode}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            {t('tools.urlEncoder.encode')}
          </button>
          <button
            onClick={handleDecode}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('tools.urlEncoder.decode')}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.urlEncoder.clear')}
          </button>
        </div>

        {/* Output Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.urlEncoder.output')}
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  copied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? t('tools.urlEncoder.copied') : t('tools.urlEncoder.copy')}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('tools.urlEncoder.outputPlaceholder')}
            className={`w-full h-32 px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none`}
          />
        </div>

        {/* Examples Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.urlEncoder.about')}
          </h3>
          <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.urlEncoder.aboutText')}
          </p>
          <div className={`space-y-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex gap-2">
              <span className="font-mono">Space</span>
              <span>→</span>
              <span className="font-mono">%20</span>
            </div>
            <div className="flex gap-2">
              <span className="font-mono">!</span>
              <span>→</span>
              <span className="font-mono">%21</span>
            </div>
            <div className="flex gap-2">
              <span className="font-mono">&</span>
              <span>→</span>
              <span className="font-mono">%26</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
