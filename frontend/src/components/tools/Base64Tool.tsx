import { useState, useEffect } from 'react';
import { Copy, ArrowRight, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Base64ToolProps {
  uiConfig?: UIConfig;
}

export const Base64Tool = ({ uiConfig }: Base64ToolProps) => {
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
      const encoded = btoa(input);
      setOutput(encoded);
    } catch (err) {
      setError('Failed to encode. Text may contain characters outside Latin1 range.');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter base64 to decode');
      return;
    }
    try {
      const decoded = atob(input);
      setOutput(decoded);
    } catch (err) {
      setError('Invalid base64 string. Please check your input.');
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
        {t('tools.base64.base64EncoderDecoder', 'Base64 Encoder/Decoder')}
      </h2>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.base64.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Input Section */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder={t('tools.base64.enterTextOrBase64String', 'Enter text or base64 string...')}
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
            {t('tools.base64.encodeToBase64', 'Encode to Base64')}
          </button>
          <button
            onClick={handleDecode}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('tools.base64.decodeFromBase64', 'Decode from Base64')}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.base64.clear', 'Clear')}
          </button>
        </div>

        {/* Output Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.base64.output', 'Output')}
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
                {copied ? t('tools.base64.copied', 'Copied!') : t('tools.base64.copy', 'Copy')}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('tools.base64.resultWillAppearHere', 'Result will appear here...')}
            className={`w-full h-32 px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none`}
          />
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.base64.aboutBase64', 'About Base64')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Base64 encoding converts binary data into ASCII text format. It's commonly used for encoding data in emails,
            URLs, and data URIs for images.
          </p>
        </div>
      </div>
    </div>
  );
};
