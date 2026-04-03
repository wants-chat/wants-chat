import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Laugh, Loader2, Download, RefreshCw, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MemeGeneratorToolProps {
  uiConfig?: UIConfig;
}

const memeStyles = [
  { value: 'classic', label: 'Classic Meme (Impact font style)' },
  { value: 'modern', label: 'Modern Meme' },
  { value: 'reaction', label: 'Reaction Image' },
  { value: 'wholesome', label: 'Wholesome Meme' },
  { value: 'dank', label: 'Dank Meme' },
  { value: 'corporate', label: 'Corporate/Professional Humor' },
  { value: 'surreal', label: 'Surreal/Absurdist' },
];

const memeTopics = [
  { value: 'work', label: 'Work/Office Life' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'technology', label: 'Technology' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'daily-life', label: 'Daily Life' },
  { value: 'school', label: 'School/Education' },
  { value: 'pop-culture', label: 'Pop Culture' },
  { value: 'custom', label: 'Custom Topic' },
];

export const MemeGeneratorTool: React.FC<MemeGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [topic, setTopic] = useState('daily-life');
  const [customTopic, setCustomTopic] = useState('');
  const [style, setStyle] = useState('modern');
  const [mood, setMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memeImage, setMemeImage] = useState<string | null>(null);

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
        if (params.customTopic) {
          setCustomTopic(params.customTopic);
          setTopic('custom');
          hasPrefill = true;
        }
        if (params.style) {
          setStyle(params.style);
          hasPrefill = true;
        }
        if (params.mood) {
          setMood(params.mood);
          hasPrefill = true;
        }
        // Restore the generated image URL if available
        if (params.imageUrl) {
          setMemeImage(params.imageUrl);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
      }

      setIsPrefilled(hasPrefill);
    } else if (uiConfig?.prefillData) {
      const data = uiConfig.prefillData;
      if (data.topic && memeTopics.find(t => t.value === data.topic)) {
        setTopic(data.topic as string);
      }
      if (data.customTopic) {
        setCustomTopic(data.customTopic as string);
        setTopic('custom');
      }
      if (data.style && memeStyles.find(s => s.value === data.style)) {
        setStyle(data.style as string);
      }
      if (data.mood) {
        setMood(data.mood as string);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  const handleGenerate = async () => {
    if (topic === 'custom' && !customTopic.trim()) {
      setError('Please enter a custom topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const topicText = topic === 'custom' ? customTopic : memeTopics.find(t => t.value === topic)?.label;
      const styleText = memeStyles.find(s => s.value === style)?.label;

      const prompt = `Create a ${styleText} meme image about ${topicText}. ${mood ? `The mood should be ${mood}.` : ''} The image should be funny, relatable, and shareable on social media. Include visual humor elements typical of internet memes. Make the composition simple and the humor immediately obvious. Style: clean, high-quality meme format.`;

      const response = await api.post('/ai/image/generate', {
        prompt,
        style: 'illustration',
        aspectRatio: '1:1',
      });

      if (response.success && response.data?.url) {
        setMemeImage(response.data.url);
      } else {
        setError(response.error || 'Failed to generate meme');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!memeImage) return;

    try {
      const response = await fetch(memeImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleSave = async () => {
    if (!memeImage) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'image',
        url: memeImage,
        title: `Meme: ${customTopic || topic}`,
        prompt: customTopic || topic,
        metadata: {
          toolId: 'meme-generator',
          topic: topic,
          customTopic: customTopic,
          style: style,
          mood: mood,
          imageUrl: memeImage,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-yellow-900/20' : 'from-white to-yellow-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Laugh className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.memeGenerator.aiMemeGenerator', 'AI Meme Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.memeGenerator.createFunnyMemesWithAi', 'Create funny memes with AI')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.memeGenerator.memeTopic', 'Meme Topic')}</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {memeTopics.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.memeGenerator.memeStyle', 'Meme Style')}</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {memeStyles.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {topic === 'custom' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.memeGenerator.customTopic', 'Custom Topic *')}</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder={t('tools.memeGenerator.describeYourMemeIdea', 'Describe your meme idea...')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.memeGenerator.moodVibeOptional', 'Mood/Vibe (Optional)')}</label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder={t('tools.memeGenerator.eGSarcasticSelfDeprecating', 'e.g., sarcastic, self-deprecating, absurd, wholesome')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Laugh className="w-5 h-5" />}
          {isGenerating ? t('tools.memeGenerator.generatingMeme', 'Generating Meme...') : t('tools.memeGenerator.generateMeme', 'Generate Meme')}
        </button>

        {memeImage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.memeGenerator.yourMeme', 'Your Meme')}</h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.memeGenerator.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.memeGenerator.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.memeGenerator.regenerate', 'Regenerate')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t('tools.memeGenerator.download', 'Download')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {t('tools.memeGenerator.save', 'Save')}
                </button>
              </div>
            </div>
            <div className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} rounded-xl overflow-hidden`}>
              <img src={memeImage} alt="Generated meme" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeGeneratorTool;
