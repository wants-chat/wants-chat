import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Heart, Users, Sparkles, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

interface SignInfo {
  name: string;
  symbol: string;
  element: string;
  dates: string;
  traits: string[];
}

interface ZodiacCompatibilityToolProps {
  uiConfig?: UIConfig;
}

export const ZodiacCompatibilityTool: React.FC<ZodiacCompatibilityToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sign1, setSign1] = useState<ZodiacSign>('aries');
  const [sign2, setSign2] = useState<ZodiacSign>('leo');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.formData) {
        if (params.formData.sign1) setSign1(params.formData.sign1.toLowerCase() as ZodiacSign);
        if (params.formData.sign2) setSign2(params.formData.sign2.toLowerCase() as ZodiacSign);
        if (params.formData.firstSign) setSign1(params.formData.firstSign.toLowerCase() as ZodiacSign);
        if (params.formData.secondSign) setSign2(params.formData.secondSign.toLowerCase() as ZodiacSign);
        setIsPrefilled(true);
      }
      // Check if items contains zodiac signs
      if (params.items && params.items.length >= 2) {
        const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        const item1 = params.items[0].toLowerCase();
        const item2 = params.items[1].toLowerCase();
        if (validSigns.includes(item1)) {
          setSign1(item1 as ZodiacSign);
          setIsPrefilled(true);
        }
        if (validSigns.includes(item2)) {
          setSign2(item2 as ZodiacSign);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const signs: Record<ZodiacSign, SignInfo> = {
    aries: { name: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 - Apr 19', traits: ['Bold', 'Ambitious', 'Energetic'] },
    taurus: { name: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 - May 20', traits: ['Patient', 'Reliable', 'Devoted'] },
    gemini: { name: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 - Jun 20', traits: ['Curious', 'Adaptable', 'Witty'] },
    cancer: { name: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 - Jul 22', traits: ['Nurturing', 'Loyal', 'Protective'] },
    leo: { name: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 - Aug 22', traits: ['Creative', 'Passionate', 'Generous'] },
    virgo: { name: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 - Sep 22', traits: ['Analytical', 'Practical', 'Organized'] },
    libra: { name: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 - Oct 22', traits: ['Diplomatic', 'Fair', 'Social'] },
    scorpio: { name: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 - Nov 21', traits: ['Passionate', 'Resourceful', 'Brave'] },
    sagittarius: { name: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 - Dec 21', traits: ['Optimistic', 'Adventurous', 'Honest'] },
    capricorn: { name: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 - Jan 19', traits: ['Disciplined', 'Ambitious', 'Patient'] },
    aquarius: { name: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 - Feb 18', traits: ['Progressive', 'Original', 'Independent'] },
    pisces: { name: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 - Mar 20', traits: ['Intuitive', 'Artistic', 'Compassionate'] },
  };

  // Compatibility matrix (simplified)
  const compatibilityMatrix: Record<ZodiacSign, Record<ZodiacSign, number>> = {
    aries: { aries: 70, taurus: 45, gemini: 83, cancer: 42, leo: 97, virgo: 63, libra: 85, scorpio: 50, sagittarius: 93, capricorn: 47, aquarius: 78, pisces: 67 },
    taurus: { aries: 45, taurus: 86, gemini: 33, cancer: 97, leo: 73, virgo: 90, libra: 65, scorpio: 88, sagittarius: 30, capricorn: 98, aquarius: 58, pisces: 85 },
    gemini: { aries: 83, taurus: 33, gemini: 60, cancer: 65, leo: 88, virgo: 68, libra: 93, scorpio: 28, sagittarius: 60, capricorn: 68, aquarius: 85, pisces: 53 },
    cancer: { aries: 42, taurus: 97, gemini: 65, cancer: 75, leo: 35, virgo: 90, libra: 43, scorpio: 94, sagittarius: 53, capricorn: 83, aquarius: 25, pisces: 98 },
    leo: { aries: 97, taurus: 73, gemini: 88, cancer: 35, leo: 80, virgo: 35, libra: 97, scorpio: 58, sagittarius: 93, capricorn: 35, aquarius: 68, pisces: 38 },
    virgo: { aries: 63, taurus: 90, gemini: 68, cancer: 90, leo: 35, virgo: 65, libra: 68, scorpio: 88, sagittarius: 48, capricorn: 95, aquarius: 30, pisces: 88 },
    libra: { aries: 85, taurus: 65, gemini: 93, cancer: 43, leo: 97, virgo: 68, libra: 75, scorpio: 35, sagittarius: 73, capricorn: 55, aquarius: 90, pisces: 88 },
    scorpio: { aries: 50, taurus: 88, gemini: 28, cancer: 94, leo: 58, virgo: 88, libra: 35, scorpio: 80, sagittarius: 28, capricorn: 95, aquarius: 73, pisces: 97 },
    sagittarius: { aries: 93, taurus: 30, gemini: 60, cancer: 53, leo: 93, virgo: 48, libra: 73, scorpio: 28, sagittarius: 88, capricorn: 60, aquarius: 90, pisces: 63 },
    capricorn: { aries: 47, taurus: 98, gemini: 68, cancer: 83, leo: 35, virgo: 95, libra: 55, scorpio: 95, sagittarius: 60, capricorn: 75, aquarius: 68, pisces: 88 },
    aquarius: { aries: 78, taurus: 58, gemini: 85, cancer: 25, leo: 68, virgo: 30, libra: 90, scorpio: 73, sagittarius: 90, capricorn: 68, aquarius: 45, pisces: 45 },
    pisces: { aries: 67, taurus: 85, gemini: 53, cancer: 98, leo: 38, virgo: 88, libra: 88, scorpio: 97, sagittarius: 63, capricorn: 88, aquarius: 45, pisces: 70 },
  };

  const compatibility = useMemo(() => {
    const score = compatibilityMatrix[sign1][sign2];
    const s1 = signs[sign1];
    const s2 = signs[sign2];

    // Element compatibility
    const sameElement = s1.element === s2.element;
    const compatibleElements = {
      Fire: ['Fire', 'Air'],
      Earth: ['Earth', 'Water'],
      Air: ['Air', 'Fire'],
      Water: ['Water', 'Earth'],
    };
    const elementMatch = compatibleElements[s1.element as keyof typeof compatibleElements].includes(s2.element);

    let level: string;
    let description: string;

    if (score >= 90) {
      level = 'Excellent';
      description = 'A near-perfect match! You share deep understanding and natural chemistry.';
    } else if (score >= 75) {
      level = 'Great';
      description = 'Strong compatibility with good communication and shared values.';
    } else if (score >= 60) {
      level = 'Good';
      description = 'Decent match with potential for growth through understanding differences.';
    } else if (score >= 45) {
      level = 'Moderate';
      description = 'Requires effort and compromise, but can work with dedication.';
    } else {
      level = 'Challenging';
      description = 'May face obstacles, but opposites can attract with mutual respect.';
    }

    return { score, level, description, sameElement, elementMatch };
  }, [sign1, sign2, signs]);

  const elementColors: Record<string, string> = {
    Fire: 'text-red-500',
    Earth: 'text-green-600',
    Air: 'text-sky-500',
    Water: 'text-blue-500',
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Star className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.zodiacCompatibility.zodiacCompatibility', 'Zodiac Compatibility')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.zodiacCompatibility.checkAstrologicalCompatibility', 'Check astrological compatibility')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.zodiacCompatibility.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Sign Selection */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.zodiacCompatibility.firstSign', 'First Sign')}
            </label>
            <select
              value={sign1}
              onChange={(e) => setSign1(e.target.value as ZodiacSign)}
              className={`w-full px-4 py-3 rounded-lg border text-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {Object.entries(signs).map(([key, sign]) => (
                <option key={key} value={key}>{sign.symbol} {sign.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.zodiacCompatibility.secondSign', 'Second Sign')}
            </label>
            <select
              value={sign2}
              onChange={(e) => setSign2(e.target.value as ZodiacSign)}
              className={`w-full px-4 py-3 rounded-lg border text-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {Object.entries(signs).map(([key, sign]) => (
                <option key={key} value={key}>{sign.symbol} {sign.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sign Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-5xl mb-2">{signs[sign1].symbol}</div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{signs[sign1].name}</div>
            <div className={`text-sm ${elementColors[signs[sign1].element]}`}>{signs[sign1].element}</div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{signs[sign1].dates}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-5xl mb-2">{signs[sign2].symbol}</div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{signs[sign2].name}</div>
            <div className={`text-sm ${elementColors[signs[sign2].element]}`}>{signs[sign2].element}</div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{signs[sign2].dates}</div>
          </div>
        </div>

        {/* Compatibility Score */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <Heart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
          <div className="text-5xl font-bold text-purple-500 my-2">
            {compatibility.score}%
          </div>
          <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {compatibility.level} Match
          </div>
          <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {compatibility.description}
          </div>
        </div>

        {/* Compatibility Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.zodiacCompatibility.compatibility', 'Compatibility')}</span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{compatibility.score}%</span>
          </div>
          <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${compatibility.score}%` }}
            />
          </div>
        </div>

        {/* Element Match */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`w-4 h-4 ${compatibility.sameElement ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.zodiacCompatibility.sameElement', 'Same Element')}</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {compatibility.sameElement ? t('tools.zodiacCompatibility.yesDeepNaturalUnderstanding', 'Yes - Deep natural understanding') : t('tools.zodiacCompatibility.noDifferentPerspectives', 'No - Different perspectives')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className={`w-4 h-4 ${compatibility.elementMatch ? 'text-green-500' : 'text-orange-500'}`} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.zodiacCompatibility.elementHarmony', 'Element Harmony')}</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {compatibility.elementMatch ? t('tools.zodiacCompatibility.compatibleElements', 'Compatible elements') : t('tools.zodiacCompatibility.contrastingElements', 'Contrasting elements')}
            </div>
          </div>
        </div>

        {/* Traits Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.zodiacCompatibility.keyTraits', 'Key Traits')}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className={`font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{signs[sign1].name}</div>
              <div className="flex flex-wrap gap-1">
                {signs[sign1].traits.map((trait, i) => (
                  <span key={i} className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className={`font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{signs[sign2].name}</div>
              <div className="flex flex-wrap gap-1">
                {signs[sign2].traits.map((trait, i) => (
                  <span key={i} className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{t('tools.zodiacCompatibility.forEntertainmentPurposesOnlyReal', 'For entertainment purposes only. Real compatibility depends on individuals, not stars!')}</span>
        </div>
      </div>
    </div>
  );
};

export default ZodiacCompatibilityTool;
