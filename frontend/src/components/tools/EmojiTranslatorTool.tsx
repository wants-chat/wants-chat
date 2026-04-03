import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Sparkles, RotateCcw, Shuffle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface EmojiTranslatorToolProps {
  uiConfig?: UIConfig;
}

// Word to emoji mapping
const wordToEmoji: Record<string, string> = {
  // Emotions & Expressions
  'happy': '\u{1F60A}', 'sad': '\u{1F622}', 'love': '\u{2764}\u{FE0F}', 'heart': '\u{2764}\u{FE0F}',
  'laugh': '\u{1F602}', 'cry': '\u{1F622}', 'angry': '\u{1F620}', 'mad': '\u{1F620}',
  'cool': '\u{1F60E}', 'wink': '\u{1F609}', 'smile': '\u{1F642}', 'grin': '\u{1F601}',
  'think': '\u{1F914}', 'thinking': '\u{1F914}', 'wow': '\u{1F62E}', 'surprised': '\u{1F62E}',
  'scared': '\u{1F628}', 'fear': '\u{1F628}', 'sick': '\u{1F912}', 'sleep': '\u{1F634}',
  'sleepy': '\u{1F634}', 'tired': '\u{1F634}', 'kiss': '\u{1F48B}', 'hug': '\u{1F917}',

  // People & Body
  'person': '\u{1F9D1}', 'man': '\u{1F468}', 'woman': '\u{1F469}', 'boy': '\u{1F466}',
  'girl': '\u{1F467}', 'baby': '\u{1F476}', 'family': '\u{1F46A}', 'couple': '\u{1F491}',
  'hand': '\u{270B}', 'hands': '\u{1F64C}', 'clap': '\u{1F44F}', 'wave': '\u{1F44B}',
  'thumbs': '\u{1F44D}', 'ok': '\u{1F44C}', 'point': '\u{1F446}', 'fist': '\u{270A}',
  'muscle': '\u{1F4AA}', 'strong': '\u{1F4AA}', 'brain': '\u{1F9E0}', 'eyes': '\u{1F440}',
  'eye': '\u{1F441}\u{FE0F}', 'ear': '\u{1F442}', 'nose': '\u{1F443}', 'tongue': '\u{1F445}',

  // Animals
  'dog': '\u{1F436}', 'cat': '\u{1F431}', 'mouse': '\u{1F42D}', 'rabbit': '\u{1F430}',
  'fox': '\u{1F98A}', 'bear': '\u{1F43B}', 'panda': '\u{1F43C}', 'koala': '\u{1F428}',
  'tiger': '\u{1F42F}', 'lion': '\u{1F981}', 'cow': '\u{1F404}', 'pig': '\u{1F437}',
  'frog': '\u{1F438}', 'monkey': '\u{1F435}', 'chicken': '\u{1F414}', 'bird': '\u{1F426}',
  'penguin': '\u{1F427}', 'fish': '\u{1F41F}', 'whale': '\u{1F433}', 'dolphin': '\u{1F42C}',
  'shark': '\u{1F988}', 'octopus': '\u{1F419}', 'snail': '\u{1F40C}', 'butterfly': '\u{1F98B}',
  'bee': '\u{1F41D}', 'bug': '\u{1F41B}', 'ant': '\u{1F41C}', 'spider': '\u{1F577}\u{FE0F}',
  'snake': '\u{1F40D}', 'turtle': '\u{1F422}', 'unicorn': '\u{1F984}', 'dragon': '\u{1F409}',

  // Food & Drink
  'food': '\u{1F35D}', 'eat': '\u{1F37D}\u{FE0F}', 'hungry': '\u{1F37D}\u{FE0F}', 'apple': '\u{1F34E}',
  'banana': '\u{1F34C}', 'orange': '\u{1F34A}', 'lemon': '\u{1F34B}', 'grape': '\u{1F347}',
  'watermelon': '\u{1F349}', 'strawberry': '\u{1F353}', 'cherry': '\u{1F352}', 'peach': '\u{1F351}',
  'pizza': '\u{1F355}', 'burger': '\u{1F354}', 'fries': '\u{1F35F}', 'hotdog': '\u{1F32D}',
  'taco': '\u{1F32E}', 'burrito': '\u{1F32F}', 'sushi': '\u{1F363}', 'ramen': '\u{1F35C}',
  'bread': '\u{1F35E}', 'cheese': '\u{1F9C0}', 'egg': '\u{1F95A}', 'meat': '\u{1F356}',
  'poultry': '\u{1F357}', 'cake': '\u{1F370}', 'cookie': '\u{1F36A}', 'donut': '\u{1F369}',
  'ice': '\u{1F368}', 'icecream': '\u{1F368}', 'chocolate': '\u{1F36B}', 'candy': '\u{1F36C}',
  'coffee': '\u{2615}', 'tea': '\u{1F375}', 'beer': '\u{1F37A}', 'wine': '\u{1F377}',
  'water': '\u{1F4A7}', 'drink': '\u{1F379}', 'juice': '\u{1F9C3}', 'milk': '\u{1F95B}',

  // Nature & Weather
  'sun': '\u{2600}\u{FE0F}', 'sunny': '\u{2600}\u{FE0F}', 'moon': '\u{1F319}', 'star': '\u{2B50}',
  'stars': '\u{2728}', 'cloud': '\u{2601}\u{FE0F}', 'cloudy': '\u{2601}\u{FE0F}', 'rain': '\u{1F327}\u{FE0F}',
  'rainy': '\u{1F327}\u{FE0F}', 'snow': '\u{2744}\u{FE0F}', 'snowy': '\u{2744}\u{FE0F}', 'thunder': '\u{26A1}',
  'lightning': '\u{26A1}', 'storm': '\u{26C8}\u{FE0F}', 'rainbow': '\u{1F308}', 'fire': '\u{1F525}',
  'hot': '\u{1F525}', 'cold': '\u{1F976}', 'wind': '\u{1F4A8}', 'windy': '\u{1F4A8}',
  'tree': '\u{1F333}', 'trees': '\u{1F332}', 'flower': '\u{1F33B}', 'flowers': '\u{1F490}',
  'rose': '\u{1F339}', 'leaf': '\u{1F343}', 'leaves': '\u{1F342}', 'plant': '\u{1F331}',
  'mountain': '\u{26F0}\u{FE0F}', 'beach': '\u{1F3D6}\u{FE0F}', 'ocean': '\u{1F30A}', 'sea': '\u{1F30A}',
  'waves': '\u{1F30A}', 'earth': '\u{1F30D}', 'world': '\u{1F30D}', 'globe': '\u{1F30D}',

  // Objects & Activities
  'phone': '\u{1F4F1}', 'call': '\u{1F4DE}', 'computer': '\u{1F4BB}', 'laptop': '\u{1F4BB}',
  'keyboard': '\u{2328}\u{FE0F}', 'cursor': '\u{1F5B1}\u{FE0F}', 'camera': '\u{1F4F7}', 'photo': '\u{1F4F8}',
  'video': '\u{1F4F9}', 'movie': '\u{1F3AC}', 'tv': '\u{1F4FA}', 'radio': '\u{1F4FB}',
  'music': '\u{1F3B5}', 'song': '\u{1F3B6}', 'guitar': '\u{1F3B8}', 'piano': '\u{1F3B9}',
  'drum': '\u{1F941}', 'microphone': '\u{1F3A4}', 'headphones': '\u{1F3A7}', 'speaker': '\u{1F50A}',
  'book': '\u{1F4D6}', 'books': '\u{1F4DA}', 'read': '\u{1F4D6}', 'write': '\u{270D}\u{FE0F}',
  'pen': '\u{1F58A}\u{FE0F}', 'pencil': '\u{270F}\u{FE0F}', 'paper': '\u{1F4C4}', 'note': '\u{1F4DD}',
  'mail': '\u{1F4E7}', 'email': '\u{1F4E7}', 'letter': '\u{1F48C}', 'package': '\u{1F4E6}',
  'gift': '\u{1F381}', 'present': '\u{1F381}', 'balloon': '\u{1F388}', 'party': '\u{1F389}',
  'celebrate': '\u{1F389}', 'trophy': '\u{1F3C6}', 'medal': '\u{1F3C5}', 'crown': '\u{1F451}',
  'ring': '\u{1F48D}', 'gem': '\u{1F48E}', 'diamond': '\u{1F48E}', 'money': '\u{1F4B0}',
  'dollar': '\u{1F4B5}', 'cash': '\u{1F4B5}', 'card': '\u{1F4B3}', 'key': '\u{1F511}',
  'lock': '\u{1F512}', 'unlock': '\u{1F513}', 'door': '\u{1F6AA}', 'window': '\u{1FA9F}',
  'house': '\u{1F3E0}', 'home': '\u{1F3E0}', 'building': '\u{1F3E2}', 'office': '\u{1F3E2}',
  'school': '\u{1F3EB}', 'hospital': '\u{1F3E5}', 'church': '\u{26EA}', 'castle': '\u{1F3F0}',
  'car': '\u{1F697}', 'bus': '\u{1F68C}', 'train': '\u{1F686}', 'plane': '\u{2708}\u{FE0F}',
  'airplane': '\u{2708}\u{FE0F}', 'fly': '\u{2708}\u{FE0F}', 'rocket': '\u{1F680}', 'ship': '\u{1F6A2}',
  'boat': '\u{26F5}', 'bike': '\u{1F6B2}', 'bicycle': '\u{1F6B2}', 'motorcycle': '\u{1F3CD}\u{FE0F}',
  'run': '\u{1F3C3}', 'walk': '\u{1F6B6}', 'swim': '\u{1F3CA}', 'dance': '\u{1F483}',
  'sport': '\u{26BD}', 'soccer': '\u{26BD}', 'football': '\u{1F3C8}', 'basketball': '\u{1F3C0}',
  'baseball': '\u{26BE}', 'tennis': '\u{1F3BE}', 'golf': '\u{26F3}', 'ski': '\u{26F7}\u{FE0F}',

  // Time & Symbols
  'time': '\u{23F0}', 'clock': '\u{1F570}\u{FE0F}', 'watch': '\u{231A}', 'hour': '\u{1F551}',
  'calendar': '\u{1F4C5}', 'date': '\u{1F4C5}', 'birthday': '\u{1F382}', 'new': '\u{2728}',
  'check': '\u{2705}', 'yes': '\u{2705}', 'no': '\u{274C}', 'stop': '\u{1F6D1}',
  'warning': '\u{26A0}\u{FE0F}', 'danger': '\u{2620}\u{FE0F}', 'question': '\u{2753}', 'exclamation': '\u{2757}',
  'idea': '\u{1F4A1}', 'light': '\u{1F4A1}', 'bulb': '\u{1F4A1}', 'magic': '\u{2728}',
  'sparkle': '\u{2728}', 'boom': '\u{1F4A5}', 'explosion': '\u{1F4A5}', 'power': '\u{26A1}',
  'zzz': '\u{1F4A4}', 'asleep': '\u{1F4A4}', 'poop': '\u{1F4A9}', 'ghost': '\u{1F47B}',
  'alien': '\u{1F47D}', 'robot': '\u{1F916}', 'skull': '\u{1F480}', 'devil': '\u{1F608}',

  // Actions & States
  'good': '\u{1F44D}', 'bad': '\u{1F44E}', 'great': '\u{1F44D}', 'awesome': '\u{1F60E}',
  'amazing': '\u{1F929}', 'perfect': '\u{1F44C}', 'nice': '\u{1F44D}', 'thanks': '\u{1F64F}',
  'thank': '\u{1F64F}', 'please': '\u{1F64F}', 'pray': '\u{1F64F}', 'sorry': '\u{1F625}',
  'hello': '\u{1F44B}', 'hi': '\u{1F44B}', 'hey': '\u{1F44B}', 'bye': '\u{1F44B}',
  'goodbye': '\u{1F44B}', 'welcome': '\u{1F917}', 'congrats': '\u{1F389}', 'congratulations': '\u{1F389}',
  'win': '\u{1F3C6}', 'winner': '\u{1F3C6}', 'lose': '\u{1F61E}', 'loser': '\u{1F61E}',
  'work': '\u{1F4BC}', 'job': '\u{1F4BC}', 'busy': '\u{1F4BC}', 'relax': '\u{1F3D6}\u{FE0F}',
  'vacation': '\u{1F3D6}\u{FE0F}', 'travel': '\u{2708}\u{FE0F}', 'trip': '\u{1F697}',
};

