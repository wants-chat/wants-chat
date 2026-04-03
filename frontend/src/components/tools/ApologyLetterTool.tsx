import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

const apologyTypes = [
  { value: 'personal', label: 'Personal/Friend' },
  { value: 'romantic', label: 'Romantic Partner' },
  { value: 'family', label: 'Family Member' },
  { value: 'professional', label: 'Professional/Work' },
  { value: 'customer', label: 'Customer Service' },
  { value: 'business', label: 'Business/Client' },
  { value: 'public', label: 'Public Statement' },
];

const tones = [
  { value: 'sincere', label: 'Sincere & Heartfelt' },
  { value: 'formal', label: 'Formal & Professional' },
  { value: 'humble', label: 'Humble & Remorseful' },
  { value: 'warm', label: 'Warm & Personal' },
  { value: 'direct', label: 'Direct & To-the-point' },
];

interface ApologyLetterToolProps {
  uiConfig?: UIConfig;
}

export const ApologyLetterTool: React.FC<ApologyLetterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [apologyType, setApologyType] = useState('personal');
  const [recipientName, setRecipientName] = useState('');
  const [yourName, setYourName] = useState('');
  const [situation, setSituation] = useState('');
  const [impact, setImpact] = useState('');
  const [resolution, setResolution] = useState('');
  const [tone, setTone] = useState('sincere');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasPrefill = false;

      if (params.content) {
        setSituation(params.content);
        hasPrefill = true;
      }
      if (params.text) {
        setImpact(params.text);
        hasPrefill = true;
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!situation.trim()) {
      setError('Please describe what you are apologizing for');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const typeLabel = apologyTypes.find(t => t.value === apologyType)?.label;
      const toneLabel = tones.find(t => t.value === tone)?.label;

      const prompt = `Write a ${toneLabel} apology letter for a ${typeLabel} situation.

Details:
- Recipient: ${recipientName || 'Not specified'}
- From: ${yourName || 'Not specified'}
- What happened: ${situation}
- Impact/Hurt caused: ${impact || 'Not specified'}
- How I plan to make it right: ${resolution || 'Not specified'}

Requirements:
1. Take full responsibility - no excuses or deflection
2. Acknowledge the specific harm or hurt caused
3. Express genuine remorse and understanding
4. ${resolution ? 'Include the mentioned plan to make amends' : 'Suggest ways to make amends or prevent future issues'}
5. Be ${toneLabel.toLowerCase()} throughout
6. Don't over-apologize or be self-pitying
7. End with a hopeful but not presumptuous note
8. Keep it appropriate for the relationship type

Write a complete, genuine apology letter.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an empathetic writer who helps people express genuine remorse and repair relationships through thoughtful apology letters.',
        temperature: 0.7,
        maxTokens: 1500,
      });

      if (response.success && response.data?.text) {
        setLetter(response.data.text);
      } else {
        setError(response.error || 'Failed to generate letter');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-pink-900/20' : 'from-white to-pink-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.apologyLetter.apologyLetterWriter', 'Apology Letter Writer')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.apologyLetter.craftSincereApologiesToMend', 'Craft sincere apologies to mend relationships')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.apologyLetter.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.apologyLetter.apologyType', 'Apology Type')}</label>
            <select
              value={apologyType}
              onChange={(e) => setApologyType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {apologyTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.apologyLetter.tone', 'Tone')}</label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.apologyLetter.recipientName', 'Recipient Name')}</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder={t('tools.apologyLetter.whoAreYouApologizingTo', 'Who are you apologizing to?')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.apologyLetter.yourName', 'Your Name')}</label>
            <input
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder={t('tools.apologyLetter.yourName2', 'Your name')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.apologyLetter.whatHappened', 'What Happened *')}</label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={t('tools.apologyLetter.describeWhatYouDidOr', 'Describe what you did or what happened that requires an apology...')}
            rows={3}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.apologyLetter.impactOnThem', 'Impact on Them')}</label>
          <textarea
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            placeholder={t('tools.apologyLetter.howDidYourActionsAffect', 'How did your actions affect them? What hurt did it cause?')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.apologyLetter.howWillYouMakeIt', 'How Will You Make It Right?')}</label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder={t('tools.apologyLetter.whatStepsWillYouTake', 'What steps will you take to fix the situation or prevent it from happening again?')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !situation.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
          {isGenerating ? t('tools.apologyLetter.writingApology', 'Writing Apology...') : t('tools.apologyLetter.generateApologyLetter', 'Generate Apology Letter')}
        </button>

        {letter && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.apologyLetter.yourApologyLetter', 'Your Apology Letter')}</h4>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.apologyLetter.copied', 'Copied!') : t('tools.apologyLetter.copy', 'Copy')}
              </button>
            </div>
            <div className={`p-6 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl`}>
              <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-sans leading-relaxed`}>{letter}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApologyLetterTool;
