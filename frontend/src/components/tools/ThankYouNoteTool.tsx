import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GeneratedNote {
  content: string;
  timestamp: Date;
}

const occasions = [
  { value: 'interview', label: 'Job Interview' },
  { value: 'gift', label: 'Gift Received' },
  { value: 'help', label: 'Help/Favor' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'referral', label: 'Referral/Recommendation' },
  { value: 'business', label: 'Business Meeting' },
  { value: 'donation', label: 'Donation' },
  { value: 'event', label: 'Event Attendance' },
  { value: 'wedding', label: 'Wedding Gift' },
  { value: 'other', label: 'Other' },
];

const tones = [
  { value: 'formal', label: 'Formal' },
  { value: 'professional', label: 'Professional' },
  { value: 'warm', label: 'Warm & Personal' },
  { value: 'casual', label: 'Casual' },
  { value: 'heartfelt', label: 'Heartfelt' },
];

interface ThankYouNoteToolProps {
  uiConfig?: UIConfig;
}

export const ThankYouNoteTool: React.FC<ThankYouNoteToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState(occasions[0].value);
  const [customOccasion, setCustomOccasion] = useState('');
  const [whatToThankFor, setWhatToThankFor] = useState('');
  const [tone, setTone] = useState(tones[1].value);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setWhatToThankFor(params.text || params.content || '');
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.recipientName) setRecipientName(params.formData.recipientName);
        if (params.formData.occasion) setOccasion(params.formData.occasion);
        if (params.formData.tone) setTone(params.formData.tone);
        if (params.formData.additionalDetails) setAdditionalDetails(params.formData.additionalDetails);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!recipientName.trim() || !whatToThankFor.trim()) {
      setError('Please enter recipient name and what you are thanking them for');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const selectedOccasion = occasion === 'other' ? customOccasion : occasions.find(o => o.value === occasion)?.label;

      const systemMessage = `You are an expert at writing sincere, thoughtful thank you notes that leave a lasting positive impression.`;

      const prompt = `Write a thank you note with the following details:

Recipient: ${recipientName}
Occasion: ${selectedOccasion}
What I'm thanking them for: ${whatToThankFor}
Tone: ${tone}
${additionalDetails ? `Additional details to mention: ${additionalDetails}` : ''}

Requirements:
- Write a sincere, genuine thank you note
- Use ${tone} tone throughout
- Be specific about what you're grateful for
- Keep it concise but meaningful
- Include a warm opening and closing
- Make it personal and memorable

Format: Write the complete thank you note directly.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage,
        temperature: 0.8,
        maxTokens: 500,
      });

      if (response.success && response.data?.text) {
        setGeneratedNote({
          content: response.data.text,
          timestamp: new Date(),
        });
      } else {
        setError(response.error || 'Failed to generate thank you note');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the note');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedNote) return;
    try {
      await navigator.clipboard.writeText(generatedNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-teal-900/20' : t('tools.thankYouNote.fromWhiteTo0d94885', 'from-white to-[#0D9488]/5')} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Heart className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.thankYouNote.aiThankYouNoteGenerator', 'AI Thank You Note Generator')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.thankYouNote.createHeartfeltThankYouNotes', 'Create heartfelt thank you notes for any occasion')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.thankYouNote.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Recipient Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.thankYouNote.recipientName', 'Recipient Name *')}
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder={t('tools.thankYouNote.eGJohnTheSmith', 'e.g., John, The Smith Family, Mr. Johnson')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
          />
        </div>

        {/* Occasion and Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.thankYouNote.occasion', 'Occasion')}</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            >
              {occasions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.thankYouNote.tone', 'Tone')}</label>
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

        {/* Custom Occasion */}
        {occasion === 'other' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.thankYouNote.describeTheOccasion', 'Describe the Occasion')}
            </label>
            <input
              type="text"
              value={customOccasion}
              onChange={(e) => setCustomOccasion(e.target.value)}
              placeholder={t('tools.thankYouNote.describeTheOccasion2', 'Describe the occasion...')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all`}
            />
          </div>
        )}

        {/* What to Thank For */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.thankYouNote.whatAreYouThankingThem', 'What are you thanking them for? *')}
          </label>
          <textarea
            value={whatToThankFor}
            onChange={(e) => setWhatToThankFor(e.target.value)}
            placeholder={t('tools.thankYouNote.beSpecificAboutWhatYou', 'Be specific about what you\'re grateful for...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.thankYouNote.additionalDetailsOptional', 'Additional Details (Optional)')}
          </label>
          <textarea
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder={t('tools.thankYouNote.anyOtherDetailsYouWant', 'Any other details you want to mention...')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'} rounded-xl focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all resize-none`}
          />
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
          disabled={isGenerating || !recipientName.trim() || !whatToThankFor.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0D9488]/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('tools.thankYouNote.writingThankYouNote', 'Writing Thank You Note...')}
            </>
          ) : (
            <>
              <Heart className="w-5 h-5" />
              {t('tools.thankYouNote.generateThankYouNote', 'Generate Thank You Note')}
            </>
          )}
        </button>

        {/* Generated Note */}
        {generatedNote && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Heart className="w-4 h-4" />
                {t('tools.thankYouNote.yourThankYouNote', 'Your Thank You Note')}
              </h4>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg transition-colors text-sm`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    {t('tools.thankYouNote.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.thankYouNote.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <div className={`p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
              <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} whitespace-pre-wrap leading-relaxed`}>
                {generatedNote.content}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedNote && !isGenerating && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('tools.thankYouNote.yourThankYouNoteWill', 'Your thank you note will appear here')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThankYouNoteTool;
