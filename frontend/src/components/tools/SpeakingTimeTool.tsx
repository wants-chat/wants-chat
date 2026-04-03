import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Mic, Clock, Zap, MessageSquare, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SpeakingTimeToolProps {
  uiConfig?: UIConfig;
}

type SpeakingPace = 'slow' | 'moderate' | 'fast' | 'conversational';

interface PaceSettings {
  label: string;
  wpm: number;
  description: string;
  icon: React.ReactNode;
}

const paceOptions: Record<SpeakingPace, PaceSettings> = {
  slow: { label: 'Slow', wpm: 100, description: 'Formal speeches, presentations', icon: <Clock className="w-4 h-4" /> },
  moderate: { label: 'Moderate', wpm: 130, description: 'Standard speaking pace', icon: <Mic className="w-4 h-4" /> },
  fast: { label: 'Fast', wpm: 160, description: 'Energetic delivery', icon: <Zap className="w-4 h-4" /> },
  conversational: { label: 'Conversational', wpm: 150, description: 'Natural casual pace', icon: <MessageSquare className="w-4 h-4" /> },
};

export const SpeakingTimeTool = ({
  uiConfig }: SpeakingTimeToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [pace, setPace] = useState<SpeakingPace>('moderate');
  const [customWpm, setCustomWpm] = useState(130);
  const [useCustomWpm, setUseCustomWpm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [includesPauses, setIncludesPauses] = useState(true);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setInput(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const getWordCount = () => {
    return input.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getParagraphCount = () => {
    return input.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  };

  const getSentenceCount = () => {
    return input.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  };

  const getWpm = () => {
    return useCustomWpm ? customWpm : paceOptions[pace].wpm;
  };

  const calculateSpeakingTime = (): number => {
    const wordCount = getWordCount();
    const wpm = getWpm();
    let baseTime = (wordCount / wpm) * 60; // in seconds

    // Add pause time if enabled (approximately 0.5 seconds per sentence)
    if (includesPauses) {
      const sentences = getSentenceCount();
      baseTime += sentences * 0.5;
    }

    return Math.round(baseTime);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTimeForAllPaces = () => {
    const wordCount = getWordCount();
    const sentences = getSentenceCount();
    const pauseTime = includesPauses ? sentences * 0.5 : 0;

    return Object.entries(paceOptions).map(([key, value]) => ({
      pace: key as SpeakingPace,
      ...value,
      time: Math.round((wordCount / value.wpm) * 60 + pauseTime),
    }));
  };

  const handleCopy = async () => {
    const wordCount = getWordCount();
    const speakingTime = calculateSpeakingTime();
    const summary = `Speaking Time Analysis
Words: ${wordCount}
Speaking Time: ${formatTime(speakingTime)}
Pace: ${useCustomWpm ? `Custom (${customWpm} WPM)` : `${paceOptions[pace].label} (${paceOptions[pace].wpm} WPM)`}
Includes Pauses: ${includesPauses ? 'Yes' : 'No'}

All Paces:
${getTimeForAllPaces().map(p => `- ${p.label}: ${formatTime(p.time)}`).join('\n')}`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = getWordCount();
  const speakingTime = calculateSpeakingTime();

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.speakingTime.speakingTimeEstimator', 'Speaking Time Estimator')}
      </h2>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.speakingTime.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Pace Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.speakingTime.speakingPace', 'Speaking Pace')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(paceOptions).map(([key, value]) => (
              <button
                key={key}
                onClick={() => { setPace(key as SpeakingPace); setUseCustomWpm(false); }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  pace === key && !useCustomWpm
                    ? 'border-[#0D9488] bg-[#0D9488]/10'
                    : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={pace === key && !useCustomWpm ? 'text-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {value.icon}
                  </span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {value.label}
                  </span>
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {value.wpm} WPM
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom WPM */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={useCustomWpm}
              onChange={(e) => setUseCustomWpm(e.target.checked)}
              className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
            />
            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              {t('tools.speakingTime.useCustomWordsPerMinute', 'Use custom words per minute')}
            </span>
          </label>
          {useCustomWpm && (
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="200"
                value={customWpm}
                onChange={(e) => setCustomWpm(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
              <span className={`min-w-[80px] text-center font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {customWpm} WPM
              </span>
            </div>
          )}
        </div>

        {/* Include Pauses */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includesPauses}
            onChange={(e) => setIncludesPauses(e.target.checked)}
            className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
          />
          <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
            {t('tools.speakingTime.includeNaturalPausesBetweenSentences', 'Include natural pauses between sentences')}
          </span>
        </label>

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.speakingTime.yourSpeechOrPresentationText', 'Your Speech or Presentation Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.speakingTime.pasteYourSpeechPresentationScript', 'Paste your speech, presentation script, or any text here...')}
            className={`w-full h-48 px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        {/* Main Result */}
        {wordCount > 0 && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg border-2 border-[#0D9488] ${theme === 'dark' ? 'bg-gray-700' : 'bg-teal-50'}`}>
              <div className="flex items-center justify-center gap-3">
                <Mic className="w-8 h-8 text-[#0D9488]" />
                <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(speakingTime)}
                </span>
              </div>
              <p className={`text-center mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Estimated Speaking Time ({wordCount} words at {getWpm()} WPM)
              </p>
            </div>

            {/* Time at Different Paces */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getTimeForAllPaces().map((item) => (
                <div
                  key={item.pace}
                  className={`p-3 rounded-lg text-center ${
                    item.pace === pace && !useCustomWpm
                      ? 'bg-[#0D9488]/20 border border-[#0D9488]'
                      : theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(item.time)}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {wordCount}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.speakingTime.words', 'Words')}</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getSentenceCount()}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.speakingTime.sentences', 'Sentences')}</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getParagraphCount()}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.speakingTime.paragraphs', 'Paragraphs')}</div>
              </div>
            </div>

            {/* Copy Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-500 text-white' : t('tools.speakingTime.bg0d9488HoverBg0f766e', 'bg-[#0D9488] hover:bg-[#0F766E] text-white')
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.speakingTime.copied', 'Copied!') : t('tools.speakingTime.copySummary', 'Copy Summary')}
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.speakingTime.speakingPaceGuidelines', 'Speaking Pace Guidelines')}
          </h3>
          <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>- Slow (100 WPM): Formal speeches, academic presentations, important announcements</li>
            <li>- Moderate (130 WPM): Professional presentations, training sessions</li>
            <li>- Fast (160 WPM): Energetic pitches, motivational speaking</li>
            <li>- Conversational (150 WPM): Podcasts, casual talks, interviews</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
