import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Twitter, Loader2, Copy, Check, Save, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'inspiring', label: 'Inspiring' },
  { value: 'informative', label: 'Informative' },
  { value: 'controversial', label: 'Thought-Provoking' },
];

const formats = [
  { value: 'single', label: 'Single Tweet' },
  { value: 'thread', label: 'Thread (3-5 tweets)' },
  { value: 'hook', label: 'Hook + Value' },
];

const COLUMNS: ColumnConfig[] = [
  {
    key: 'text',
    header: 'Tweet',
    type: 'string',
  },
  {
    key: 'timestamp',
    header: 'Generated At',
    type: 'date',
  },
];

interface TweetToolProps {
  uiConfig?: UIConfig;
}

export const TweetTool = ({ uiConfig }: TweetToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [format, setFormat] = useState('single');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTweets, setGeneratedTweets] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params;
      let hasPrefill = false;

      if (params.topic) {
        setTopic(params.topic);
        hasPrefill = true;
      }
      if (params.tone) {
        const foundTone = tones.find(t => t.value === params.tone);
        if (foundTone) {
          setTone(foundTone.value);
          hasPrefill = true;
        }
      }
      if (params.format) {
        const foundFormat = formats.find(f => f.value === params.format);
        if (foundFormat) {
          setFormat(foundFormat.value);
          hasPrefill = true;
        }
      }
      if (params.includeHashtags !== undefined) {
        setIncludeHashtags(params.includeHashtags);
        hasPrefill = true;
      }
      if (params.includeEmoji !== undefined) {
        setIncludeEmoji(params.includeEmoji);
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or idea');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Create ${format === 'thread' ? 'a Twitter thread of 3-5 tweets' : format === 'hook' ? 'a hook tweet followed by a value tweet' : '3 tweet variations'} about:

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include 1-3 relevant hashtags' : 'No hashtags'}
${includeEmoji ? 'Include relevant emojis' : 'No emojis'}

Requirements:
- Keep each tweet under 280 characters
- Make it engaging and shareable
- Use the ${tone} tone effectively
- Create content that encourages engagement
${format === 'thread' ? '- Number each tweet (1/, 2/, etc.)' : ''}
${format === 'hook' ? '- First tweet should be an attention-grabbing hook' : ''}

Return each tweet on a new line.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a viral social media expert specializing in Twitter/X content that drives engagement.',
        temperature: 0.9,
        maxTokens: 1000,
      });

      if (response.success && response.data?.text) {
        const tweets = response.data.text
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && line.length <= 300);
        setGeneratedTweets(tweets);
      } else {
        setError(response.error || 'Failed to generate tweets');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const charCount = (text: string) => text.length;

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = generatedTweets.map((tweet, index) => ({
      text: tweet,
      timestamp: new Date(),
    }));
    exportToCSV(dataToExport, COLUMNS, { filename: 'tweets' });
  };

  const handleExportExcel = () => {
    const dataToExport = generatedTweets.map((tweet, index) => ({
      text: tweet,
      timestamp: new Date(),
    }));
    exportToExcel(dataToExport, COLUMNS, { filename: 'tweets' });
  };

  const handleExportJSON = () => {
    const dataToExport = generatedTweets.map((tweet, index) => ({
      text: tweet,
      timestamp: new Date(),
    }));
    exportToJSON(dataToExport, { filename: 'tweets' });
  };

  const handleExportPDF = async () => {
    const dataToExport = generatedTweets.map((tweet, index) => ({
      text: tweet,
      timestamp: new Date(),
    }));
    await exportToPDF(dataToExport, COLUMNS, {
      filename: 'tweets',
      title: 'Generated Tweets',
      orientation: 'portrait',
    });
  };

  const handlePrint = () => {
    const dataToExport = generatedTweets.map((tweet, index) => ({
      text: tweet,
      timestamp: new Date(),
    }));
    printData(dataToExport, COLUMNS, {
      title: 'Generated Tweets',
    });
  };

  const handleCopyToClipboard = async () => {
    const dataToExport = generatedTweets.map((tweet, index) => ({
      text: tweet,
      timestamp: new Date(),
    }));
    return await copyUtil(dataToExport, COLUMNS, 'tab');
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-blue-900/20' : 'from-white to-blue-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Twitter className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.tweet.tweetGenerator', 'Tweet Generator')}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tweet.createViralTweetsAndThreads', 'Create viral tweets and threads for X/Twitter')}</p>
              {isPrefilled && (
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('tools.tweet.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
                </div>
              )}
            </div>
          </div>
          {generatedTweets.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={generatedTweets.length === 0}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.tweet.topicOrIdea', 'Topic or Idea *')}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.tweet.whatDoYouWantTo', 'What do you want to tweet about? Share your idea, announcement, or topic...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tweet.tone', 'Tone')}</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tweet.format', 'Format')}</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeHashtags}
              onChange={(e) => setIncludeHashtags(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tweet.includeHashtags', 'Include hashtags')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeEmoji}
              onChange={(e) => setIncludeEmoji(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tweet.includeEmojis', 'Include emojis')}</span>
          </label>
        </div>

        {error && (
          <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-100 text-red-600'} border rounded-xl text-sm`}>
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Twitter className="w-5 h-5" />}
          {isGenerating ? t('tools.tweet.generating', 'Generating...') : t('tools.tweet.generateTweets', 'Generate Tweets')}
        </button>

        {generatedTweets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.tweet.generatedTweets', 'Generated Tweets')}</h4>
              <button onClick={handleGenerate} className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1">
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
            </div>
            <div className="space-y-3">
              {generatedTweets.map((tweet, index) => (
                <div key={index} className={`p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-3`}>{tweet}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${charCount(tweet) > 280 ? 'text-red-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {charCount(tweet)}/280
                    </span>
                    <button
                      onClick={() => handleCopy(tweet, index)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'} rounded-lg`}
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copiedIndex === index ? t('tools.tweet.copied', 'Copied!') : t('tools.tweet.copy', 'Copy')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TweetTool;
