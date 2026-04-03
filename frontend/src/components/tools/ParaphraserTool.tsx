import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Loader2, Copy, CheckCircle, Save, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ParaphraseResult {
  original: string;
  paraphrased: string[];
  mode: string;
  timestamp: Date;
}

const paraphraseModes = [
  { label: 'Standard', value: 'standard', description: 'Balanced rewriting' },
  { label: 'Formal', value: 'formal', description: 'Professional tone' },
  { label: 'Casual', value: 'casual', description: 'Conversational style' },
  { label: 'Creative', value: 'creative', description: 'Expressive rewording' },
  { label: 'Academic', value: 'academic', description: 'Scholarly language' },
];

interface ParaphraserToolProps {
  uiConfig?: UIConfig;
}

const ParaphraserTool: React.FC<ParaphraserToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setInputText(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const [mode, setMode] = useState(paraphraseModes[0].value);
  const [preserveMeaning, setPreserveMeaning] = useState(true);
  const [variationCount, setVariationCount] = useState(3);
  const [result, setResult] = useState<ParaphraseResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(0);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to paraphrase');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const modeLabel = paraphraseModes.find(m => m.value === mode)?.label || 'Standard';

      const prompt = `Paraphrase the following text in a ${modeLabel.toLowerCase()} style.
${preserveMeaning ? 'Preserve the original meaning and intent.' : 'Feel free to reinterpret the meaning.'}
Generate ${variationCount} different variations.

Text to paraphrase:
${inputText}

Provide ${variationCount} distinct paraphrased versions, each on a new line starting with a number (1., 2., 3., etc.).`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        context: 'paraphraser',
        options: {
          mode,
          preserveMeaning,
          variationCount,
        },
      });

      const generatedText = response.data?.text || response.data?.content || response.text || '';

      if (!generatedText) {
        throw new Error('No paraphrase generated');
      }

      // Parse variations from the response
      const variations = generatedText
        .split(/\n+/)
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .filter((line: string) => line.length > 0)
        .slice(0, variationCount);

      if (variations.length === 0) {
        variations.push(generatedText.trim());
      }

      setResult({
        original: inputText,
        paraphrased: variations,
        mode,
        timestamp: new Date(),
      });
      setSelectedVariation(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate paraphrase');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (!result || result.paraphrased.length === 0) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: 'Paraphrased Text',
        prompt: 'Paraphrased text',
        metadata: {
          text: result.paraphrased[selectedVariation],
          toolId: 'paraphraser',
          mode,
          variationCount: result.paraphrased.length,
          originalText: result.original,
        },
      });
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetTool = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setCopiedIndex(null);
    setSelectedVariation(0);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{t('tools.paraphraser.aiParaphraser', 'AI Paraphraser')}</h2>
            <p className="text-teal-50 text-sm mt-1">{t('tools.paraphraser.rewriteTextInDifferentStyles', 'Rewrite text in different styles with multiple variations')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-white/80">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.paraphraser.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.paraphraser.textToParaphrase', 'Text to Paraphrase')}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('tools.paraphraser.enterTheTextYouWant', 'Enter the text you want to paraphrase...')}
              rows={6}
              className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.paraphraser.paraphraseMode', 'Paraphrase Mode')}
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {paraphraseModes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} - {m.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.paraphraser.numberOfVariations', 'Number of Variations')}
              </label>
              <select
                value={variationCount}
                onChange={(e) => setVariationCount(Number(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? t('tools.paraphraser.variation', 'Variation') : t('tools.paraphraser.variations', 'Variations')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preserve Meaning Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="preserve-meaning"
              checked={preserveMeaning}
              onChange={(e) => setPreserveMeaning(e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="preserve-meaning" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.paraphraser.preserveOriginalMeaningAndIntent', 'Preserve original meaning and intent')}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('tools.paraphraser.paraphrasing', 'Paraphrasing...')}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>{t('tools.paraphraser.generateParaphrases', 'Generate Paraphrases')}</span>
                </>
              )}
            </button>

            {result && (
              <button
                onClick={resetTool}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {t('tools.paraphraser.newText', 'New Text')}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Result Section - Side by Side Comparison */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {t('tools.paraphraser.comparisonView', 'Comparison View')}
              </h3>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('tools.paraphraser.saving', 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t('tools.paraphraser.saveSelected', 'Save Selected')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Side by Side View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Original */}
              <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.paraphraser.original', 'Original')}</h4>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {result.original}
                </p>
              </div>

              {/* Arrow (desktop only) */}
              <div className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-teal-600 rounded-full p-2">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Paraphrased */}
              <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Paraphrased ({paraphraseModes.find(m => m.value === mode)?.label})
                  </h4>
                  <button
                    onClick={() => handleCopy(result.paraphrased[selectedVariation], selectedVariation)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      copiedIndex === selectedVariation
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : isDark
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-100'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {copiedIndex === selectedVariation ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{t('tools.paraphraser.copied', 'Copied!')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('tools.paraphraser.copy', 'Copy')}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {result.paraphrased[selectedVariation]}
                </p>
              </div>
            </div>

            {/* Variations List */}
            {result.paraphrased.length > 1 && (
              <div className={`border rounded-lg p-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  All Variations ({result.paraphrased.length})
                </h4>
                <div className="space-y-3">
                  {result.paraphrased.map((variation, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedVariation(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedVariation === index
                          ? 'bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-500'
                          : isDark
                          ? 'bg-gray-800 hover:bg-gray-750 border border-gray-600'
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Variation {index + 1}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {variation}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(variation, index);
                          }}
                          className="ml-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParaphraserTool;
