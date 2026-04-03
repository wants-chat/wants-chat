import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Youtube, Loader2, Copy, Check, Hash, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const videoTypes = [
  'Tutorial/How-to',
  'Vlog',
  'Review',
  'Gaming',
  'Music',
  'Entertainment',
  'Educational',
  'Podcast',
  'Shorts',
  'Live Stream',
];

interface YoutubeDescriptionToolProps {
  uiConfig?: UIConfig;
}

export const YoutubeDescriptionTool: React.FC<YoutubeDescriptionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSummary, setVideoSummary] = useState('');
  const [videoType, setVideoType] = useState(videoTypes[0]);
  const [keywords, setKeywords] = useState('');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ description: string; tags: string[] } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setVideoTitle(params.text || params.content || '');
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.videoTitle) setVideoTitle(params.formData.videoTitle);
        if (params.formData.title) setVideoTitle(params.formData.title);
        if (params.formData.videoSummary) setVideoSummary(params.formData.videoSummary);
        if (params.formData.summary) setVideoSummary(params.formData.summary);
        if (params.formData.videoType) setVideoType(params.formData.videoType);
        if (params.formData.type) setVideoType(params.formData.type);
        if (params.formData.keywords) setKeywords(params.formData.keywords);
        if (params.formData.includeTimestamps !== undefined) setIncludeTimestamps(params.formData.includeTimestamps);
        if (params.formData.includeCTA !== undefined) setIncludeCTA(params.formData.includeCTA);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!videoTitle.trim()) {
      setError('Please enter a video title');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Create an SEO-optimized YouTube video description for:

Video Title: ${videoTitle}
Video Type: ${videoType}
Summary: ${videoSummary || 'Not provided'}
Keywords: ${keywords || 'Not provided'}

Requirements:
1. Write an engaging, SEO-friendly description (150-300 words)
2. Include the main keyword in the first 2 sentences
3. ${includeTimestamps ? 'Include placeholder timestamps (00:00 - Introduction, etc.)' : 'No timestamps needed'}
4. ${includeCTA ? 'Include call-to-action (subscribe, like, comment)' : 'No CTA needed'}
5. Add relevant links section placeholder
6. Make it scannable with line breaks

Also generate 15-20 relevant YouTube tags (comma-separated).

Format your response as:
DESCRIPTION:
[the description]

TAGS:
[comma-separated tags]`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a YouTube SEO expert who creates descriptions that rank well and drive engagement.',
        temperature: 0.7,
        maxTokens: 1500,
      });

      if (response.success && response.data?.text) {
        const text = response.data.text;
        const descMatch = text.match(/DESCRIPTION:\s*([\s\S]*?)(?=TAGS:|$)/i);
        const tagsMatch = text.match(/TAGS:\s*([\s\S]*?)$/i);

        const description = descMatch ? descMatch[1].trim() : text;
        const tags = tagsMatch
          ? tagsMatch[1].split(',').map((t: string) => t.trim()).filter((t: string) => t)
          : [];

        setResult({ description, tags });
      } else {
        setError(response.error || 'Failed to generate');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-red-900/20' : 'from-white to-red-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Youtube className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.youTubeDescription.youtubeDescriptionGenerator', 'YouTube Description Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.youTubeDescription.createSeoOptimizedDescriptionsAnd', 'Create SEO-optimized descriptions and tags')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.youTubeDescription.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.youTubeDescription.videoTitle', 'Video Title *')}</label>
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder={t('tools.youTubeDescription.enterYourVideoTitle', 'Enter your video title')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.youTubeDescription.videoSummary', 'Video Summary')}</label>
          <textarea
            value={videoSummary}
            onChange={(e) => setVideoSummary(e.target.value)}
            placeholder={t('tools.youTubeDescription.brieflyDescribeWhatYourVideo', 'Briefly describe what your video is about...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.youTubeDescription.videoType', 'Video Type')}</label>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {videoTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.youTubeDescription.targetKeywords', 'Target Keywords')}</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={t('tools.youTubeDescription.eGReactTutorialCoding', 'e.g., react tutorial, coding')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeTimestamps} onChange={(e) => setIncludeTimestamps(e.target.checked)} className="w-4 h-4 accent-red-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.youTubeDescription.includeTimestamps', 'Include timestamps')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={includeCTA} onChange={(e) => setIncludeCTA(e.target.checked)} className="w-4 h-4 accent-red-500" />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.youTubeDescription.includeCallToAction', 'Include call-to-action')}</span>
          </label>
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !videoTitle.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Youtube className="w-5 h-5" />}
          {isGenerating ? t('tools.youTubeDescription.generating', 'Generating...') : t('tools.youTubeDescription.generateDescription', 'Generate Description')}
        </button>

        {result && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.youTubeDescription.description', 'Description')}</label>
                <button
                  onClick={() => handleCopy(result.description, 'desc')}
                  className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {copiedField === 'desc' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copiedField === 'desc' ? t('tools.youTubeDescription.copied', 'Copied!') : t('tools.youTubeDescription.copy', 'Copy')}
                </button>
              </div>
              <div className={`p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
                <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-sans`}>{result.description}</pre>
              </div>
            </div>

            {result.tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-1`}>
                    <Hash className="w-4 h-4" /> Tags ({result.tags.length})
                  </label>
                  <button
                    onClick={() => handleCopy(result.tags.join(', '), 'tags')}
                    className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {copiedField === 'tags' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copiedField === 'tags' ? t('tools.youTubeDescription.copied2', 'Copied!') : t('tools.youTubeDescription.copyAll', 'Copy All')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, i) => (
                    <span key={i} className={`px-2 py-1 text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-full`}>
                      {tag}
                    </span>
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

export default YoutubeDescriptionTool;
