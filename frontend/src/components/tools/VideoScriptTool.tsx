import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Video, Loader2, Copy, Save, Clock, Target, Megaphone, Sparkles } from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';

interface ScriptSection {
  timestamp: string;
  scene: string;
  content: string;
}

const videoTypes = [
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'tiktok', label: 'TikTok / Short' },
  { value: 'explainer', label: 'Explainer Video' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'ad', label: 'Advertisement' },
];

const durations = [
  { value: '30s', label: '30 seconds' },
  { value: '1min', label: '1 minute' },
  { value: '3min', label: '3 minutes' },
  { value: '5min', label: '5 minutes' },
  { value: '10min', label: '10 minutes' },
];

const tones = [
  { value: 'educational', label: 'Educational' },
  { value: 'entertaining', label: 'Entertaining' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'inspiring', label: 'Inspiring' },
  { value: 'conversational', label: 'Conversational' },
];

interface VideoScriptToolProps {
  uiConfig?: UIConfig;
}

export const VideoScriptTool: React.FC<VideoScriptToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [videoType, setVideoType] = useState(videoTypes[0].value);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(durations[0].value);
  const [tone, setTone] = useState(tones[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const { saveToolData } = useToolData();

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & Record<string, any>;

      // Check if editing from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore all saved form fields
        if (params.topic) setTopic(params.topic);
        if (params.videoType) setVideoType(params.videoType);
        if (params.duration) setDuration(params.duration);
        if (params.tone) setTone(params.tone);
        // Restore generated content
        if (params.generatedScript) setGeneratedScript(params.generatedScript);
        setIsPrefilled(true);
      } else {
        // Standard prefill logic
        if (params.text || params.content) {
          setTopic(params.text || params.content || '');
          setIsPrefilled(true);
        }
        if (params.formData) {
          if (params.formData.topic) setTopic(params.formData.topic);
          if (params.formData.videoType) setVideoType(params.formData.videoType);
          if (params.formData.duration) setDuration(params.formData.duration);
          if (params.formData.tone) setTone(params.formData.tone);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic/subject');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate a professional video script for a ${videoType} about "${topic}".
Duration: ${duration}
Tone: ${tone}

Please include:
1. Opening hook (first 5 seconds)
2. Introduction
3. Main content sections with timestamps
4. Transition points
5. Call-to-action at the end
6. B-roll suggestions for each scene

Format the script with clear timestamps and scene descriptions.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        maxTokens: 2000,
      });

      if (response?.text) {
        setGeneratedScript(response.text);
      } else {
        setError('Failed to generate script. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the script');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedScript) return;

    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    if (!generatedScript) return;

    setIsSaving(true);
    try {
      await saveToolData({
        toolId: 'video-script',
        title: `Video Script: ${topic}`,
        content: generatedScript,
        contentType: 'text',
        metadata: {
          type: 'video_script',
          topic,
          videoType,
          duration,
          tone,
          generatedScript,
        },
      });

      // Call onSaveCallback if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }

      setValidationMessage('Script saved successfully!');
      setTimeout(() => setValidationMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save script');
    } finally {
      setIsSaving(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
    <div className={`rounded-xl shadow-sm border overflow-hidden ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'bg-gray-800/50 border-gray-700' : t('tools.videoScript.bgGradientToRFrom', 'bg-gradient-to-r from-white to-[#0D9488]/5 border-gray-100')
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Video className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.videoScript.aiVideoScriptGenerator', 'AI Video Script Generator')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.videoScript.createProfessionalVideoScriptsWith', 'Create professional video scripts with AI')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.videoScript.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Video Type & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Video className="w-4 h-4 inline mr-1" />
              {t('tools.videoScript.videoType', 'Video Type')}
            </label>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {videoTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t('tools.videoScript.targetDuration', 'Target Duration')}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {durations.map((dur) => (
                <option key={dur.value} value={dur.value}>
                  {dur.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Target className="w-4 h-4 inline mr-1" />
            {t('tools.videoScript.topicSubject', 'Topic / Subject')}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('tools.videoScript.eGHowToStart', 'e.g., How to start a successful podcast in 2025')}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Megaphone className="w-4 h-4 inline mr-1" />
            {t('tools.videoScript.tone', 'Tone')}
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            {tones.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 border rounded-xl text-sm ${
            isDark
              ? 'bg-red-900/20 border-red-800 text-red-400'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
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
              {t('tools.videoScript.generatingScript', 'Generating Script...')}
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              {t('tools.videoScript.generateVideoScript', 'Generate Video Script')}
            </>
          )}
        </button>

        {/* Generated Script */}
        {generatedScript && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.videoScript.generatedScript', 'Generated Script')}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 border rounded-lg transition-all flex items-center gap-2 ${
                    copySuccess
                      ? 'bg-green-500 text-white border-green-500'
                      : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? t('tools.videoScript.copied', 'Copied!') : t('tools.videoScript.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#2DD4BF] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            </div>
            <div className={`p-6 border rounded-xl whitespace-pre-wrap font-mono text-sm ${
              isDark
                ? 'bg-gray-900 border-gray-700 text-gray-300'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}>
              {generatedScript}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedScript && !isGenerating && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.videoScript.yourGeneratedVideoScriptWill', 'Your generated video script will appear here')}</p>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default VideoScriptTool;
