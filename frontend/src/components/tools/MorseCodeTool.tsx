import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, ArrowLeftRight, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MorseCodeToolProps {
  uiConfig?: UIConfig;
}

const morseCodeMap: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
};

const reverseMorseMap: Record<string, string> = Object.entries(morseCodeMap).reduce(
  (acc, [char, morse]) => ({ ...acc, [morse]: char }),
  {}
);

export const MorseCodeTool = ({ uiConfig }: MorseCodeToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [mode, setMode] = useState<'textToMorse' | 'morseToText'>('textToMorse');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(15);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopPlaybackRef = useRef(false);

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

  useEffect(() => {
    if (mode === 'textToMorse') {
      setOutput(textToMorse(input));
    } else {
      setOutput(morseToText(input));
    }
  }, [input, mode]);

  const textToMorse = (text: string): string => {
    return text
      .toUpperCase()
      .split('')
      .map(char => morseCodeMap[char] || char)
      .join(' ');
  };

  const morseToText = (morse: string): string => {
    return morse
      .split(' ')
      .map(code => {
        if (code === '/') return ' ';
        return reverseMorseMap[code] || code;
      })
      .join('');
  };

  const handleSwap = () => {
    setMode(mode === 'textToMorse' ? 'morseToText' : 'textToMorse');
    setInput(output);
    setIsPrefilled(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playMorseCode = async () => {
    if (isPlaying || !output) return;

    setIsPlaying(true);
    stopPlaybackRef.current = false;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const frequency = 600; // Hz
    const dotDuration = 1200 / wpm; // ms
    const dashDuration = dotDuration * 3;
    const symbolGap = dotDuration;
    const letterGap = dotDuration * 3;
    const wordGap = dotDuration * 7;

    const morseToPlay = mode === 'textToMorse' ? output : textToMorse(input);

    const playTone = (duration: number): Promise<void> => {
      return new Promise(resolve => {
        if (stopPlaybackRef.current) {
          resolve();
          return;
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000 - 0.01);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration / 1000);

        setTimeout(resolve, duration);
      });
    };

    const pause = (duration: number): Promise<void> => {
      return new Promise(resolve => setTimeout(resolve, duration));
    };

    for (const char of morseToPlay) {
      if (stopPlaybackRef.current) break;

      if (char === '.') {
        await playTone(dotDuration);
        await pause(symbolGap);
      } else if (char === '-') {
        await playTone(dashDuration);
        await pause(symbolGap);
      } else if (char === ' ') {
        await pause(letterGap);
      } else if (char === '/') {
        await pause(wordGap);
      }
    }

    setIsPlaying(false);
  };

  const stopPlayback = () => {
    stopPlaybackRef.current = true;
    setIsPlaying(false);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setIsPrefilled(false);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.morseCode.morseCodeTranslator', 'Morse Code Translator')}
      </h2>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.morseCode.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`font-medium ${mode === 'textToMorse' ? 'text-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.morseCode.text', 'Text')}
          </span>
          <button
            onClick={handleSwap}
            className="p-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <span className={`font-medium ${mode === 'morseToText' ? 'text-[#0D9488]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.morseCode.morseCode', 'Morse Code')}
          </span>
        </div>

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {mode === 'textToMorse' ? t('tools.morseCode.enterText', 'Enter Text') : t('tools.morseCode.enterMorseCodeUseAnd', 'Enter Morse Code (use . and -, space between letters, / between words)')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'textToMorse' ? t('tools.morseCode.typeYourMessageHere', 'Type your message here...') : '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'}
            className={`w-full h-32 px-4 py-3 rounded-lg border font-mono ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {mode === 'textToMorse' ? t('tools.morseCode.morseCode2', 'Morse Code') : t('tools.morseCode.text2', 'Text')}
            </label>
            <div className="flex items-center gap-2">
              {output && (
                <>
                  <button
                    onClick={isPlaying ? stopPlayback : playMorseCode}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {isPlaying ? t('tools.morseCode.stop', 'Stop') : t('tools.morseCode.play', 'Play')}
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      copied
                        ? 'bg-green-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? t('tools.morseCode.copied', 'Copied!') : t('tools.morseCode.copy', 'Copy')}
                  </button>
                </>
              )}
            </div>
          </div>
          <div
            className={`w-full min-h-[128px] px-4 py-3 rounded-lg border font-mono text-lg tracking-wider ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          >
            {output || <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t('tools.morseCode.outputWillAppearHere', 'Output will appear here...')}</span>}
          </div>
        </div>

        {/* Playback Speed */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Playback Speed: {wpm} WPM
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t('tools.morseCode.slow5', 'Slow (5)')}</span>
            <span>{t('tools.morseCode.normal15', 'Normal (15)')}</span>
            <span>{t('tools.morseCode.fast30', 'Fast (30)')}</span>
          </div>
        </div>

        {/* Clear Button */}
        <div className="flex justify-end">
          <button
            onClick={handleClear}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.morseCode.clear', 'Clear')}
          </button>
        </div>

        {/* Reference Chart */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.morseCode.morseCodeReference', 'Morse Code Reference')}
          </h3>
          <div className="grid grid-cols-6 md:grid-cols-9 gap-2 text-center">
            {Object.entries(morseCodeMap).slice(0, 36).map(([char, morse]) => (
              <div
                key={char}
                className={`p-2 rounded text-xs ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
              >
                <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {char === ' ' ? 'SPACE' : char}
                </div>
                <div className={`font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {morse}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.morseCode.aboutMorseCode', 'About Morse Code')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Morse code is a method of encoding text using dots (.) and dashes (-). It was developed by Samuel Morse
            in the 1830s for telegraph communication. The universal distress signal SOS (... --- ...) is recognized
            worldwide. Each letter and number has a unique pattern, with timing being crucial for accurate transmission.
          </p>
        </div>
      </div>
    </div>
  );
};
