import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Loader2, Copy, Check, Clock, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const speechTypes = [
  { value: 'wedding', label: 'Wedding Speech' },
  { value: 'best-man', label: 'Best Man Speech' },
  { value: 'maid-of-honor', label: 'Maid of Honor Speech' },
  { value: 'graduation', label: 'Graduation Speech' },
  { value: 'business', label: 'Business Presentation' },
  { value: 'keynote', label: 'Keynote Address' },
  { value: 'toast', label: 'Toast/Celebration' },
  { value: 'eulogy', label: 'Eulogy/Memorial' },
  { value: 'motivational', label: 'Motivational Speech' },
  { value: 'acceptance', label: 'Acceptance Speech' },
  { value: 'retirement', label: 'Retirement Speech' },
  { value: 'other', label: 'Other' },
];

const durations = [
  { value: '2', label: '2 minutes (~250 words)' },
  { value: '5', label: '5 minutes (~625 words)' },
  { value: '10', label: '10 minutes (~1250 words)' },
  { value: '15', label: '15 minutes (~1875 words)' },
];

const tones = [
  { value: 'heartfelt', label: 'Heartfelt & Emotional' },
  { value: 'humorous', label: 'Humorous & Light' },
  { value: 'professional', label: 'Professional & Formal' },
  { value: 'inspiring', label: 'Inspiring & Motivational' },
  { value: 'casual', label: 'Casual & Relaxed' },
];

interface SpeechWriterToolProps {
  uiConfig?: UIConfig;
}

export const SpeechWriterTool: React.FC<SpeechWriterToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [speechType, setSpeechType] = useState('wedding');
  const [occasion, setOccasion] = useState('');
  const [audience, setAudience] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [duration, setDuration] = useState('5');
  const [tone, setTone] = useState('heartfelt');
  const [personalDetails, setPersonalDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speech, setSpeech] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle prefill from uiConfig or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.speechType) {
          setSpeechType(params.speechType);
          hasPrefill = true;
        }
        if (params.occasion) {
          setOccasion(params.occasion);
          hasPrefill = true;
        }
        if (params.audience) {
          setAudience(params.audience);
          hasPrefill = true;
        }
        if (params.keyPoints) {
          setKeyPoints(params.keyPoints);
          hasPrefill = true;
        }
        if (params.duration) {
          setDuration(params.duration);
          hasPrefill = true;
        }
        if (params.tone) {
          setTone(params.tone);
          hasPrefill = true;
        }
        if (params.personalDetails) {
          setPersonalDetails(params.personalDetails);
          hasPrefill = true;
        }
        // Restore the generated speech
        if (params.text) {
          setSpeech(params.text);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setOccasion(params.text || params.content || '');
          hasPrefill = true;
        }
        if (params.formData) {
          if (params.formData.speechType) setSpeechType(params.formData.speechType);
          if (params.formData.occasion) setOccasion(params.formData.occasion);
          if (params.formData.audience) setAudience(params.formData.audience);
          if (params.formData.keyPoints) setKeyPoints(params.formData.keyPoints);
          if (params.formData.duration) setDuration(params.formData.duration);
          if (params.formData.tone) setTone(params.formData.tone);
          if (params.formData.personalDetails) setPersonalDetails(params.formData.personalDetails);
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!occasion.trim() && speechType === 'other') {
      setError('Please describe the occasion');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const wordCount = parseInt(duration) * 125;
      const prompt = `Write a ${speechType === 'other' ? occasion : speechTypes.find(s => s.value === speechType)?.label} speech.

Occasion: ${occasion || speechTypes.find(s => s.value === speechType)?.label}
Audience: ${audience || 'General audience'}
Key Points to Include: ${keyPoints || 'General themes appropriate for this type of speech'}
Personal Details/Stories: ${personalDetails || 'None provided'}
Tone: ${tone}
Target Length: Approximately ${wordCount} words (${duration} minutes)

Requirements:
1. Start with a strong, attention-grabbing opening
2. Include appropriate anecdotes and personal touches
3. Maintain the ${tone} tone throughout
4. Build to a memorable conclusion
5. Include natural pauses and transitions
6. Make it easy to deliver (conversational language)
7. End with a powerful closing statement or toast

Write the complete speech, ready to be delivered.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert speechwriter who creates memorable, emotionally resonant speeches.',
        temperature: 0.8,
        maxTokens: 3000,
      });

      if (response.success && response.data?.text) {
        setSpeech(response.data.text);
      } else {
        setError(response.error || 'Failed to generate speech');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(speech);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!speech) return;

    setIsSaving(true);
    try {
      const speechTypeLabel = speechTypes.find(s => s.value === speechType)?.label || speechType;
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Speech: ${speechTypeLabel}${occasion ? ` - ${occasion}` : ''}`,
        prompt: `${speechTypeLabel} speech`,
        metadata: {
          text: speech,
          toolId: 'speech-writer',
          speechType,
          occasion,
          audience,
          keyPoints,
          duration,
          tone,
          personalDetails,
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

  const wordCount = speech.split(/\s+/).filter(w => w).length;
  const readingTime = Math.ceil(wordCount / 125);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-purple-900/20' : 'from-white to-purple-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Mic className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.speechWriter.speechWriter', 'Speech Writer')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.speechWriter.createCompellingSpeechesForAny', 'Create compelling speeches for any occasion')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.speechWriter.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.speechWriter.contentLoadedFromYourConversation', 'Content loaded from your conversation')}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.speechWriter.speechType', 'Speech Type')}</label>
            <select
              value={speechType}
              onChange={(e) => setSpeechType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {speechTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.speechWriter.duration', 'Duration')}</label>
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

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Occasion Details {speechType === 'other' && '*'}
          </label>
          <input
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder={t('tools.speechWriter.eGJohnAndSarah', 'e.g., John and Sarah\'s wedding, Company annual meeting')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.speechWriter.audience', 'Audience')}</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder={t('tools.speechWriter.eGFamilyAndFriends', 'e.g., Family and friends, Business colleagues')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.speechWriter.tone', 'Tone')}</label>
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
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.speechWriter.keyPointsToInclude', 'Key Points to Include')}</label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder={t('tools.speechWriter.listTheMainPointsThemes', 'List the main points, themes, or messages you want to convey...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.speechWriter.personalDetailsStories', 'Personal Details/Stories')}</label>
          <textarea
            value={personalDetails}
            onChange={(e) => setPersonalDetails(e.target.value)}
            placeholder={t('tools.speechWriter.shareAnyPersonalAnecdotesMemories', 'Share any personal anecdotes, memories, or specific details to include...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
          {isGenerating ? t('tools.speechWriter.writingSpeech', 'Writing Speech...') : t('tools.speechWriter.generateSpeech', 'Generate Speech')}
        </button>

        {speech && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{wordCount} words</span>
                <span className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-4 h-4" /> ~{readingTime} min
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {t('tools.speechWriter.editable', 'Editable')}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.speechWriter.saved', 'Saved!')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.speechWriter.saving', 'Saving...')}
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.speechWriter.copied', 'Copied!') : t('tools.speechWriter.copy', 'Copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'} rounded-lg disabled:opacity-50`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.speechWriter.save', 'Save')}
                </button>
              </div>
            </div>
            <textarea
              value={speech}
              onChange={(e) => setSpeech(e.target.value)}
              rows={12}
              className={`w-full p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'} rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-y leading-relaxed`}
              placeholder={t('tools.speechWriter.generatedSpeechWillAppearHere', 'Generated speech will appear here...')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechWriterTool;
