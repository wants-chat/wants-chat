import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gem, Calendar, Copy, Check, Sparkles, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BirthstoneData {
  name: string;
  color: string;
  colorHex: string;
  meaning: string;
  symbolism: string[];
  alternatives: string[];
  origin: string;
}

type Month =
  | 'january' | 'february' | 'march' | 'april'
  | 'may' | 'june' | 'july' | 'august'
  | 'september' | 'october' | 'november' | 'december';

const monthNames: { key: Month; label: string; short: string }[] = [
  { key: 'january', label: 'January', short: 'Jan' },
  { key: 'february', label: 'February', short: 'Feb' },
  { key: 'march', label: 'March', short: 'Mar' },
  { key: 'april', label: 'April', short: 'Apr' },
  { key: 'may', label: 'May', short: 'May' },
  { key: 'june', label: 'June', short: 'Jun' },
  { key: 'july', label: 'July', short: 'Jul' },
  { key: 'august', label: 'August', short: 'Aug' },
  { key: 'september', label: 'September', short: 'Sep' },
  { key: 'october', label: 'October', short: 'Oct' },
  { key: 'november', label: 'November', short: 'Nov' },
  { key: 'december', label: 'December', short: 'Dec' },
];

const birthstones: Record<Month, BirthstoneData> = {
  january: {
    name: 'Garnet',
    color: 'Deep Red',
    colorHex: '#7B1818',
    meaning: 'Protection and friendship',
    symbolism: ['Trust', 'Friendship', 'Protection', 'Vitality'],
    alternatives: ['Rose Quartz'],
    origin: 'Found in Africa, India, Russia, and South America',
  },
  february: {
    name: 'Amethyst',
    color: 'Purple',
    colorHex: '#9966CC',
    meaning: 'Wisdom and clarity',
    symbolism: ['Peace', 'Courage', 'Stability', 'Inner Strength'],
    alternatives: ['Onyx', 'Moonstone'],
    origin: 'Found in Brazil, Uruguay, Zambia, and Russia',
  },
  march: {
    name: 'Aquamarine',
    color: 'Light Blue',
    colorHex: '#7FFFD4',
    meaning: 'Serenity and courage',
    symbolism: ['Youth', 'Health', 'Hope', 'Fidelity'],
    alternatives: ['Bloodstone', 'Jasper'],
    origin: 'Found in Brazil, Nigeria, Madagascar, and Pakistan',
  },
  april: {
    name: 'Diamond',
    color: 'Clear/White',
    colorHex: '#B9F2FF',
    meaning: 'Eternal love and strength',
    symbolism: ['Purity', 'Innocence', 'Eternity', 'Courage'],
    alternatives: ['White Topaz', 'Quartz Crystal'],
    origin: 'Found in Russia, Botswana, Canada, and Australia',
  },
  may: {
    name: 'Emerald',
    color: 'Green',
    colorHex: '#50C878',
    meaning: 'Rebirth and love',
    symbolism: ['Fertility', 'Rebirth', 'Love', 'Wisdom'],
    alternatives: ['Chrysoprase', 'Green Tourmaline'],
    origin: 'Found in Colombia, Brazil, Zambia, and Zimbabwe',
  },
  june: {
    name: 'Pearl',
    color: 'White/Cream',
    colorHex: '#FDEEF4',
    meaning: 'Purity and innocence',
    symbolism: ['Purity', 'Integrity', 'Loyalty', 'Wisdom'],
    alternatives: ['Alexandrite', 'Moonstone'],
    origin: 'Found in Japan, China, Australia, and Tahiti',
  },
  july: {
    name: 'Ruby',
    color: 'Red',
    colorHex: '#E0115F',
    meaning: 'Passion and prosperity',
    symbolism: ['Love', 'Passion', 'Energy', 'Power'],
    alternatives: ['Carnelian', 'Onyx'],
    origin: 'Found in Myanmar, Thailand, Sri Lanka, and Tanzania',
  },
  august: {
    name: 'Peridot',
    color: 'Light Green',
    colorHex: '#ADFF2F',
    meaning: 'Strength and healing',
    symbolism: ['Strength', 'Balance', 'Healing', 'Protection'],
    alternatives: ['Sardonyx', 'Spinel'],
    origin: 'Found in Egypt, Myanmar, Pakistan, and Arizona (USA)',
  },
  september: {
    name: 'Sapphire',
    color: 'Blue',
    colorHex: '#0F52BA',
    meaning: 'Wisdom and royalty',
    symbolism: ['Truth', 'Sincerity', 'Nobility', 'Faithfulness'],
    alternatives: ['Lapis Lazuli', 'Blue Spinel'],
    origin: 'Found in Kashmir, Myanmar, Sri Lanka, and Madagascar',
  },
  october: {
    name: 'Opal',
    color: 'Multicolor/Iridescent',
    colorHex: '#A8C3BC',
    meaning: 'Hope and creativity',
    symbolism: ['Creativity', 'Inspiration', 'Imagination', 'Hope'],
    alternatives: ['Tourmaline', 'Pink Sapphire'],
    origin: 'Found in Australia, Ethiopia, Mexico, and Brazil',
  },
  november: {
    name: 'Topaz',
    color: 'Yellow/Orange',
    colorHex: '#FFC87C',
    meaning: 'Joy and abundance',
    symbolism: ['Strength', 'Intelligence', 'Courage', 'Generosity'],
    alternatives: ['Citrine', 'Golden Beryl'],
    origin: 'Found in Brazil, Sri Lanka, Nigeria, and Russia',
  },
  december: {
    name: 'Turquoise',
    color: 'Blue-Green',
    colorHex: '#40E0D0',
    meaning: 'Protection and luck',
    symbolism: ['Luck', 'Success', 'Protection', 'Tranquility'],
    alternatives: ['Tanzanite', 'Blue Zircon', 'Lapis Lazuli'],
    origin: 'Found in Iran, USA (Arizona), China, and Egypt',
  },
};

