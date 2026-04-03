import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Star, Heart, Hash, Palette, RefreshCw, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface ChineseZodiacToolProps {
  uiConfig?: UIConfig;
}

interface ZodiacAnimal {
  name: string;
  character: string;
  emoji: string;
  years: number[];
  personality: string[];
  compatible: string[];
  incompatible: string[];
  luckyNumbers: number[];
  luckyColors: string[];
  element: string;
  elementColor: string;
  yin_yang: string;
}

interface ZodiacResult {
  animal: ZodiacAnimal;
  element: string;
  elementColor: string;
  heavenlyStem: string;
  yearInCycle: number;
  birthYear: number;
}

const zodiacAnimals: ZodiacAnimal[] = [
  {
    name: 'Rat',
    character: '鼠',
    emoji: '🐀',
    years: [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020, 2032],
    personality: ['Quick-witted', 'Resourceful', 'Versatile', 'Kind', 'Smart', 'Charming'],
    compatible: ['Ox', 'Dragon', 'Monkey'],
    incompatible: ['Horse', 'Goat'],
    luckyNumbers: [2, 3],
    luckyColors: ['Blue', 'Gold', 'Green'],
    element: 'Water',
    elementColor: '#3b82f6',
    yin_yang: 'Yang'
  },
  {
    name: 'Ox',
    character: '牛',
    emoji: '🐂',
    years: [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021, 2033],
    personality: ['Diligent', 'Dependable', 'Strong', 'Determined', 'Honest', 'Patient'],
    compatible: ['Rat', 'Snake', 'Rooster'],
    incompatible: ['Tiger', 'Dragon', 'Horse', 'Goat'],
    luckyNumbers: [1, 4],
    luckyColors: ['White', 'Yellow', 'Green'],
    element: 'Earth',
    elementColor: '#a16207',
    yin_yang: 'Yin'
  },
  {
    name: 'Tiger',
    character: '虎',
    emoji: '🐅',
    years: [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022, 2034],
    personality: ['Brave', 'Confident', 'Competitive', 'Unpredictable', 'Charming', 'Authoritative'],
    compatible: ['Dragon', 'Horse', 'Pig'],
    incompatible: ['Ox', 'Tiger', 'Snake', 'Monkey'],
    luckyNumbers: [1, 3, 4],
    luckyColors: ['Blue', 'Gray', 'Orange'],
    element: 'Wood',
    elementColor: '#22c55e',
    yin_yang: 'Yang'
  },
  {
    name: 'Rabbit',
    character: '兔',
    emoji: '🐇',
    years: [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023, 2035],
    personality: ['Quiet', 'Elegant', 'Kind', 'Responsible', 'Gentle', 'Patient'],
    compatible: ['Goat', 'Monkey', 'Dog', 'Pig'],
    incompatible: ['Snake', 'Rooster'],
    luckyNumbers: [3, 4, 6],
    luckyColors: ['Red', 'Pink', 'Purple', 'Blue'],
    element: 'Wood',
    elementColor: '#22c55e',
    yin_yang: 'Yin'
  },
  {
    name: 'Dragon',
    character: '龙',
    emoji: '🐉',
    years: [1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024, 2036],
    personality: ['Confident', 'Intelligent', 'Enthusiastic', 'Ambitious', 'Courageous', 'Charismatic'],
    compatible: ['Rooster', 'Rat', 'Monkey'],
    incompatible: ['Ox', 'Goat', 'Dog'],
    luckyNumbers: [1, 6, 7],
    luckyColors: ['Gold', 'Silver', 'Gray'],
    element: 'Earth',
    elementColor: '#a16207',
    yin_yang: 'Yang'
  },
  {
    name: 'Snake',
    character: '蛇',
    emoji: '🐍',
    years: [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025, 2037],
    personality: ['Enigmatic', 'Intelligent', 'Wise', 'Graceful', 'Determined', 'Intuitive'],
    compatible: ['Dragon', 'Rooster'],
    incompatible: ['Tiger', 'Rabbit', 'Snake', 'Goat', 'Pig'],
    luckyNumbers: [2, 8, 9],
    luckyColors: ['Black', 'Red', 'Yellow'],
    element: 'Fire',
    elementColor: '#ef4444',
    yin_yang: 'Yin'
  },
  {
    name: 'Horse',
    character: '马',
    emoji: '🐴',
    years: [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026, 2038],
    personality: ['Animated', 'Active', 'Energetic', 'Independent', 'Impatient', 'Warm-hearted'],
    compatible: ['Tiger', 'Goat', 'Rabbit'],
    incompatible: ['Rat', 'Ox', 'Rooster', 'Horse'],
    luckyNumbers: [2, 3, 7],
    luckyColors: ['Yellow', 'Green'],
    element: 'Fire',
    elementColor: '#ef4444',
    yin_yang: 'Yang'
  },
  {
    name: 'Goat',
    character: '羊',
    emoji: '🐐',
    years: [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027, 2039],
    personality: ['Calm', 'Gentle', 'Sympathetic', 'Creative', 'Tasteful', 'Kind'],
    compatible: ['Rabbit', 'Horse', 'Pig'],
    incompatible: ['Ox', 'Tiger', 'Dog'],
    luckyNumbers: [2, 7],
    luckyColors: ['Brown', 'Red', 'Purple'],
    element: 'Earth',
    elementColor: '#a16207',
    yin_yang: 'Yin'
  },
  {
    name: 'Monkey',
    character: '猴',
    emoji: '🐒',
    years: [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028, 2040],
    personality: ['Sharp', 'Smart', 'Curious', 'Mischievous', 'Playful', 'Inventive'],
    compatible: ['Ox', 'Rabbit'],
    incompatible: ['Tiger', 'Pig'],
    luckyNumbers: [4, 9],
    luckyColors: ['White', 'Blue', 'Gold'],
    element: 'Metal',
    elementColor: '#9ca3af',
    yin_yang: 'Yang'
  },
  {
    name: 'Rooster',
    character: '鸡',
    emoji: '🐓',
    years: [1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029, 2041],
    personality: ['Observant', 'Hardworking', 'Courageous', 'Talented', 'Confident', 'Honest'],
    compatible: ['Ox', 'Snake'],
    incompatible: ['Rat', 'Rabbit', 'Horse', 'Rooster', 'Dog'],
    luckyNumbers: [5, 7, 8],
    luckyColors: ['Gold', 'Brown', 'Yellow'],
    element: 'Metal',
    elementColor: '#9ca3af',
    yin_yang: 'Yin'
  },
  {
    name: 'Dog',
    character: '狗',
    emoji: '🐕',
    years: [1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030, 2042],
    personality: ['Loyal', 'Honest', 'Amiable', 'Kind', 'Cautious', 'Prudent'],
    compatible: ['Rabbit'],
    incompatible: ['Dragon', 'Goat', 'Rooster'],
    luckyNumbers: [3, 4, 9],
    luckyColors: ['Red', 'Green', 'Purple'],
    element: 'Earth',
    elementColor: '#a16207',
    yin_yang: 'Yang'
  },
  {
    name: 'Pig',
    character: '猪',
    emoji: '🐷',
    years: [1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031, 2043],
    personality: ['Compassionate', 'Generous', 'Diligent', 'Optimistic', 'Honest', 'Calm'],
    compatible: ['Tiger', 'Rabbit', 'Goat'],
    incompatible: ['Snake', 'Monkey'],
    luckyNumbers: [2, 5, 8],
    luckyColors: ['Yellow', 'Gray', 'Brown', 'Gold'],
    element: 'Water',
    elementColor: '#3b82f6',
    yin_yang: 'Yin'
  }
];

