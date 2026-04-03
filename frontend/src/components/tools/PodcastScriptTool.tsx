import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Headphones, Loader2, Copy, Check, Clock, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PodcastScriptToolProps {
  uiConfig?: UIConfig;
}

const podcastFormats = [
  { value: 'solo', label: 'Solo/Monologue' },
  { value: 'interview', label: 'Interview Format' },
  { value: 'co-hosted', label: 'Co-Hosted Discussion' },
  { value: 'storytelling', label: 'Storytelling/Narrative' },
  { value: 'educational', label: 'Educational/Tutorial' },
  { value: 'news', label: 'News & Commentary' },
  { value: 'roundtable', label: 'Panel/Roundtable' },
];

const durations = [
  { value: '10', label: '10 minutes (~1500 words)' },
  { value: '20', label: '20 minutes (~3000 words)' },
  { value: '30', label: '30 minutes (~4500 words)' },
  { value: '45', label: '45 minutes (~6750 words)' },
  { value: '60', label: '60 minutes (~9000 words)' },
];

export const PodcastScriptTool: React.FC<PodcastScriptToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('solo');
  const [duration, setDuration] = useState('20');
  const [podcastName, setPodcastName] = useState('');
  const [hostName, setHostName] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setTopic(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const wordCount = parseInt(duration) * 150;
      const prompt = `Write a podcast script with the following specifications:

Topic: ${topic}
Format: ${podcastFormats.find(f => f.value === format)?.label}
Target Duration: ${duration} minutes (~${wordCount} words)
Podcast Name: ${podcastName || 'Not specified'}
Host Name: ${hostName || 'Host'}
Key Points to Cover: ${keyPoints || 'General discussion of the topic'}
Target Audience: ${targetAudience || 'General audience'}

Requirements:
1. Include an engaging intro with hook
2. Clear segment transitions
3. ${format === 'interview' ? 'Include sample interview questions and anticipated responses' : ''}
4. ${format === 'co-hosted' ? 'Write dialogue for two hosts with natural back-and-forth' : ''}
5. Add timing markers [00:00] at key points
6. Include natural conversational elements
7. Write an outro with call-to-action
8. Add speaker labels (HOST:, GUEST:, etc.)
9. Include ad break placeholders if relevant
10. Make it engaging and easy to follow

Write the complete podcast script, ready to record.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a podcast producer who writes engaging, professional podcast scripts.',
        temperature: 0.8,
        maxTokens: 4000,
      });

      if (response.success && response.data?.text) {
        setScript(response.data.text);
      } else {
        setError(response.error || 'Failed to generate script');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = script.split(/\s+/).filter(w => w).length;
  const estimatedTime = Math.ceil(wordCount / 150);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-violet-900/20' : 'from-white to-violet-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Headphones className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.podcastScript.podcastScriptWriter', 'Podcast Script Writer')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.podcastScript.createEngagingPodcastScripts', 'Create engaging podcast scripts')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.podcastScript.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.podcastScript.episodeTopic', 'Episode Topic *')}</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.podcastScript.whatSYourEpisodeAbout', 'What\'s your episode about?')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.podcastScript.podcastFormat', 'Podcast Format')}</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {podcastFormats.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.podcastScript.targetDuration', 'Target Duration')}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {durations.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.podcastScript.podcastName', 'Podcast Name')}</label>
            <input
              type="text"
              value={podcastName}
              onChange={(e) => setPodcastName(e.target.value)}
              placeholder={t('tools.podcastScript.yourPodcastName', 'Your podcast name')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.podcastScript.hostName', 'Host Name')}</label>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder={t('tools.podcastScript.yourName', 'Your name')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.podcastScript.keyPointsToCover', 'Key Points to Cover')}</label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder={t('tools.podcastScript.mainTopicsTalkingPointsOr', 'Main topics, talking points, or questions to address...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.podcastScript.targetAudience', 'Target Audience')}</label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder={t('tools.podcastScript.eGEntrepreneursFitnessEnthusiasts', 'e.g., entrepreneurs, fitness enthusiasts, tech professionals')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Headphones className="w-5 h-5" />}
          {isGenerating ? t('tools.podcastScript.writingScript', 'Writing Script...') : t('tools.podcastScript.generateScript', 'Generate Script')}
        </button>

        {script && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{wordCount} words</span>
                <span className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-4 h-4" /> ~{estimatedTime} min
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.podcastScript.copied', 'Copied!') : t('tools.podcastScript.copy', 'Copy')}
              </button>
            </div>
            <div className={`p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl max-h-96 overflow-y-auto`}>
              <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-sans leading-relaxed`}>{script}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastScriptTool;