interface BirthstoneFinderToolProps {
  uiConfig?: UIConfig;
}

export const BirthstoneFinderTool: React.FC<BirthstoneFinderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentMonth = new Date().getMonth();
  const defaultMonth = monthNames[currentMonth].key;

  const [selectedMonth, setSelectedMonth] = useState<Month>(defaultMonth);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        month?: string;
      };
      if (params.month && monthNames.some(m => m.key === params.month)) {
        setSelectedMonth(params.month as Month);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const stone = birthstones[selectedMonth];
  const monthLabel = monthNames.find(m => m.key === selectedMonth)?.label || '';

  const copyToClipboard = () => {
    const info = `${monthLabel} Birthstone: ${stone.name}
Color: ${stone.color}
Meaning: ${stone.meaning}
Symbolism: ${stone.symbolism.join(', ')}
Alternative Stones: ${stone.alternatives.join(', ')}
Origin: ${stone.origin}`;

    navigator.clipboard.writeText(info).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Gem className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birthstoneFinder.birthstoneFinder', 'Birthstone Finder')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.birthstoneFinder.discoverTheGemstoneForYour', 'Discover the gemstone for your birth month')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.birthstoneFinder.monthLoadedFromYourConversation', 'Month loaded from your conversation')}</span>
          </div>
        )}

        {/* Month Selector - Calendar Grid */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calendar className="w-4 h-4 inline mr-2" />
            {t('tools.birthstoneFinder.selectYourBirthMonth', 'Select Your Birth Month')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {monthNames.map((month) => (
              <button
                key={month.key}
                onClick={() => setSelectedMonth(month.key)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedMonth === month.key
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month.short}
              </button>
            ))}
          </div>
        </div>

        {/* Birthstone Display Card */}
        <div
          className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${stone.colorHex}15 0%, transparent 50%), linear-gradient(to bottom right, #1f2937, #111827)`
              : `linear-gradient(135deg, ${stone.colorHex}20 0%, transparent 50%), linear-gradient(to bottom right, #f9fafb, #f3f4f6)`,
          }}
        >
          {/* Decorative gemstone shape */}
          <div
            className="absolute top-4 right-4 w-24 h-24 opacity-20"
            style={{
              background: `linear-gradient(135deg, ${stone.colorHex}, ${stone.colorHex}80)`,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
          />

          <div className="relative z-10">
            {/* Stone Name & Month */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{monthLabel}</p>
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stone.name}
                </h2>
              </div>
              <div
                className="w-12 h-12 rounded-xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${stone.colorHex}, ${stone.colorHex}CC)`,
                  boxShadow: `0 4px 14px ${stone.colorHex}40`,
                }}
              />
            </div>

            {/* Color */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-4 h-4 rounded-full border-2 border-white/20"
                style={{ backgroundColor: stone.colorHex }}
              />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {stone.color}
              </span>
            </div>

            {/* Meaning */}
            <div className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.birthstoneFinder.meaning', 'Meaning')}
                </span>
              </div>
              <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stone.meaning}
              </p>
            </div>

            {/* Symbolism */}
            <div className="mb-4">
              <span className={`text-sm font-medium block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.birthstoneFinder.symbolism', 'Symbolism')}
              </span>
              <div className="flex flex-wrap gap-2">
                {stone.symbolism.map((symbol, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-white text-gray-700 shadow-sm'
                    }`}
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </div>

            {/* Origin */}
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="font-medium">{t('tools.birthstoneFinder.origin', 'Origin:')}</span> {stone.origin}
            </div>
          </div>
        </div>

        {/* Alternative Birthstones */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Alternative Birthstones for {monthLabel}
          </h4>
          <div className="flex flex-wrap gap-2">
            {stone.alternatives.map((alt, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isDark
                    ? 'bg-gray-800 text-purple-300 border border-purple-700'
                    : 'bg-white text-purple-700 border border-purple-200'
                }`}
              >
                {alt}
              </span>
            ))}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            copied
              ? 'bg-green-500 text-white'
              : isDark
              ? 'bg-purple-600 hover:bg-purple-500 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              {t('tools.birthstoneFinder.copiedToClipboard', 'Copied to Clipboard!')}
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              {t('tools.birthstoneFinder.copyBirthstoneInfo', 'Copy Birthstone Info')}
            </>
          )}
        </button>

        {/* Fun Facts */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.birthstoneFinder.didYouKnow', 'Did you know?')}</strong>
              <p className="mt-1">
                Birthstones date back to ancient times and were believed to bring good luck and protection
                to those who wore the stone associated with their birth month. The modern birthstone list
                was established by the American National Retail Jewelers Association in 1912.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthstoneFinderTool;
