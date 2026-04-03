import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Hash, TrendingUp, Copy, Check, Search, BarChart2, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { api } from '../../lib/api';

interface HashtagAnalyzerToolProps {
  uiConfig?: UIConfig;
}

interface HashtagData {
  tag: string;
  category: string;
  popularity: 'high' | 'medium' | 'low';
  competition: 'high' | 'medium' | 'low';
  reason?: string;
}

interface AnalysisResult {
  hashtags: HashtagData[];
  suggestions: HashtagData[];
  summary: string;
  tips: string[];
}

export const HashtagAnalyzerTool: React.FC<HashtagAnalyzerToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [inputText, setInputText] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'twitter' | 'tiktok' | 'linkedin'>('instagram');
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        setInputText(params.content);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const platformLimits: Record<string, number> = {
    instagram: 30,
    twitter: 5,
    tiktok: 5,
    linkedin: 5,
  };

  const extractedHashtags = useMemo(() => {
    const regex = /#\w+/g;
    const matches = inputText.match(regex) || [];
    return matches.map((h) => h.toLowerCase().replace('#', ''));
  }, [inputText]);

  const analyzeHashtags = async () => {
    if (!inputText.trim()) {
      setError('Please enter some content or hashtags to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `Analyze the following content/hashtags for ${platform} and provide hashtag recommendations.

Content: "${inputText}"

Provide a JSON response with this exact structure:
{
  "hashtags": [
    {"tag": "hashtag1", "category": "category", "popularity": "high|medium|low", "competition": "high|medium|low", "reason": "why this hashtag works"}
  ],
  "suggestions": [
    {"tag": "suggestedhashtag", "category": "category", "popularity": "high|medium|low", "competition": "high|medium|low", "reason": "why to use this"}
  ],
  "summary": "Brief analysis of the current hashtags",
  "tips": ["tip1", "tip2", "tip3"]
}

Rules:
- Analyze any existing hashtags in the content
- Suggest 10-15 relevant hashtags based on the content topic
- For ${platform}, the limit is ${platformLimits[platform]} hashtags
- Include a mix of high, medium, and low popularity hashtags
- Consider competition levels for better discoverability
- Provide actionable tips for this specific platform`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a social media expert specializing in hashtag strategy and optimization. Always respond with valid JSON only, no markdown or extra text.',
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Check for API error
      if (response.success === false) {
        throw new Error(response.error || 'Failed to analyze hashtags');
      }

      // Extract content from response
      let content = '';
      if (response.data?.text) {
        content = response.data.text;
      } else if (response.text) {
        content = response.text;
      } else if (response.data?.content) {
        content = response.data.content;
      } else if (response.content) {
        content = response.content;
      } else if (typeof response.data === 'string') {
        content = response.data;
      } else if (typeof response === 'string') {
        content = response;
      }

      if (!content) {
        throw new Error('No analysis content received');
      }

      // Clean and parse JSON
      let cleanedContent = content.trim();
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      cleanedContent = cleanedContent.trim();

      const result = JSON.parse(cleanedContent) as AnalysisResult;
      setAnalysisResult(result);
    } catch (err) {
      console.error('Hashtag analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze hashtags');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addHashtag = (tag: string) => {
    const limit = platformLimits[platform];
    if (extractedHashtags.length >= limit) return;
    setInputText((prev) => prev + ` #${tag}`);
  };

  const copyHashtags = () => {
    const allTags = analysisResult?.suggestions?.map(h => `#${h.tag}`).join(' ') || extractedHashtags.map((h) => `#${h}`).join(' ');
    navigator.clipboard.writeText(allTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPopularityColor = (pop: string) => {
    switch (pop) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-orange-500';
      default: return '';
    }
  };

  const getCompetitionColor = (comp: string) => {
    switch (comp) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Hash className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hashtagAnalyzer.hashtagAnalyzer', 'Hashtag Analyzer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hashtagAnalyzer.optimizeYourSocialMediaReach', 'Optimize your social media reach')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-500 font-medium">{t('tools.hashtagAnalyzer.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Platform Selection */}
        <div className="flex gap-2">
          {(['instagram', 'twitter', 'tiktok', 'linkedin'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-2 rounded-lg text-sm capitalize ${platform === p ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.hashtagAnalyzer.contentOrHashtags', 'Content or Hashtags')}
            </label>
            <span className={`text-sm ${extractedHashtags.length > platformLimits[platform] ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {extractedHashtags.length}/{platformLimits[platform]} max for {platform}
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('tools.hashtagAnalyzer.enterYourContentCaptionOr', 'Enter your content, caption, or hashtags to analyze... e.g., \'Just finished an amazing workout at the gym! #fitness\'')}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            rows={4}
          />
          {extractedHashtags.length > platformLimits[platform] && (
            <p className="text-red-500 text-sm">⚠️ You have too many hashtags for {platform}!</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={analyzeHashtags}
          disabled={isAnalyzing || !inputText.trim()}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
            isAnalyzing || !inputText.trim()
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.hashtagAnalyzer.analyzing', 'Analyzing...')}
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              {t('tools.hashtagAnalyzer.analyzeHashtags', 'Analyze Hashtags')}
            </>
          )}
        </button>

        {/* Analysis Results */}
        {analysisResult && (
          <>
            {/* Summary */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hashtagAnalyzer.analysisSummary', 'Analysis Summary')}</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{analysisResult.summary}</p>
            </div>

            {/* Current Hashtags Analysis */}
            {analysisResult.hashtags && analysisResult.hashtags.length > 0 && (
              <div className="space-y-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hashtagAnalyzer.yourHashtags', 'Your Hashtags')}</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.hashtags.map((hashtag, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                      title={hashtag.reason}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>#{hashtag.tag}</span>
                        <TrendingUp className={`w-3 h-3 ${getPopularityColor(hashtag.popularity)}`} />
                        <span className={`text-xs ${getCompetitionColor(hashtag.competition)}`}>
                          {hashtag.competition === 'low' ? '★' : hashtag.competition === 'medium' ? '★★' : '★★★'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Hashtags */}
            {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hashtagAnalyzer.aiSuggestedHashtags', 'AI-Suggested Hashtags')}</h4>
                  <button
                    onClick={copyHashtags}
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${copied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? t('tools.hashtagAnalyzer.copied', 'Copied!') : t('tools.hashtagAnalyzer.copyAll', 'Copy All')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.suggestions.map((hashtag, idx) => (
                    <button
                      key={idx}
                      onClick={() => addHashtag(hashtag.tag)}
                      disabled={extractedHashtags.length >= platformLimits[platform]}
                      className={`px-3 py-2 rounded-lg text-sm group transition-all ${
                        extractedHashtags.length >= platformLimits[platform]
                          ? 'opacity-50 cursor-not-allowed'
                          : isDark ? 'bg-gray-800 hover:bg-gray-700 hover:ring-2 hover:ring-blue-500/50' : 'bg-gray-100 hover:bg-gray-200 hover:ring-2 hover:ring-blue-500/50'
                      }`}
                      title={hashtag.reason}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>#{hashtag.tag}</span>
                        <div className="flex gap-1 opacity-60 group-hover:opacity-100">
                          <TrendingUp className={`w-3 h-3 ${getPopularityColor(hashtag.popularity)}`} />
                          <span className={`text-xs ${getCompetitionColor(hashtag.competition)}`}>
                            {hashtag.competition === 'low' ? '★' : hashtag.competition === 'medium' ? '★★' : '★★★'}
                          </span>
                        </div>
                      </div>
                      {hashtag.reason && (
                        <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {hashtag.reason}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {analysisResult.tips && analysisResult.tips.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Pro Tips for {platform}</h4>
                <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {analysisResult.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!analysisResult && !isAnalyzing && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.hashtagAnalyzer.howToUse', 'How to use:')}</strong> Enter your post content, caption, or existing hashtags above and click "Analyze Hashtags" to get AI-powered suggestions optimized for {platform}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HashtagAnalyzerTool;
