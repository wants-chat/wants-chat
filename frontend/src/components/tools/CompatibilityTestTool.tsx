import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Star, Sparkles, RefreshCw, ChevronDown, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface ZodiacSign {
  name: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  dateRange: string;
  traits: string[];
}

const zodiacSigns: ZodiacSign[] = [
  { name: 'Aries', symbol: '♈', element: 'fire', dateRange: 'Mar 21 - Apr 19', traits: ['Bold', 'Ambitious', 'Energetic'] },
  { name: 'Taurus', symbol: '♉', element: 'earth', dateRange: 'Apr 20 - May 20', traits: ['Patient', 'Reliable', 'Devoted'] },
  { name: 'Gemini', symbol: '♊', element: 'air', dateRange: 'May 21 - Jun 20', traits: ['Adaptable', 'Curious', 'Expressive'] },
  { name: 'Cancer', symbol: '♋', element: 'water', dateRange: 'Jun 21 - Jul 22', traits: ['Nurturing', 'Intuitive', 'Protective'] },
  { name: 'Leo', symbol: '♌', element: 'fire', dateRange: 'Jul 23 - Aug 22', traits: ['Confident', 'Generous', 'Loyal'] },
  { name: 'Virgo', symbol: '♍', element: 'earth', dateRange: 'Aug 23 - Sep 22', traits: ['Analytical', 'Practical', 'Helpful'] },
  { name: 'Libra', symbol: '♎', element: 'air', dateRange: 'Sep 23 - Oct 22', traits: ['Diplomatic', 'Fair', 'Social'] },
  { name: 'Scorpio', symbol: '♏', element: 'water', dateRange: 'Oct 23 - Nov 21', traits: ['Passionate', 'Brave', 'Determined'] },
  { name: 'Sagittarius', symbol: '♐', element: 'fire', dateRange: 'Nov 22 - Dec 21', traits: ['Optimistic', 'Adventurous', 'Honest'] },
  { name: 'Capricorn', symbol: '♑', element: 'earth', dateRange: 'Dec 22 - Jan 19', traits: ['Disciplined', 'Ambitious', 'Patient'] },
  { name: 'Aquarius', symbol: '♒', element: 'air', dateRange: 'Jan 20 - Feb 18', traits: ['Independent', 'Original', 'Humanitarian'] },
  { name: 'Pisces', symbol: '♓', element: 'water', dateRange: 'Feb 19 - Mar 20', traits: ['Compassionate', 'Artistic', 'Intuitive'] },
];

interface CompatibilityResult {
  score: number;
  rating: string;
  color: string;
  overview: string;
  strengths: string[];
  challenges: string[];
  tips: string[];
  loveScore: number;
  friendshipScore: number;
  workScore: number;
}

