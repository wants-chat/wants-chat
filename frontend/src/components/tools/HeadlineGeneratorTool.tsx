import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Type, Loader2, Copy, Check, Save, TrendingUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface GeneratedHeadline {
  text: string;
  score: number;
  timestamp: Date;
}

const COLUMNS = [
  { key: 'text', label: 'Headline', type: 'text' },
  { key: 'score', label: 'Engagement Score', type: 'number' },
  { key: 'timestamp', label: 'Generated At', type: 'date' },
];

const headlineTypes = [
  { value: 'news', label: 'News Article' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'email', label: 'Email Subject' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'social', label: 'Social Media' },
  { value: 'press', label: 'Press Release' },
];

const tones = [
  { value: 'intriguing', label: 'Intriguing' },
  { value: 'informative', label: 'Informative' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'professional', label: 'Professional' },
  { value: 'provocative', label: 'Provocative' },
];

interface HeadlineGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const HeadlineGeneratorTool = ({
  uiConfig }: HeadlineGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [topic, setTopic] = useState('');
  const [headlineType, setHeadlineType] = useState(headlineTypes[0].value);
  const [tone, setTone] = useState(tones[0].value);
  const [numberOfResults, setNumberOfResults] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedHeadlines, setGeneratedHeadlines] = useState<GeneratedHeadline[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.headlineType) {
          const foundType = headlineTypes.find(t => t.value === params.headlineType);
          if (foundType) {
            setHeadlineType(foundType.value);
            hasPrefill = true;
          }
        }
        if (params.tone) {
          const foundTone = tones.find(t => t.value === params.tone);
          if (foundTone) {
            setTone(foundTone.value);
            hasPrefill = true;
          }
        }
        if (params.numberOfResults) {
          setNumberOfResults(params.numberOfResults);
          hasPrefill = true;
        }
        // Restore headlines if available
        if (params.headlines && Array.isArray(params.headlines)) {
          setGeneratedHeadlines(params.headlines.map((h: any) => ({
            text: h.text || h,
            score: h.score || 0,
            timestamp: new Date(),
          })));
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        if (params.topic) {
          setTopic(params.topic);
          hasPrefill = true;
        }
        if (params.headlineType) {
          const foundType = headlineTypes.find(t => t.value === params.headlineType);
          if (foundType) {
            setHeadlineType(foundType.value);
            hasPrefill = true;
          }
        }
        if (params.tone) {
          const foundTone = tones.find(t => t.value === params.tone);
          if (foundTone) {
            setTone(foundTone.value);
            hasPrefill = true;
          }
        }
        if (params.numberOfResults) {
          setNumberOfResults(params.numberOfResults);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const calculateEngagementScore = (headline: string): number => {
    let score = 50; // Base score

    // Length scoring (sweet spot is 60-70 characters)
    const length = headline.length;
    if (length >= 60 && length <= 70) score += 15;
    else if (length >= 50 && length <= 80) score += 10;
    else if (length < 40 || length > 100) score -= 10;

    // Power words
    const powerWords = ['secret', 'proven', 'ultimate', 'essential', 'complete', 'definitive', 'how to', 'guide', 'hack', 'trick'];
    powerWords.forEach(word => {
      if (headline.toLowerCase().includes(word)) score += 5;
    });

    // Numbers
    if (/\d+/.test(headline)) score += 10;

    // Question mark
    if (headline.includes('?')) score += 5;

    // Emotional words
    const emotionalWords = ['amazing', 'incredible', 'shocking', 'stunning', 'revolutionary', 'breakthrough'];
    emotionalWords.forEach(word => {
      if (headline.toLowerCase().includes(word)) score += 5;
    });

    // Cap at 100
    return Math.min(score, 100);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const systemMessage = `You are an expert headline copywriter specializing in ${headlineType} headlines. Create attention-grabbing, click-worthy headlines that drive engagement.`;

      const prompt = `Generate ${numberOfResults} different headline variations for the following:

Topic: ${topic}
Type: ${headlineType}
Tone: ${tone}

Requirements:
- Make each headline unique and compelling
- Use ${tone} tone
- Optimize for engagement and clicks
- Keep length appropriate for ${headlineType}
- Include power words and emotional triggers where appropriate
- Use numbers, questions, or "how to" formats when effective

Format: Return ONLY the headlines, one per line, without numbering or formatting.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage,
        temperature: 0.9,
        maxTokens: 1000,
      });

      // Extract content - API returns { success: true, data: { text: "..." } }
      const rawContent = response.data?.text || response.text || response.data?.content || response.content || '';
      const textContent = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      const headlines = textContent
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => {
          // Remove numbering if present (e.g., "1. ", "1) ", etc.)
          const cleanedLine = line.replace(/^\d+[\.\)]\s*/, '');
          return cleanedLine;
        })
        .filter((line: string) => line.length > 10); // Filter out very short lines

      if (headlines.length === 0) {
        setError('No headlines were generated. Please try again.');
        return;
      }

      const newHeadlines = headlines.map((text: string) => ({
        text,
        score: calculateEngagementScore(text),
        timestamp: new Date(),
      }));

      // Sort by score descending
      newHeadlines.sort((a, b) => b.score - a.score);

      setGeneratedHeadlines(newHeadlines);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating headlines');
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

  const handleSave = async (text: string, score: number) => {
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Headline: ${topic}`,
        prompt: `Headline for ${topic}`,
        metadata: {
          toolId: 'headline-generator',
          text,
          topic,
          headlineType,
          tone,
          numberOfResults,
          engagementScore: score,
          headlines: generatedHeadlines.map(h => ({ text: h.text, score: h.score })),
        },
      });
      setValidationMessage('Headline saved successfully!');
      setTimeout(() => setValidationMessage(null), 3000);

      // Call onSaveCallback if provided (for gallery refresh)
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setValidationMessage('Failed to save headline');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme === 'dark' ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return theme === 'dark' ? 'text-teal-400' : 'text-teal-600';
    if (score >= 40) return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    return theme === 'dark' ? 'text-orange-400' : 'text-orange-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50';
    if (score >= 60) return theme === 'dark' ? 'bg-teal-900/20' : 'bg-teal-50';
    if (score >= 40) return theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50';
    return theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50';
  };

  const handleExportCSV = () => {
    if (generatedHeadlines.length === 0) return;

    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = generatedHeadlines.map(headline =>
      COLUMNS.map(col => {
        if (col.key === 'timestamp') {
          return `"${new Date(headline.timestamp).toISOString()}"`;
        }
        const value = headline[col.key as keyof GeneratedHeadline];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `headlines-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (generatedHeadlines.length === 0) return;

    const data = {
      exportDate: new Date().toISOString(),
      parameters: {
        topic,
        headlineType,
        tone,
        numberOfResults,
      },
      headlines: generatedHeadlines.map(headline => ({
        text: headline.text,
        score: headline.score,
        timestamp: headline.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `headlines-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    if (generatedHeadlines.length === 0) return false;

    const text = generatedHeadlines
      .map((headline, index) => `${index + 1}. ${headline.text} (Score: ${headline.score})`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-teal-900/20' : t('tools.headlineGenerator.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Type className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.headlineGenerator.aiHeadlineGenerator', 'AI Headline Generator')}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.headlineGenerator.createEngagingHeadlinesWithEngagement', 'Create engaging headlines with engagement scores')}</p>
              {isPrefilled && (
                <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 dark:text-teal-400">
                  <Sparkles className="w-3 h-3" />
                  <span>{isEditFromGallery ? t('tools.headlineGenerator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.headlineGenerator.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
                </div>
              )}
            </div>
          </div>
          {generatedHeadlines.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={generatedHeadlines.length === 0}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.headlineGenerator.topicSubject', 'Topic/Subject *')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.headlineGenerator.enterYourTopicMainIdea', 'Enter your topic, main idea, or key message...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Type and Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.headlineGenerator.headlineType', 'Headline Type')}</label>
            <select
              value={headlineType}
              onChange={(e) => setHeadlineType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {headlineTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.headlineGenerator.tone', 'Tone')}</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Number of Headlines */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Number of Headlines: {numberOfResults}
          </label>
          <div className="flex gap-2">
            {[5, 10, 15].map((num) => (
              <button
                key={num}
                onClick={() => setNumberOfResults(num)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  numberOfResults === num
                    ? 'bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-xl ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} text-sm`}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.headlineGenerator.generatingHeadlines', 'Generating Headlines...')}
            </>
          ) : (
            <>
              <Type className="w-5 h-5" />
              {t('tools.headlineGenerator.generateHeadlines', 'Generate Headlines')}
            </>
          )}
        </button>

        {/* Generated Headlines */}
        {generatedHeadlines.length > 0 && (
          <div className="space-y-4">
            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Type className="w-4 h-4" />
              {t('tools.headlineGenerator.generatedHeadlinesSortedByScore', 'Generated Headlines (sorted by score)')}
            </h4>
            <div className="space-y-2">
              {generatedHeadlines.map((headline, index) => (
                <div
                  key={`${headline.timestamp.getTime()}-${index}`}
                  className={`p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg ${getScoreBgColor(headline.score)}`}>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`w-4 h-4 ${getScoreColor(headline.score)}`} />
                        <span className={`text-sm font-semibold ${getScoreColor(headline.score)}`}>
                          {headline.score}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-2`}>{headline.text}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(headline.text, index)}
                          className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'} rounded-lg transition-colors text-sm`}
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              {t('tools.headlineGenerator.copied', 'Copied!')}
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              {t('tools.headlineGenerator.copy', 'Copy')}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleSave(headline.text, headline.score)}
                          className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-teal-900/30 hover:bg-teal-900/50 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'} border ${theme === 'dark' ? 'border-teal-800' : 'border-teal-200'} rounded-lg transition-colors text-sm`}
                        >
                          <Save className="w-4 h-4" />
                          {t('tools.headlineGenerator.save', 'Save')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedHeadlines.length === 0 && !isGenerating && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <Type className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.headlineGenerator.yourGeneratedHeadlinesWillAppear', 'Your generated headlines will appear here with engagement scores')}</p>
          </div>
        )}

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-sm font-medium shadow-lg ${
            validationMessage.includes('success') || validationMessage.includes('successfully')
              ? theme === 'dark' ? 'bg-green-900/80 border border-green-800 text-green-200' : 'bg-green-100 border border-green-300 text-green-800'
              : theme === 'dark' ? 'bg-red-900/80 border border-red-800 text-red-200' : 'bg-red-100 border border-red-300 text-red-800'
          }`}>
            {validationMessage}
          </div>
        )}

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default HeadlineGeneratorTool;
