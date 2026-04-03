import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Moon, Sun, Heart, Briefcase, Sparkles, Calendar, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface ZodiacSign {
  name: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  dateRange: string;
  rulingPlanet: string;
}

interface Horoscope {
  general: string;
  love: string;
  career: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  mood: string;
  compatibility: string;
}

const zodiacSigns: ZodiacSign[] = [
  { name: 'Aries', symbol: '♈', element: 'fire', dateRange: 'Mar 21 - Apr 19', rulingPlanet: 'Mars' },
  { name: 'Taurus', symbol: '♉', element: 'earth', dateRange: 'Apr 20 - May 20', rulingPlanet: 'Venus' },
  { name: 'Gemini', symbol: '♊', element: 'air', dateRange: 'May 21 - Jun 20', rulingPlanet: 'Mercury' },
  { name: 'Cancer', symbol: '♋', element: 'water', dateRange: 'Jun 21 - Jul 22', rulingPlanet: 'Moon' },
  { name: 'Leo', symbol: '♌', element: 'fire', dateRange: 'Jul 23 - Aug 22', rulingPlanet: 'Sun' },
  { name: 'Virgo', symbol: '♍', element: 'earth', dateRange: 'Aug 23 - Sep 22', rulingPlanet: 'Mercury' },
  { name: 'Libra', symbol: '♎', element: 'air', dateRange: 'Sep 23 - Oct 22', rulingPlanet: 'Venus' },
  { name: 'Scorpio', symbol: '♏', element: 'water', dateRange: 'Oct 23 - Nov 21', rulingPlanet: 'Pluto' },
  { name: 'Sagittarius', symbol: '♐', element: 'fire', dateRange: 'Nov 22 - Dec 21', rulingPlanet: 'Jupiter' },
  { name: 'Capricorn', symbol: '♑', element: 'earth', dateRange: 'Dec 22 - Jan 19', rulingPlanet: 'Saturn' },
  { name: 'Aquarius', symbol: '♒', element: 'air', dateRange: 'Jan 20 - Feb 18', rulingPlanet: 'Uranus' },
  { name: 'Pisces', symbol: '♓', element: 'water', dateRange: 'Feb 19 - Mar 20', rulingPlanet: 'Neptune' },
];

const horoscopeTemplates = {
  general: [
    "Today brings a surge of creative energy. Use it to tackle projects you've been putting off.",
    "The stars align in your favor today. Trust your instincts and take calculated risks.",
    "A period of reflection awaits. Take time to reassess your goals and priorities.",
    "Unexpected opportunities may arise. Keep an open mind and be ready to adapt.",
    "Your natural charm is amplified today. Use it to strengthen important relationships.",
    "Focus on self-care and inner peace. The universe supports your well-being today.",
    "Communication flows easily today. Express your thoughts and feelings clearly.",
    "Financial matters require your attention. Review your budget and spending habits.",
    "Adventure calls to you today. Step outside your comfort zone and embrace new experiences.",
    "Patience is your ally today. Good things come to those who wait and plan carefully.",
  ],
  love: [
    "Romance is in the air. Single signs may meet someone special today.",
    "Strengthen bonds with honest communication. Share your feelings openly.",
    "Past relationships may resurface. Handle with wisdom and clarity.",
    "Self-love is essential today. Focus on nurturing your own heart first.",
    "A romantic gesture will be well-received. Show appreciation for your partner.",
    "New connections spark today. Be open to unexpected romantic possibilities.",
  ],
  career: [
    "A new project at work could showcase your talents. Take the lead with confidence.",
    "Collaboration brings success today. Work closely with your team for the best results.",
    "Financial opportunities present themselves. Consider investments carefully.",
    "Your hard work is about to be recognized. Stay focused and maintain your momentum.",
    "Network actively today. Professional connections made now could prove valuable.",
    "Innovation is favored. Don't be afraid to propose new ideas at work.",
  ],
  health: [
    "Your energy levels are high. Channel this vitality into physical activity.",
    "Rest and recuperation are important today. Listen to your body's needs.",
    "Mental clarity comes through meditation. Take time for mindfulness practices.",
    "Nutrition matters today. Choose foods that nourish both body and soul.",
    "Stress management is key. Find healthy outlets for any tension you're feeling.",
    "Physical activity will boost your mood. Try something new in your fitness routine.",
  ],
};

const luckyColors = ['Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver', 'Orange', 'Pink', 'Teal', 'Lavender'];
const moods = ['Optimistic', 'Reflective', 'Energetic', 'Peaceful', 'Creative', 'Passionate', 'Adventurous', 'Grounded'];

interface DailyHoroscopeToolProps {
  uiConfig?: UIConfig;
}