export const EmojiTranslatorTool = ({ uiConfig }: EmojiTranslatorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'append' | 'replace' | 'emojiOnly'>('append');
  const [matchCount, setMatchCount] = useState(0);

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
    translateToEmoji(input);
  }, [input, mode]);

  const translateToEmoji = (text: string) => {
    if (!text.trim()) {
      setOutput('');
      setMatchCount(0);
      return;
    }

    let count = 0;
    const words = text.split(/(\s+)/);

    const translated = words.map(word => {
      if (/^\s+$/.test(word)) return word;

      // Clean word for matching (remove punctuation)
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const emoji = wordToEmoji[cleanWord];

      if (emoji) {
        count++;
        switch (mode) {
          case 'replace':
            return emoji;
          case 'emojiOnly':
            return emoji;
          case 'append':
          default:
            return `${word} ${emoji}`;
        }
      }

      return mode === 'emojiOnly' ? '' : word;
    });

    setMatchCount(count);
    setOutput(mode === 'emojiOnly'
      ? translated.filter(w => w).join(' ')
      : translated.join(''));
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
    setMatchCount(0);
  };

  const insertRandomEmoji = () => {
    const emojis = Object.values(wordToEmoji);
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setInput(prev => prev + ' ' + randomEmoji);
  };

  const examplePhrases = [
    'I love pizza and coffee',
    'Happy birthday party with cake',
    'The sun is shining today',
    'Hello world, nice to meet you',
    'My dog loves to run and play',
    'Time for music and dance',
  ];

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.emojiTranslator.textToEmojiTranslator', 'Text to Emoji Translator')}
      </h2>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.emojiTranslator.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.emojiTranslator.translationMode', 'Translation Mode')}
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'append', label: 'Add Emojis', desc: 'Keep text, add emojis after words' },
              { value: 'replace', label: 'Replace Words', desc: 'Replace matching words with emojis' },
              { value: 'emojiOnly', label: 'Emojis Only', desc: 'Show only the emojis' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMode(option.value as typeof mode)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  mode === option.value
                    ? 'border-[#0D9488] bg-[#0D9488]/10'
                    : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {option.label}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.emojiTranslator.enterText', 'Enter Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.emojiTranslator.typeSomethingLikeILove', 'Type something like \'I love pizza and coffee\' or \'Happy birthday\'...')}
            className={`w-full h-32 px-4 py-3 rounded-lg border ${
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
              Translated Text
              {matchCount > 0 && (
                <span className="ml-2 text-[#0D9488]">({matchCount} words matched)</span>
              )}
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
                {copied ? t('tools.emojiTranslator.copied', 'Copied!') : t('tools.emojiTranslator.copy', 'Copy')}
              </button>
            )}
          </div>
          <div
            className={`w-full min-h-[128px] px-4 py-3 rounded-lg border text-xl leading-relaxed ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          >
            {output || <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{t('tools.emojiTranslator.emojifiedTextWillAppearHere', 'Emojified text will appear here...')}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={insertRandomEmoji}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            {t('tools.emojiTranslator.addRandomEmoji', 'Add Random Emoji')}
          </button>
          <button
            onClick={handleClear}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {t('tools.emojiTranslator.clear', 'Clear')}
          </button>
        </div>

        {/* Example Phrases */}
        <div>
          <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.emojiTranslator.tryThesePhrases', 'Try These Phrases')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {examplePhrases.map((phrase, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(phrase);
                  setIsPrefilled(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Supported Words */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Supported Words ({Object.keys(wordToEmoji).length} words)
          </h3>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {Object.entries(wordToEmoji).slice(0, 60).map(([word, emoji]) => (
              <span
                key={word}
                className={`px-2 py-1 rounded text-xs ${
                  theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-700'
                }`}
              >
                {word} {emoji}
              </span>
            ))}
            <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              ...and {Object.keys(wordToEmoji).length - 60} more
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
