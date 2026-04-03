import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, Play, Pause, Square, Settings, Download, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
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

interface TextToSpeechToolProps {
  uiConfig?: UIConfig;
}

interface SpeechSession {
  text: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  timestamp: Date;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'text', header: 'Text' },
  { key: 'voice', header: 'Voice' },
  { key: 'rate', header: 'Speed' },
  { key: 'pitch', header: 'Pitch' },
  { key: 'volume', header: 'Volume' },
  { key: 'timestamp', header: 'Timestamp', type: 'date' },
];

export const TextToSpeechTool: React.FC<TextToSpeechToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [text, setText] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState<SpeechSession[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setText(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (!text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      // Record the session
      const session: SpeechSession = {
        text: text.substring(0, 100),
        voice: selectedVoice,
        rate,
        pitch,
        volume,
        timestamp: new Date(),
      };
      setSessions([session, ...sessions]);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleExportCSV = () => {
    exportToCSV(sessions, COLUMNS, { filename: 'speech-sessions' });
  };

  const handleExportExcel = () => {
    exportToExcel(sessions, COLUMNS, { filename: 'speech-sessions' });
  };

  const handleExportJSON = () => {
    exportToJSON(sessions, { filename: 'speech-sessions' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(sessions, COLUMNS, {
      filename: 'speech-sessions',
      title: 'Text to Speech Sessions',
      subtitle: 'Export of speech synthesis sessions',
    });
  };

  const handlePrint = () => {
    printData(sessions, COLUMNS, { title: 'Text to Speech Sessions' });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(sessions, COLUMNS, 'tab');
  };

  const examples = [
    { label: 'Greeting', text: 'Hello! Welcome to our text to speech tool. This is a sample of how the voice sounds.' },
    { label: 'News', text: 'Breaking news: Scientists have discovered a new species of deep-sea fish in the Pacific Ocean.' },
    { label: 'Story', text: 'Once upon a time, in a land far away, there lived a brave knight who dreamed of adventure.' },
    { label: 'Technical', text: 'The API endpoint returns a JSON response containing user data and authentication tokens.' },
  ];

  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0].toUpperCase();
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-violet-900/20' : 'bg-gradient-to-r from-white to-violet-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Volume2 className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.textToSpeech.textToSpeech', 'Text to Speech')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.textToSpeech.convertTextToNaturalSpeech', 'Convert text to natural speech')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={theme}
              />
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                showSettings
                  ? 'bg-violet-500 text-white'
                  : isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              {t('tools.textToSpeech.settings', 'Settings')}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.textToSpeech.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className={`p-4 rounded-xl space-y-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.textToSpeech.voice', 'Voice')}
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {Object.entries(groupedVoices).map(([lang, langVoices]) => (
                    <optgroup key={lang} label={lang}>
                      {langVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} {voice.default ? '(Default)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Speed: {rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Pitch: {pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.textToSpeech.enterText', 'Enter Text')}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('tools.textToSpeech.typeOrPasteTextTo', 'Type or paste text to convert to speech...')}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
          />
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {text.length} characters
            </span>
            <button
              onClick={() => setText('')}
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('tools.textToSpeech.clear', 'Clear')}
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.textToSpeech.quickExamples', 'Quick Examples')}
          </label>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setText(ex.text)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={!text.trim() && !isPaused}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                {t('tools.textToSpeech.pause', 'Pause')}
              </>
            ) : isPaused ? (
              <>
                <Play className="w-5 h-5" />
                {t('tools.textToSpeech.resume', 'Resume')}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {t('tools.textToSpeech.play', 'Play')}
              </>
            )}
          </button>

          <button
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Square className="w-5 h-5" />
            {t('tools.textToSpeech.stop', 'Stop')}
          </button>
        </div>

        {/* Playing Indicator */}
        {isPlaying && (
          <div className={`p-4 rounded-xl flex items-center justify-center gap-3 ${isDark ? 'bg-violet-900/20' : 'bg-violet-50'}`}>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-violet-500 rounded-full animate-pulse"
                  style={{
                    height: `${12 + Math.random() * 12}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>
              {t('tools.textToSpeech.speaking', 'Speaking...')}
            </span>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.textToSpeech.note', 'Note:')}</strong> Text-to-speech uses your browser's built-in speech synthesis.
            Available voices depend on your operating system and browser. For best results, use
            Chrome or Edge with the latest updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechTool;