export const DailyHoroscopeTool: React.FC<DailyHoroscopeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getElementColor = (element: ZodiacSign['element']) => {
    const colors = {
      fire: isDark ? 'text-orange-400 bg-orange-900/30 border-orange-700' : 'text-orange-600 bg-orange-50 border-orange-200',
      earth: isDark ? 'text-green-400 bg-green-900/30 border-green-700' : 'text-green-600 bg-green-50 border-green-200',
      air: isDark ? 'text-sky-400 bg-sky-900/30 border-sky-700' : 'text-sky-600 bg-sky-50 border-sky-200',
      water: isDark ? 'text-blue-400 bg-blue-900/30 border-blue-700' : 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[element];
  };

  const generateHoroscope = useMemo((): Horoscope | null => {
    if (!selectedSign) return null;

    const today = new Date().toDateString();
    const seed = selectedSign.name.length + today.length;

    const getRandomItem = <T,>(arr: T[], offset: number = 0): T => {
      return arr[(seed + offset) % arr.length];
    };

    const compatibleSigns = zodiacSigns.filter(s => s.element === selectedSign.element && s.name !== selectedSign.name);
    const compatibility = compatibleSigns.length > 0
      ? compatibleSigns[(seed % compatibleSigns.length)].name
      : zodiacSigns[(seed + 3) % zodiacSigns.length].name;

    return {
      general: getRandomItem(horoscopeTemplates.general, 0),
      love: getRandomItem(horoscopeTemplates.love, 1),
      career: getRandomItem(horoscopeTemplates.career, 2),
      health: getRandomItem(horoscopeTemplates.health, 3),
      luckyNumber: (seed % 99) + 1,
      luckyColor: getRandomItem(luckyColors, 4),
      mood: getRandomItem(moods, 5),
      compatibility,
    };
  }, [selectedSign]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
            <Star size={28} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.dailyHoroscope.dailyHoroscope', 'Daily Horoscope')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.dailyHoroscope.discoverWhatTheStarsHave', 'Discover what the stars have in store for you today')}
            </p>
          </div>
        </div>

        {/* Today's Date */}
        <div className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg w-fit ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <Calendar size={18} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Zodiac Sign Selector */}
        <div className={`p-4 rounded-xl border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.dailyHoroscope.selectYourZodiacSign', 'Select Your Zodiac Sign')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.name}
                onClick={() => setSelectedSign(sign)}
                className={`p-3 rounded-xl border transition-all ${
                  selectedSign?.name === sign.name
                    ? isDark
                      ? 'bg-teal-900/50 border-teal-500 ring-2 ring-teal-500/50'
                      : 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/30'
                    : isDark
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-2xl mb-1">{sign.symbol}</div>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {sign.name}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {sign.dateRange.split(' - ')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Horoscope Display */}
        {selectedSign && generateHoroscope && (
          <div className="space-y-4">
            {/* Sign Info Card */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-5xl p-4 rounded-2xl ${getElementColor(selectedSign.element)}`}>
                  {selectedSign.symbol}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedSign.name}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedSign.dateRange}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getElementColor(selectedSign.element)}`}>
                      {selectedSign.element.charAt(0).toUpperCase() + selectedSign.element.slice(1)} Sign
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Ruled by {selectedSign.rulingPlanet}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dailyHoroscope.luckyNumber', 'Lucky Number')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    {generateHoroscope.luckyNumber}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dailyHoroscope.luckyColor', 'Lucky Color')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    {generateHoroscope.luckyColor}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dailyHoroscope.mood', 'Mood')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    {generateHoroscope.mood}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.dailyHoroscope.bestMatch', 'Best Match')}</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    {generateHoroscope.compatibility}
                  </div>
                </div>
              </div>

              {/* General Prediction */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
                  <span className={`font-semibold ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>{t('tools.dailyHoroscope.todaySOverview', 'Today\'s Overview')}</span>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {generateHoroscope.general}
                </p>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-3">
              {/* Love Section */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => toggleSection('love')}
                  className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className={isDark ? 'text-pink-400' : 'text-pink-500'} size={22} />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dailyHoroscope.loveRelationships', 'Love & Relationships')}</span>
                  </div>
                  <ChevronDown className={`transition-transform ${expandedSection === 'love' ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                </button>
                {expandedSection === 'love' && (
                  <div className={`px-4 pb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="text-sm leading-relaxed">{generateHoroscope.love}</p>
                  </div>
                )}
              </div>

              {/* Career Section */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => toggleSection('career')}
                  className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className={isDark ? 'text-amber-400' : 'text-amber-500'} size={22} />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dailyHoroscope.careerFinance', 'Career & Finance')}</span>
                  </div>
                  <ChevronDown className={`transition-transform ${expandedSection === 'career' ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                </button>
                {expandedSection === 'career' && (
                  <div className={`px-4 pb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="text-sm leading-relaxed">{generateHoroscope.career}</p>
                  </div>
                )}
              </div>

              {/* Health Section */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => toggleSection('health')}
                  className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Sun className={isDark ? 'text-green-400' : 'text-green-500'} size={22} />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.dailyHoroscope.healthWellness', 'Health & Wellness')}</span>
                  </div>
                  <ChevronDown className={`transition-transform ${expandedSection === 'health' ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                </button>
                {expandedSection === 'health' && (
                  <div className={`px-4 pb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="text-sm leading-relaxed">{generateHoroscope.health}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedSign && (
          <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Moon size={64} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.dailyHoroscope.selectYourZodiacSignAbove', 'Select your zodiac sign above')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {t('tools.dailyHoroscope.toRevealYourPersonalizedDaily', 'to reveal your personalized daily horoscope')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyHoroscopeTool;