const compatibilityMatrix: Record<string, Record<string, number>> = {
  Aries: { Aries: 70, Taurus: 60, Gemini: 85, Cancer: 50, Leo: 95, Virgo: 55, Libra: 75, Scorpio: 65, Sagittarius: 90, Capricorn: 45, Aquarius: 80, Pisces: 55 },
  Taurus: { Aries: 60, Taurus: 80, Gemini: 55, Cancer: 90, Leo: 65, Virgo: 95, Libra: 70, Scorpio: 85, Sagittarius: 50, Capricorn: 95, Aquarius: 45, Pisces: 80 },
  Gemini: { Aries: 85, Taurus: 55, Gemini: 75, Cancer: 60, Leo: 80, Virgo: 65, Libra: 90, Scorpio: 50, Sagittarius: 85, Capricorn: 55, Aquarius: 95, Pisces: 60 },
  Cancer: { Aries: 50, Taurus: 90, Gemini: 60, Cancer: 80, Leo: 65, Virgo: 85, Libra: 55, Scorpio: 95, Sagittarius: 45, Capricorn: 70, Aquarius: 55, Pisces: 95 },
  Leo: { Aries: 95, Taurus: 65, Gemini: 80, Cancer: 65, Leo: 85, Virgo: 60, Libra: 85, Scorpio: 70, Sagittarius: 95, Capricorn: 50, Aquarius: 75, Pisces: 55 },
  Virgo: { Aries: 55, Taurus: 95, Gemini: 65, Cancer: 85, Leo: 60, Virgo: 80, Libra: 70, Scorpio: 85, Sagittarius: 55, Capricorn: 90, Aquarius: 50, Pisces: 75 },
  Libra: { Aries: 75, Taurus: 70, Gemini: 90, Cancer: 55, Leo: 85, Virgo: 70, Libra: 80, Scorpio: 60, Sagittarius: 80, Capricorn: 55, Aquarius: 90, Pisces: 65 },
  Scorpio: { Aries: 65, Taurus: 85, Gemini: 50, Cancer: 95, Leo: 70, Virgo: 85, Libra: 60, Scorpio: 80, Sagittarius: 55, Capricorn: 80, Aquarius: 50, Pisces: 95 },
  Sagittarius: { Aries: 90, Taurus: 50, Gemini: 85, Cancer: 45, Leo: 95, Virgo: 55, Libra: 80, Scorpio: 55, Sagittarius: 85, Capricorn: 60, Aquarius: 90, Pisces: 55 },
  Capricorn: { Aries: 45, Taurus: 95, Gemini: 55, Cancer: 70, Leo: 50, Virgo: 90, Libra: 55, Scorpio: 80, Sagittarius: 60, Capricorn: 85, Aquarius: 65, Pisces: 75 },
  Aquarius: { Aries: 80, Taurus: 45, Gemini: 95, Cancer: 55, Leo: 75, Virgo: 50, Libra: 90, Scorpio: 50, Sagittarius: 90, Capricorn: 65, Aquarius: 80, Pisces: 70 },
  Pisces: { Aries: 55, Taurus: 80, Gemini: 60, Cancer: 95, Leo: 55, Virgo: 75, Libra: 65, Scorpio: 95, Sagittarius: 55, Capricorn: 75, Aquarius: 70, Pisces: 85 },
};

interface CompatibilityTestToolProps {
  uiConfig?: UIConfig;
}