const heavenlyStems = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const elements = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
const elementColors: Record<string, string> = {
  'Wood': '#22c55e',
  'Fire': '#ef4444',
  'Earth': '#a16207',
  'Metal': '#9ca3af',
  'Water': '#3b82f6'
};

export const ChineseZodiacTool: React.FC<ChineseZodiacToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [birthYear, setBirthYear] = useState('');
  const [result, setResult] = useState<ZodiacResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.birthYear) setBirthYear(data.birthYear.toString());
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  const calculateZodiac = () => {
    const year = parseInt(birthYear);

    if (isNaN(year) || year < 1900 || year > 2100) {
      setValidationMessage('Please enter a valid year between 1900 and 2100');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate zodiac animal (12-year cycle starting from 1900 which is Rat)
    const animalIndex = (year - 1900) % 12;
    const animal = zodiacAnimals[animalIndex];

    // Calculate heavenly stem and element (10-year cycle)
    const stemIndex = (year - 4) % 10;
    const heavenlyStem = heavenlyStems[stemIndex];
    const element = elements[stemIndex];

    // Calculate position in 60-year cycle
    const yearInCycle = ((year - 4) % 60) + 1;

    setResult({
      animal,
      element,
      elementColor: elementColors[element],
      heavenlyStem,
      yearInCycle,
      birthYear: year
    });
  };

  const reset = () => {
    setBirthYear('');
    setResult(null);
  };

  const getCurrentYear = () => new Date().getFullYear();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.chineseZodiac.chineseZodiacCalculator', 'Chinese Zodiac Calculator')}
            </h1>
          </div>

          {validationMessage && (
            <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <span className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                {validationMessage}
              </span>
            </div>
          )}

          {isPrefilled && (
            <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className={`text-sm ${theme === 'dark' ? 'text-teal-400' : 'text-teal-700'}`}>
                {t('tools.chineseZodiac.preFilledBasedOnYour', 'Pre-filled based on your request')}
              </span>
            </div>
          )}

          {/* Year Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.chineseZodiac.birthYear', 'Birth Year')}
            </label>
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder={t('tools.chineseZodiac.enterBirthYearEG', 'Enter birth year (e.g., 1990)')}
              min="1900"
              max="2100"
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateZodiac}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              {t('tools.chineseZodiac.findMyZodiac', 'Find My Zodiac')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.chineseZodiac.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Main Animal Display */}
              <div
                className="p-6 rounded-lg text-center"
                style={{
                  backgroundColor: `${result.elementColor}15`,
                  borderLeft: `4px solid ${result.elementColor}`
                }}
              >
                <div className="text-7xl mb-4">{result.animal.emoji}</div>
                <div className="text-4xl font-bold mb-1" style={{ color: result.elementColor }}>
                  {result.animal.name}
                </div>
                <div className={`text-3xl mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {result.animal.character}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Born in {result.birthYear}
                </div>
              </div>

              {/* Element and Cycle Info */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className={`text-xs uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.chineseZodiac.element', 'Element')}
                    </div>
                    <div
                      className="text-xl font-bold"
                      style={{ color: result.elementColor }}
                    >
                      {result.element}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.chineseZodiac.heavenlyStem', 'Heavenly Stem')}
                    </div>
                    <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.heavenlyStem}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.chineseZodiac.yearIn60YearCycle', 'Year in 60-Year Cycle')}
                    </div>
                    <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.yearInCycle} of 60
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.chineseZodiac.yinYang', 'Yin/Yang')}
                    </div>
                    <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {result.animal.yin_yang}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personality Traits */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-[#0D9488]" />
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.chineseZodiac.personalityTraits', 'Personality Traits')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.animal.personality.map((trait, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-[#0D9488]/20 text-[#0D9488]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compatibility */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.chineseZodiac.compatibility', 'Compatibility')}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.chineseZodiac.bestMatches', 'Best matches:')}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {result.animal.compatible.map((sign, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.chineseZodiac.challengingMatches', 'Challenging matches:')}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {result.animal.incompatible.map((sign, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-600 dark:text-red-400"
                        >
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lucky Numbers and Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-5 h-5 text-purple-500" />
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.chineseZodiac.luckyNumbers', 'Lucky Numbers')}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.animal.luckyNumbers.map((num, index) => (
                      <span
                        key={index}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-5 h-5 text-orange-500" />
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.chineseZodiac.luckyColors', 'Lucky Colors')}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.animal.luckyColors.map((color, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Year Cycle Info */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent & Upcoming {result.animal.name} Years
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.animal.years
                    .filter(y => y >= getCurrentYear() - 36 && y <= getCurrentYear() + 24)
                    .map((year, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          year === result.birthYear
                            ? 'bg-[#0D9488] text-white'
                            : year === getCurrentYear()
                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
                            : theme === 'dark'
                            ? 'bg-gray-600 text-gray-200'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {year}
                        {year === getCurrentYear() && ' (Current)'}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-full mt-6 flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.chineseZodiac.aboutChineseZodiac', 'About Chinese Zodiac')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showInfo ? '-' : '+'}
            </span>
          </button>

          {showInfo && (
            <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  The Chinese zodiac is a repeating 12-year cycle, with each year represented by an animal and its attributes.
                  The 12 animals are: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, and Pig.
                </p>
                <p>
                  <strong>{t('tools.chineseZodiac.fiveElements', 'Five Elements:')}</strong> Each year is also associated with one of five elements - Wood, Fire, Earth, Metal, and Water.
                  This creates a 60-year cycle (12 animals x 5 elements).
                </p>
                <p>
                  <strong>{t('tools.chineseZodiac.heavenlyStems', 'Heavenly Stems:')}</strong> The ten heavenly stems (Tiangan) combine with the 12 earthly branches (the animals)
                  to form the traditional Chinese 60-year calendar cycle.
                </p>
                <p className="text-xs mt-3">
                  Note: The Chinese New Year falls between late January and mid-February. If you were born in January or early February,
                  you may belong to the previous year's zodiac sign.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default ChineseZodiacTool;
