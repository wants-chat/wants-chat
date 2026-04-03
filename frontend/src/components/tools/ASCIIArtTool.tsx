import { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, RotateCcw, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ASCIIArtToolProps {
  uiConfig?: UIConfig;
}

type FontStyle = 'banner' | 'block' | 'bubble' | 'digital' | 'graffiti' | 'isometric' | 'larry3d' | 'letters' | 'mini' | 'script' | 'shadow' | 'slant' | 'small' | 'smslant' | 'speed' | 'standard' | 'starwars' | 'straight';

// Simple ASCII art font definitions for common characters
const fonts: Record<FontStyle, Record<string, string[]>> = {
  standard: {
    'A': ['  _   ', ' / \\  ', '/ _ \\ ', '| (_| |', ' \\__,_|'],
    'B': [' ____  ', '| __ ) ', '|  _ \\ ', '| |_) |', '|____/ '],
    'C': ['  ____ ', ' / ___|', '| |    ', '| |___ ', ' \\____|'],
    'D': [' ____  ', '|  _ \\ ', '| | | |', '| |_| |', '|____/ '],
    'E': [' _____ ', '| ____|', '|  _|  ', '| |___ ', '|_____|'],
    'F': [' _____ ', '|  ___|', '| |_   ', '|  _|  ', '|_|    '],
    'G': ['  ____ ', ' / ___|', '| |  _ ', '| |_| |', ' \\____|'],
    'H': [' _   _ ', '| | | |', '| |_| |', '|  _  |', '|_| |_|'],
    'I': [' ___ ', '|_ _|', ' | | ', ' | | ', '|___|'],
    'J': ['     _ ', '    | |', ' _  | |', '| |_| |', ' \\___/ '],
    'K': [' _  __', '| |/ /', '| \' / ', '| . \\ ', '|_|\\_\\'],
    'L': [' _     ', '| |    ', '| |    ', '| |___ ', '|_____|'],
    'M': [' __  __ ', '|  \\/  |', '| |\\/| |', '| |  | |', '|_|  |_|'],
    'N': [' _   _ ', '| \\ | |', '|  \\| |', '| |\\  |', '|_| \\_|'],
    'O': ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ '],
    'P': [' ____  ', '|  _ \\ ', '| |_) |', '|  __/ ', '|_|    '],
    'Q': ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\__\\_\\'],
    'R': [' ____  ', '|  _ \\ ', '| |_) |', '|  _ < ', '|_| \\_\\'],
    'S': [' ____  ', '/ ___| ', '\\___ \\ ', ' ___) |', '|____/ '],
    'T': [' _____ ', '|_   _|', '  | |  ', '  | |  ', '  |_|  '],
    'U': [' _   _ ', '| | | |', '| | | |', '| |_| |', ' \\___/ '],
    'V': [' __   __', ' \\ \\ / /', '  \\ V / ', '   \\ /  ', '    \\_/  '],
    'W': [' __        __', ' \\ \\      / /', '  \\ \\ /\\ / / ', '   \\ V  V /  ', '    \\_/\\_/   '],
    'X': ['__  __', '\\ \\/ /', ' \\  / ', ' /  \\ ', '/_/\\_\\'],
    'Y': [' __   __', ' \\ \\ / /', '  \\ V / ', '   | |  ', '   |_|  '],
    'Z': [' _____', '|__  /', '  / / ', ' / /_ ', '/____|'],
    ' ': ['     ', '     ', '     ', '     ', '     '],
    '0': ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ '],
    '1': [' _ ', '/ |', '| |', '| |', '|_|'],
    '2': [' ____  ', '|___ \\ ', '  __) |', ' / __/ ', '|_____|'],
    '3': [' _____ ', '|___ / ', '  |_ \\ ', ' ___) |', '|____/ '],
    '4': [' _  _   ', '| || |  ', '| || |_ ', '|__   _|', '   |_|  '],
    '5': [' ____  ', '| ___| ', '|___ \\ ', ' ___) |', '|____/ '],
    '6': ['  __   ', ' / /_  ', '| \'_ \\ ', '| (_) |', ' \\___/ '],
    '7': [' _____ ', '|___  |', '   / / ', '  / /  ', ' /_/   '],
    '8': ['  ___  ', ' ( _ ) ', ' / _ \\ ', '| (_) |', ' \\___/ '],
    '9': ['  ___  ', ' / _ \\ ', '| (_) |', ' \\__, |', '   /_/ '],
    '!': [' _ ', '| |', '| |', '|_|', '(_)'],
    '?': [' ___ ', '|__ \\', '  / /', ' |_| ', ' (_) '],
    '.': ['   ', '   ', '   ', ' _ ', '(_)'],
    ',': ['   ', '   ', '   ', ' _ ', '( )'],
  },
  block: {
    'A': ['█████', '█   █', '█████', '█   █', '█   █'],
    'B': ['████ ', '█   █', '████ ', '█   █', '████ '],
    'C': ['█████', '█    ', '█    ', '█    ', '█████'],
    'D': ['████ ', '█   █', '█   █', '█   █', '████ '],
    'E': ['█████', '█    ', '███  ', '█    ', '█████'],
    'F': ['█████', '█    ', '███  ', '█    ', '█    '],
    'G': ['█████', '█    ', '█ ███', '█   █', '█████'],
    'H': ['█   █', '█   █', '█████', '█   █', '█   █'],
    'I': ['█████', '  █  ', '  █  ', '  █  ', '█████'],
    'J': ['█████', '   █ ', '   █ ', '█  █ ', ' ██  '],
    'K': ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
    'L': ['█    ', '█    ', '█    ', '█    ', '█████'],
    'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    'O': ['█████', '█   █', '█   █', '█   █', '█████'],
    'P': ['████ ', '█   █', '████ ', '█    ', '█    '],
    'Q': ['█████', '█   █', '█   █', '█  █ ', '███ █'],
    'R': ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
    'S': ['█████', '█    ', '█████', '    █', '█████'],
    'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    'U': ['█   █', '█   █', '█   █', '█   █', '█████'],
    'V': ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    'W': ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    'X': ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    'Y': ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    'Z': ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    ' ': ['     ', '     ', '     ', '     ', '     '],
    '0': ['█████', '█   █', '█   █', '█   █', '█████'],
    '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
    '2': ['█████', '    █', '█████', '█    ', '█████'],
    '3': ['█████', '    █', '█████', '    █', '█████'],
    '4': ['█   █', '█   █', '█████', '    █', '    █'],
    '5': ['█████', '█    ', '█████', '    █', '█████'],
    '6': ['█████', '█    ', '█████', '█   █', '█████'],
    '7': ['█████', '    █', '   █ ', '  █  ', ' █   '],
    '8': ['█████', '█   █', '█████', '█   █', '█████'],
    '9': ['█████', '█   █', '█████', '    █', '█████'],
    '!': ['  █  ', '  █  ', '  █  ', '     ', '  █  '],
    '?': ['█████', '    █', '  ██ ', '     ', '  █  '],
    '.': ['     ', '     ', '     ', '     ', '  █  '],
    ',': ['     ', '     ', '     ', '  █  ', ' █   '],
  },
  bubble: {
    'A': ['  _  ', ' / \\ ', '( o )', ' \\_/ ', '     '],
    'B': [' ___ ', '| o )', '| o<)', '|___)', '     '],
    'C': [' ___ ', '(   )', '(   )', ' \\_/ ', '     '],
    'D': [' ___ ', '| o )', '| o )', '|___)', '     '],
    'E': [' ___ ', '| __)', '| __)' ,'| __)', '     '],
    'F': [' ___ ', '| __)', '| __)', '|    ', '     '],
    'G': [' ___ ', '( __)', '( o )', ' \\_/ ', '     '],
    'H': [' _ _ ', '| | |', '|   |', '|_|_|', '     '],
    'I': [' ___ ', '(   )', '  |  ', ' (_) ', '     '],
    'J': ['   _ ', '  ( )', '  | |', ' (_) ', '     '],
    'K': [' _ _ ', '| | )', '|  < ', '|_|\\ ', '     '],
    'L': [' _   ', '| |  ', '| |  ', '|___)', '     '],
    'M': [' _   _ ', '|\\_/| ', '|   | ', '|   | ', '       '],
    'N': [' _   _ ', '| \\_| ', '|  \\| ', '|_|  | ', '       '],
    'O': [' ___ ', '( o )', '( o )', ' \\_/ ', '     '],
    'P': [' ___ ', '| o )', '|___)', '|    ', '     '],
    'Q': [' ___ ', '( o )', '( o )', ' \\__)' , '     '],
    'R': [' ___ ', '| o )', '|__ )', '| \\ )', '     '],
    'S': [' ___ ', '( __)', '\\__ \\', '___) ', '     '],
    'T': [' ___ ', '(_|_)', '  |  ', '  |  ', '     '],
    'U': [' _ _ ', '| | |', '| | |', ' \\_/ ', '     '],
    'V': [' _ _ ', '| | |', '\\ V /', ' \\_/ ', '     '],
    'W': [' _   _ ', '| | | |', '| | | |', ' \\_v_/ ', '       '],
    'X': [' _ _ ', '\\ V /', ' > < ', '/_^_\\', '     '],
    'Y': [' _ _ ', '\\ V /', ' | | ', ' |_| ', '     '],
    'Z': [' ___ ', '(__  )', ' / / ', '(___)', '     '],
    ' ': ['     ', '     ', '     ', '     ', '     '],
  },
  mini: {
    'A': [' _ ', '|_|', '| |'],
    'B': [' _ ', '|_)', '|_)'],
    'C': [' _ ', '|  ', '|_ '],
    'D': [' _ ', '| )', '|_)'],
    'E': [' _ ', '|_ ', '|_ '],
    'F': [' _ ', '|_ ', '|  '],
    'G': [' _ ', '|  ', '|_)'],
    'H': ['   ', '|_|', '| |'],
    'I': [' . ', ' | ', ' | '],
    'J': ['  .', '  |', '|_|'],
    'K': ['   ', '|/ ', '|\\ '],
    'L': ['   ', '|  ', '|_ '],
    'M': ['   ', '|V|', '| |'],
    'N': ['   ', '|\\ ', '| |'],
    'O': [' _ ', '| |', '|_|'],
    'P': [' _ ', '|_)', '|  '],
    'Q': [' _ ', '| |', ' \\|'],
    'R': [' _ ', '|_)', '| \\'],
    'S': [' _ ', '|_ ', ' _)'],
    'T': ['___', ' | ', ' | '],
    'U': ['   ', '| |', '|_|'],
    'V': ['   ', '| |', ' V '],
    'W': ['   ', '| |', '|^|'],
    'X': ['   ', ' X ', 'X X'],
    'Y': ['   ', '\\|/', ' | '],
    'Z': ['___', ' / ', '/__'],
    ' ': ['   ', '   ', '   '],
    '0': [' _ ', '| |', '|_|'],
    '1': ['   ', ' | ', ' | '],
    '2': [' _ ', ' _)', '|_ '],
    '3': [' _ ', ' _)', ' _)'],
    '4': ['   ', '|_|', '  |'],
    '5': [' _ ', '|_ ', ' _)'],
    '6': [' _ ', '|_ ', '|_)'],
    '7': ['__ ', ' / ', '/  '],
    '8': [' _ ', '|_|', '|_|'],
    '9': [' _ ', '|_|', ' _|'],
  },
  shadow: {
    'A': ['   _   ', '  /_\\  ', ' / _ \\ ', '/_/ \\_\\', '       '],
    'B': [' ___  ', '| _ ) ', '| _ \\ ', '|___/ ', '      '],
    'C': ['  ___ ', ' / __|', '| (__ ', ' \\___|', '      '],
    'D': [' ___  ', '|   \\ ', '| |) |', '|___/ ', '      '],
    'E': [' ___ ', '| __|', '| _| ', '|___|', '     '],
    'F': [' ___ ', '| __|', '| _| ', '|_|  ', '     '],
    'G': ['  ___ ', ' / __|', '| (_ |', ' \\___|', '      '],
    'H': [' _  _ ', '| || |', '| __ |', '|_||_|', '      '],
    'I': [' ___ ', '|_ _|', ' | | ', '|___|', '     '],
    'J': ['   _ ', ' _ | |', '| || |', ' \\__/ ', '      '],
    'K': [' _  __', '| |/ /', '| \' < ', '|_|\\_\\', '      '],
    'L': [' _    ', '| |   ', '| |__ ', '|____|', '      '],
    'M': [' __  __ ', '|  \\/  |', '| |\\/| |', '|_|  |_|', '        '],
    'N': [' _  _ ', '| \\| |', '| .` |', '|_|\\_|', '      '],
    'O': ['  ___  ', ' / _ \\ ', '| (_) |', ' \\___/ ', '       '],
    'P': [' ___  ', '| _ \\ ', '|  _/ ', '|_|   ', '      '],
    'Q': ['  ___  ', ' / _ \\ ', '| (_) |', ' \\__\\_\\', '       '],
    'R': [' ___  ', '| _ \\ ', '|   / ', '|_|_\\ ', '      '],
    'S': [' ___ ', '/ __|', '\\__ \\', '|___/', '     '],
    'T': [' _____ ', '|_   _|', '  | |  ', '  |_|  ', '       '],
    'U': [' _   _ ', '| | | |', '| |_| |', ' \\___/ ', '       '],
    'V': ['__   __', '\\ \\ / /', ' \\ V / ', '  \\_/  ', '       '],
    'W': ['__      __', '\\ \\    / /', ' \\ \\/\\/ / ', '  \\_/\\_/  ', '          '],
    'X': ['__  __', '\\ \\/ /', ' >  < ', '/_/\\_\\', '      '],
    'Y': ['__   __', '\\ \\ / /', ' \\ V / ', '  |_|  ', '       '],
    'Z': [' _____', '|__  /', '  / / ', ' /___/', '      '],
    ' ': ['     ', '     ', '     ', '     ', '     '],
  },
  slant: {
    'A': ['    ___ ', '   /   |', '  / /| |', ' / ___ |', '/_/  |_|'],
    'B': ['   ____ ', '  / __ )', ' / __  |', '/ /_/ / ', '\\____/  '],
    'C': ['  ______', ' / ____/', '/ /     ', '\\__/    ', '        '],
    'D': ['   ____ ', '  / __ \\', ' / / / /', '/ /_/ / ', '\\____/  '],
    'E': ['   ____', '  / __/', ' / _/  ', '/___/  ', '       '],
    'F': ['   ____', '  / __/', ' / /_  ', '/__/   ', '       '],
    'G': ['  ______', ' / ____/', '/ / __  ', '\\/ /_/ /', ' \\____/ '],
    'H': ['   __  __', '  / / / /', ' / /_/ / ', '/ __  /  ', '/_/ /_/  '],
    'I': ['   ____', '  /  _/', ' _/ /  ', '/___/  ', '       '],
    'J': ['       __', '      / /', '  __ / / ', ' / // /  ', ' \\___/   '],
    'K': ['   __ __', '  / // /', ' / , <  ', '/_/|_|  ', '        '],
    'L': ['   __ ', '  / / ', ' / /  ', '/___/ ', '      '],
    'M': ['   __  ___', '  /  |/  /', ' / /|_/ / ', '/_/  /_/  ', '          '],
    'N': ['   _  __', '  / |/ /', ' /    / ', '/_/|_/  ', '        '],
    'O': ['  ____  ', ' / __ \\ ', '/ /_/ / ', '\\____/  ', '        '],
    'P': ['   ____ ', '  / __ \\', ' / /_/ /', '/ .___/ ', '/_/     '],
    'Q': ['  ____ ', ' / __ \\', '/ /_/ /', '\\___\\_\\', '        '],
    'R': ['   ____ ', '  / __ \\', ' / /_/ /', '/ _, _/ ', '/_/ |_| '],
    'S': ['   ____', '  / __/', ' _\\ \\  ', '/___/  ', '       '],
    'T': ['  ______', ' /_  __/', '  / /   ', ' /_/    ', '        '],
    'U': ['  __  __', ' / / / /', '/ /_/ / ', '\\____/  ', '        '],
    'V': ['  _    __', ' | |  / /', ' | | / / ', ' |_|/_/  ', '         '],
    'W': ['  _       __', ' | |     / /', ' | | /| / / ', ' |__/|__/   ', '            '],
    'X': ['   _  __', '  | |/ /', '  >  <  ', ' /_/\\_\\ ', '        '],
    'Y': ['  __  __', ' / / / /', '/ /_/ / ', '\\__, /  ', '/____/  '],
    'Z': ['  _____', ' /__  /', '  / /  ', ' / /__ ', '/____/ '],
    ' ': ['      ', '      ', '      ', '      ', '      '],
  },
  banner: {}, digital: {}, graffiti: {}, isometric: {}, larry3d: {}, letters: {}, script: {}, small: {}, smslant: {}, speed: {}, starwars: {}, straight: {},
};

// Use standard font as fallback for missing characters
const defaultFont = fonts.standard;

export const ASCIIArtTool = ({ uiConfig }: ASCIIArtToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontStyle, setFontStyle] = useState<FontStyle>('block');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.sourceText || '';
      if (textContent) {
        setInput(textContent.substring(0, 20)); // Limit for ASCII art
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    generateASCII(input);
  }, [input, fontStyle]);

  const generateASCII = (text: string) => {
    if (!text.trim()) {
      setOutput('');
      return;
    }

    const font = fonts[fontStyle] && Object.keys(fonts[fontStyle]).length > 0
      ? fonts[fontStyle]
      : defaultFont;

    const chars = text.toUpperCase().split('');
    const lineCount = font['A']?.length || 5;
    const lines: string[] = Array(lineCount).fill('');

    chars.forEach(char => {
      const charArt = font[char] || font[' '] || Array(lineCount).fill('     ');
      charArt.forEach((line, i) => {
        lines[i] += line;
      });
    });

    setOutput(lines.join('\n'));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setIsPrefilled(false);
  };

  const availableFonts: { value: FontStyle; label: string }[] = [
    { value: 'block', label: 'Block' },
    { value: 'standard', label: 'Standard' },
    { value: 'mini', label: 'Mini' },
    { value: 'bubble', label: 'Bubble' },
    { value: 'shadow', label: 'Shadow' },
    { value: 'slant', label: 'Slant' },
  ];

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.aSCIIArt.asciiArtGenerator', 'ASCII Art Generator')}
      </h2>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.aSCIIArt.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Font Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.aSCIIArt.fontStyle', 'Font Style')}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableFonts.map((font) => (
              <button
                key={font.value}
                onClick={() => setFontStyle(font.value)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  fontStyle === font.value
                    ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                    : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.aSCIIArt.enterTextMax20Characters', 'Enter Text (max 20 characters)')}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.substring(0, 20))}
              placeholder={t('tools.aSCIIArt.typeYourTextHere', 'Type your text here...')}
              maxLength={20}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <button
              onClick={handleClear}
              className={`px-4 py-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {input.length}/20 characters
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.aSCIIArt.asciiArtOutput', 'ASCII Art Output')}
            </label>
            {output && (
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
                {copied ? t('tools.aSCIIArt.copied', 'Copied!') : t('tools.aSCIIArt.copy', 'Copy')}
              </button>
            )}
          </div>
          <div
            className={`w-full min-h-[200px] px-4 py-3 rounded-lg border overflow-x-auto ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-600 text-green-400'
                : 'bg-gray-900 border-gray-300 text-green-400'
            }`}
          >
            <pre className="font-mono text-sm leading-tight whitespace-pre">
              {output || <span className="text-gray-500">{t('tools.aSCIIArt.yourAsciiArtWillAppear', 'Your ASCII art will appear here...')}</span>}
            </pre>
          </div>
        </div>

        {/* Quick Examples */}
        <div>
          <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.aSCIIArt.quickExamples', 'Quick Examples')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {['HELLO', 'WORLD', 'CODE', 'HI', 'YES', 'COOL'].map((text) => (
              <button
                key={text}
                onClick={() => {
                  setInput(text);
                  setIsPrefilled(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.aSCIIArt.aboutAsciiArt', 'About ASCII Art')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            ASCII art is a graphic design technique that uses printable characters from the ASCII standard to create
            images and text. It was popular in early computing when graphics capabilities were limited. Today, ASCII
            art is used for decorative text, signatures, and nostalgic aesthetics in terminals and text-based
            environments.
          </p>
        </div>
      </div>
    </div>
  );
};