export const CompatibilityTestTool: React.FC<CompatibilityTestToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sign1, setSign1] = useState<ZodiacSign | null>(null);
  const [sign2, setSign2] = useState<ZodiacSign | null>(null);
  const [showResult, setShowResult] = useState(false);

  const getElementColor = (element: ZodiacSign['element']) => {
    const colors = {
      fire: isDark ? 'text-orange-400 bg-orange-900/30 border-orange-700' : 'text-orange-600 bg-orange-50 border-orange-200',
      earth: isDark ? 'text-green-400 bg-green-900/30 border-green-700' : 'text-green-600 bg-green-50 border-green-200',
      air: isDark ? 'text-sky-400 bg-sky-900/30 border-sky-700' : 'text-sky-600 bg-sky-50 border-sky-200',
      water: isDark ? 'text-blue-400 bg-blue-900/30 border-blue-700' : 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[element];
  };

  const compatibility = useMemo((): CompatibilityResult | null => {
    if (!sign1 || !sign2) return null;

    const baseScore = compatibilityMatrix[sign1.name][sign2.name];

    // Calculate relationship-specific scores with some variation
    const loveScore = Math.min(100, Math.max(20, baseScore + (sign1.element === sign2.element ? 5 : -5)));
    const friendshipScore = Math.min(100, Math.max(20, baseScore + ((sign1.element === 'air' || sign2.element === 'air') ? 5 : 0)));
    const workScore = Math.min(100, Math.max(20, baseScore + ((sign1.element === 'earth' || sign2.element === 'earth') ? 5 : -3)));

    let rating: string;
    let color: string;
    if (baseScore >= 90) { rating = 'Soulmates'; color = 'pink'; }
    else if (baseScore >= 80) { rating = 'Excellent'; color = 'green'; }
    else if (baseScore >= 70) { rating = 'Great'; color = 'teal'; }
    else if (baseScore >= 60) { rating = 'Good'; color = 'blue'; }
    else if (baseScore >= 50) { rating = 'Moderate'; color = 'amber'; }
    else { rating = 'Challenging'; color = 'red'; }

    const overviews: Record<string, string> = {
      Soulmates: `${sign1.name} and ${sign2.name} share an extraordinary cosmic connection. This is a rare and special bond that transcends the ordinary.`,
      Excellent: `${sign1.name} and ${sign2.name} are highly compatible. Your energies complement each other beautifully, creating a harmonious and fulfilling relationship.`,
      Great: `${sign1.name} and ${sign2.name} have wonderful potential together. With understanding and effort, this can be a very rewarding connection.`,
      Good: `${sign1.name} and ${sign2.name} can build a solid relationship. While there may be differences, they can become sources of growth.`,
      Moderate: `${sign1.name} and ${sign2.name} face some challenges but also have unique opportunities for growth and learning from each other.`,
      Challenging: `${sign1.name} and ${sign2.name} have different approaches to life. This requires extra effort but can lead to profound personal growth.`,
    };

    const strengthsList = [
      sign1.element === sign2.element ? 'Shared elemental understanding' : 'Complementary perspectives',
      `${sign1.traits[0]} meets ${sign2.traits[0]}`,
      'Potential for growth and learning',
      baseScore >= 70 ? 'Natural chemistry' : 'Opportunity for balance',
    ];

    const challengesList = [
      sign1.element !== sign2.element ? 'Different communication styles' : 'Similar stubborn tendencies',
      baseScore < 70 ? 'May need patience and understanding' : 'Maintaining individual identity',
      'Balancing independence with togetherness',
    ];

    const tipsList = [
      'Celebrate your differences as opportunities to grow',
      'Practice active listening and empathy',
      'Create shared experiences and memories',
      'Respect each other\'s need for personal space',
    ];

    return {
      score: baseScore,
      rating,
      color,
      overview: overviews[rating],
      strengths: strengthsList,
      challenges: challengesList,
      tips: tipsList,
      loveScore,
      friendshipScore,
      workScore,
    };
  }, [sign1, sign2]);

  const calculateCompatibility = () => {
    if (sign1 && sign2) {
      setShowResult(true);
    }
  };

  const reset = () => {
    setSign1(null);
    setSign2(null);
    setShowResult(false);
  };

  const getRatingColor = (color: string) => {
    const colors: Record<string, string> = {
      pink: isDark ? 'text-pink-400 bg-pink-900/30' : 'text-pink-600 bg-pink-50',
      green: isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50',
      teal: isDark ? 'text-teal-400 bg-teal-900/30' : 'text-teal-600 bg-teal-50',
      blue: isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50',
      amber: isDark ? 'text-amber-400 bg-amber-900/30' : 'text-amber-600 bg-amber-50',
      red: isDark ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50',
    };
    return colors[color] || colors.teal;
  };

  const ScoreBar = ({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) => (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
        </div>
        <span className={`text-sm font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{score}%</span>
      </div>
      <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-1000"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
            <Heart size={28} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.compatibilityTest.zodiacCompatibility', 'Zodiac Compatibility')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.compatibilityTest.discoverYourCosmicConnectionWith', 'Discover your cosmic connection with any zodiac sign')}
            </p>
          </div>
        </div>

        {/* Sign Selection */}
        {!showResult && (
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* First Sign */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.compatibilityTest.firstSign', 'First Sign')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {zodiacSigns.map((sign) => (
                    <button
                      key={sign.name}
                      onClick={() => setSign1(sign)}
                      className={`p-2 rounded-lg border transition-all text-center ${
                        sign1?.name === sign.name
                          ? isDark
                            ? 'bg-teal-900/50 border-teal-500 ring-2 ring-teal-500/50'
                            : 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/30'
                          : isDark
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xl">{sign.symbol}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sign.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Second Sign */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.compatibilityTest.secondSign', 'Second Sign')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {zodiacSigns.map((sign) => (
                    <button
                      key={sign.name}
                      onClick={() => setSign2(sign)}
                      className={`p-2 rounded-lg border transition-all text-center ${
                        sign2?.name === sign.name
                          ? isDark
                            ? 'bg-pink-900/50 border-pink-500 ring-2 ring-pink-500/50'
                            : 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/30'
                          : isDark
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xl">{sign.symbol}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sign.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Signs Preview */}
            {(sign1 || sign2) && (
              <div className="flex items-center justify-center gap-4 mb-6">
                {sign1 && (
                  <div className={`px-4 py-2 rounded-xl border ${getElementColor(sign1.element)}`}>
                    <span className="text-2xl mr-2">{sign1.symbol}</span>
                    <span className="font-medium">{sign1.name}</span>
                  </div>
                )}
                {sign1 && sign2 && (
                  <Heart className={isDark ? 'text-pink-400' : 'text-pink-500'} size={24} />
                )}
                {sign2 && (
                  <div className={`px-4 py-2 rounded-xl border ${getElementColor(sign2.element)}`}>
                    <span className="text-2xl mr-2">{sign2.symbol}</span>
                    <span className="font-medium">{sign2.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={calculateCompatibility}
              disabled={!sign1 || !sign2}
              className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                sign1 && sign2
                  ? 'bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white shadow-lg'
                  : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles size={20} />
              {t('tools.compatibilityTest.calculateCompatibility', 'Calculate Compatibility')}
            </button>
          </div>
        )}

        {/* Results */}
        {showResult && compatibility && sign1 && sign2 && (
          <div className="space-y-4">
            {/* Main Score */}
            <div className={`p-6 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`text-5xl p-4 rounded-2xl ${getElementColor(sign1.element)}`}>
                  {sign1.symbol}
                </div>
                <Heart className="text-pink-500 animate-pulse" size={32} />
                <div className={`text-5xl p-4 rounded-2xl ${getElementColor(sign2.element)}`}>
                  {sign2.symbol}
                </div>
              </div>

              <div className={`text-6xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {compatibility.score}%
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${getRatingColor(compatibility.color)}`}>
                {compatibility.rating}
              </div>
              <p className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {compatibility.overview}
              </p>
            </div>

            {/* Detailed Scores */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.compatibilityTest.compatibilityBreakdown', 'Compatibility Breakdown')}
              </h3>
              <ScoreBar
                label="Love & Romance"
                score={compatibility.loveScore}
                icon={<Heart size={16} className="text-pink-500" />}
              />
              <ScoreBar
                label="Friendship"
                score={compatibility.friendshipScore}
                icon={<Users size={16} className="text-blue-500" />}
              />
              <ScoreBar
                label="Work & Business"
                score={compatibility.workScore}
                icon={<Star size={16} className="text-amber-500" />}
              />
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  {t('tools.compatibilityTest.relationshipStrengths', 'Relationship Strengths')}
                </h3>
                <ul className="space-y-2">
                  {compatibility.strengths.map((strength, idx) => (
                    <li key={idx} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-green-500 mt-1">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  {t('tools.compatibilityTest.potentialChallenges', 'Potential Challenges')}
                </h3>
                <ul className="space-y-2">
                  {compatibility.challenges.map((challenge, idx) => (
                    <li key={idx} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-amber-500 mt-1">!</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.compatibilityTest.tipsForYourRelationship', 'Tips for Your Relationship')}
              </h3>
              <ul className="space-y-2">
                {compatibility.tips.map((tip, idx) => (
                  <li key={idx} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-teal-500 mt-1">★</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reset Button */}
            <button
              onClick={reset}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw size={18} />
              {t('tools.compatibilityTest.tryAnotherCombination', 'Try Another Combination')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompatibilityTestTool;
