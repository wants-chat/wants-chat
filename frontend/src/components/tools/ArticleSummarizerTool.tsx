import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2, Copy, CheckCircle, Save, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SummaryResult {
  original: string;
  summary: string;
  originalWordCount: number;
  summaryWordCount: number;
  timestamp: Date;
}

const summaryLengthOptions = [
  { label: '1 Paragraph', value: 'one_paragraph' },
  { label: '3 Bullet Points', value: 'three_bullets' },
  { label: '5 Bullet Points', value: 'five_bullets' },
  { label: 'Detailed Summary', value: 'detailed' },
];

const focusAreaOptions = [
  { label: 'Key Points', value: 'key_points' },
  { label: 'Conclusions', value: 'conclusions' },
  { label: 'Action Items', value: 'action_items' },
  { label: 'Overview', value: 'overview' },
];

interface ArticleSummarizerToolProps {
  uiConfig?: UIConfig;
}

const ArticleSummarizerTool = ({ uiConfig }: ArticleSummarizerToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [summaryLength, setSummaryLength] = useState(summaryLengthOptions[0].value);
  const [focusArea, setFocusArea] = useState(focusAreaOptions[0].value);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      let hasPrefill = false;

      if (params.text || params.inputText) {
        setInputText(params.text || params.inputText);
        hasPrefill = true;
      }
      if (params.summaryLength) {
        const foundLength = summaryLengthOptions.find(l => l.value === params.summaryLength);
        if (foundLength) {
          setSummaryLength(foundLength.value);
          hasPrefill = true;
        }
      }
      if (params.focusArea) {
        const foundFocus = focusAreaOptions.find(f => f.value === params.focusArea);
        if (foundFocus) {
          setFocusArea(foundFocus.value);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to summarize');
      return;
    }

    if (countWords(inputText) < 50) {
      setError('Please enter at least 50 words for a meaningful summary');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const lengthLabel = summaryLengthOptions.find(opt => opt.value === summaryLength)?.label || '1 Paragraph';
      const focusLabel = focusAreaOptions.find(opt => opt.value === focusArea)?.label || 'Key Points';

      const prompt = `Summarize the following text with a focus on ${focusLabel}.
Format: ${lengthLabel}.

Text to summarize:
${inputText}

Please provide a clear, concise summary that captures the essence of the content.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        context: 'article_summarizer',
        options: {
          summaryLength,
          focusArea,
        },
      });

      const summary = response.data?.text || response.data?.content || response.text || '';

      if (!summary) {
        throw new Error('No summary generated');
      }

      setResult({
        original: inputText,
        summary: summary.trim(),
        originalWordCount: countWords(inputText),
        summaryWordCount: countWords(summary),
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySummary = async () => {
    if (result?.summary) {
      try {
        await navigator.clipboard.writeText(result.summary);
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!result?.summary) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: 'Article Summary',
        prompt: 'Summarized article',
        metadata: {
          text: result.summary,
          toolId: 'article-summarizer',
          originalWordCount: result.originalWordCount,
          summaryWordCount: result.summaryWordCount,
          summaryLength,
          focusArea,
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
    setCopiedSummary(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{t('tools.articleSummarizer.articleSummarizer', 'Article Summarizer')}</h2>
            <p className="text-teal-50 text-sm mt-1">{t('tools.articleSummarizer.aiPoweredTextSummarizationWith', 'AI-powered text summarization with custom focus areas')}</p>
            {isPrefilled && (
              <div className="flex items-center gap-1 mt-1 text-xs text-white/80">
                <Sparkles className="w-3 h-3" />
                <span>{t('tools.articleSummarizer.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
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
              {t('tools.articleSummarizer.textToSummarize', 'Text to Summarize')}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('tools.articleSummarizer.pasteYourArticleDocumentOr', 'Paste your article, document, or any long text here...')}
              rows={10}
              className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Word count: {countWords(inputText)}
            </div>
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.articleSummarizer.summaryLength', 'Summary Length')}
              </label>
              <select
                value={summaryLength}
                onChange={(e) => setSummaryLength(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {summaryLengthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.articleSummarizer.focusArea', 'Focus Area')}
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {focusAreaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
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
                  <span>{t('tools.articleSummarizer.summarizing', 'Summarizing...')}</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>{t('tools.articleSummarizer.generateSummary', 'Generate Summary')}</span>
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
                {t('tools.articleSummarizer.newSummary', 'New Summary')}
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

        {/* Result Section */}
        {result && (
          <div className={`border rounded-lg p-6 space-y-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {t('tools.articleSummarizer.summary', 'Summary')}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopySummary}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    copiedSummary
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : isDark
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-100'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  {copiedSummary ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('tools.articleSummarizer.copied', 'Copied!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('tools.articleSummarizer.copy', 'Copy')}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('tools.articleSummarizer.saving', 'Saving...')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t('tools.articleSummarizer.save', 'Save')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={`whitespace-pre-wrap leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {result.summary}
              </p>
            </div>

            {/* Statistics */}
            <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {result.originalWordCount}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.articleSummarizer.originalWords', 'Original Words')}</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {result.summaryWordCount}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.articleSummarizer.summaryWords', 'Summary Words')}</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {Math.round((result.summaryWordCount / result.originalWordCount) * 100)}%
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.articleSummarizer.compression', 'Compression')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleSummarizerTool;
