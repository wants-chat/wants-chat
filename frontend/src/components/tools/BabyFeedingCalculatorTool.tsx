import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Droplets, Clock, Info, Sparkles, Coffee } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BabyFeedingCalculatorToolProps {
  uiConfig?: UIConfig;
}

type FeedingType = 'formula' | 'breastmilk' | 'solids';

interface FeedingResult {
  dailyAmount: { oz: number; ml: number };
  perFeedingAmount: { oz: number; ml: number };
  feedingsPerDay: number;
  feedingInterval: string;
  guidelines: string[];
  ageSpecificTips: string[];
}

export const BabyFeedingCalculatorTool: React.FC<BabyFeedingCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [ageMonths, setAgeMonths] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [feedingType, setFeedingType] = useState<FeedingType>('formula');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        const numbers = params.content.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          setWeightKg(numbers[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const convertWeight = (value: number, from: 'kg' | 'lb'): number => {
    return from === 'lb' ? value * 0.453592 : value;
  };

  const result = useMemo((): FeedingResult | null => {
    const age = parseFloat(ageMonths);
    const weight = parseFloat(weightKg);

    if (isNaN(age) || isNaN(weight) || age < 0 || weight <= 0) return null;

    const weightInKg = convertWeight(weight, weightUnit);
    const weightInLb = weightInKg * 2.20462;

    let dailyOz: number;
    let feedingsPerDay: number;
    let guidelines: string[] = [];
    let ageSpecificTips: string[] = [];

    // Formula and breast milk calculations based on age and weight
    if (feedingType === 'formula' || feedingType === 'breastmilk') {
      if (age < 0.5) {
        // Newborn (0-2 weeks)
        dailyOz = Math.min(weightInLb * 2.5, 24);
        feedingsPerDay = 8;
        guidelines = [
          'Feed on demand, typically every 2-3 hours',
          'Look for hunger cues: rooting, sucking on hands',
          'Wake baby for feedings if sleeping longer than 4 hours',
          'Expect 8-12 feedings in 24 hours',
        ];
        ageSpecificTips = [
          'Colostrum is sufficient for first few days',
          'Baby\'s stomach is tiny - about the size of a marble',
          'Frequent feeding helps establish milk supply',
        ];
      } else if (age < 1) {
        // 2-4 weeks
        dailyOz = Math.min(weightInLb * 2.5, 28);
        feedingsPerDay = 7;
        guidelines = [
          'Feed every 2-3 hours during the day',
          'May go 3-4 hours at night between feedings',
          'Baby should have 6+ wet diapers daily',
        ];
        ageSpecificTips = [
          'Growth spurt common around 2-3 weeks',
          'Baby may cluster feed in evenings',
        ];
      } else if (age < 2) {
        // 1-2 months
        dailyOz = Math.min(weightInLb * 2.5, 32);
        feedingsPerDay = 6;
        guidelines = [
          'Feed every 2.5-3.5 hours',
          'Baby may sleep longer stretches at night',
          'Watch for signs of fullness: turning away, relaxed hands',
        ];
        ageSpecificTips = [
          'Growth spurt around 6 weeks',
          'Baby becoming more efficient at feeding',
        ];
      } else if (age < 4) {
        // 2-4 months
        dailyOz = Math.min(weightInLb * 2.5, 32);
        feedingsPerDay = 5;
        guidelines = [
          'Feed every 3-4 hours during the day',
          'May drop one night feeding',
          'Total daily intake should not exceed 32 oz',
        ];
        ageSpecificTips = [
          'Baby may become distracted during feeds',
          'Consider feeding in quiet environment',
        ];
      } else if (age < 6) {
        // 4-6 months
        dailyOz = Math.min(weightInLb * 2.5, 36);
        feedingsPerDay = 5;
        guidelines = [
          'Feed every 4-5 hours',
          'May be ready to start solids around 6 months',
          'Milk/formula remains primary nutrition',
        ];
        ageSpecificTips = [
          'Watch for signs of readiness for solids',
          'Baby should have good head control',
        ];
      } else if (age < 9) {
        // 6-9 months
        dailyOz = 24;
        feedingsPerDay = 4;
        guidelines = [
          'Offer 24-32 oz formula/breastmilk daily',
          'Introduce solid foods 2-3 times daily',
          'Milk before solids at this age',
        ];
        ageSpecificTips = [
          'Start with single-ingredient purees',
          'Introduce one new food every 3-5 days',
          'Watch for allergic reactions',
        ];
      } else if (age < 12) {
        // 9-12 months
        dailyOz = 24;
        feedingsPerDay = 4;
        guidelines = [
          'Offer 24 oz formula/breastmilk daily',
          'Solids 3 times daily with snacks',
          'Baby may hold own bottle or cup',
        ];
        ageSpecificTips = [
          'Introduce finger foods and self-feeding',
          'Practice with sippy cup',
          'Offer water with meals',
        ];
      } else {
        // 12+ months
        dailyOz = 16;
        feedingsPerDay = 3;
        guidelines = [
          'Transition to whole milk (16-24 oz daily)',
          '3 meals plus 2 snacks daily',
          'Family foods become primary nutrition',
        ];
        ageSpecificTips = [
          'Can transition from bottle to cup',
          'Milk no longer primary nutrition source',
          'Offer variety of textures',
        ];
      }
    } else {
      // Solids (complementary feeding)
      if (age < 6) {
        return {
          dailyAmount: { oz: 0, ml: 0 },
          perFeedingAmount: { oz: 0, ml: 0 },
          feedingsPerDay: 0,
          feedingInterval: 'Not recommended',
          guidelines: ['Solids are not recommended before 6 months of age'],
          ageSpecificTips: ['Wait for signs of readiness', 'Consult pediatrician before starting'],
        };
      } else if (age < 9) {
        dailyOz = 4; // tablespoons equivalent
        feedingsPerDay = 2;
        guidelines = [
          'Start with 1-2 tablespoons per feeding',
          'Offer solids after breastmilk/formula',
          'Focus on iron-rich foods',
        ];
        ageSpecificTips = [
          'Single-grain cereals, pureed vegetables, fruits',
          'Smooth, thin consistency',
        ];
      } else if (age < 12) {
        dailyOz = 8;
        feedingsPerDay = 3;
        guidelines = [
          'Increase to 3-4 tablespoons per feeding',
          'Offer solids before some milk feeds',
          'Include protein sources',
        ];
        ageSpecificTips = [
          'Mashed and soft finger foods',
          'Introduce variety of flavors',
        ];
      } else {
        dailyOz = 16;
        feedingsPerDay = 3;
        guidelines = [
          'Three meals similar to family meals',
          'Offer healthy snacks between meals',
          'Continue offering variety',
        ];
        ageSpecificTips = [
          'Chopped table foods appropriate',
          'Self-feeding encouraged',
        ];
      }
    }

    const perFeedingOz = dailyOz / feedingsPerDay;
    const interval = 24 / feedingsPerDay;

    return {
      dailyAmount: { oz: Math.round(dailyOz * 10) / 10, ml: Math.round(dailyOz * 29.5735) },
      perFeedingAmount: { oz: Math.round(perFeedingOz * 10) / 10, ml: Math.round(perFeedingOz * 29.5735) },
      feedingsPerDay,
      feedingInterval: `Every ${interval.toFixed(1)} hours`,
      guidelines,
      ageSpecificTips,
    };
  }, [ageMonths, weightKg, weightUnit, feedingType]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <Droplets className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.babyFeedingCalculator.babyFeedingCalculator', 'Baby Feeding Calculator')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.babyFeedingCalculator.calculateFeedingAmountsByAge', 'Calculate feeding amounts by age and weight')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Prefill indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">
                  {t('tools.babyFeedingCalculator.dataLoadedFromYourConversation', 'Data loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Feeding Type */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.babyFeedingCalculator.feedingType', 'Feeding Type')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'formula', name: 'Formula', icon: Baby },
                  { id: 'breastmilk', name: 'Breast Milk', icon: Droplets },
                  { id: 'solids', name: 'Solids', icon: Coffee },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFeedingType(type.id as FeedingType)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      feedingType === type.id
                        ? 'bg-[#0D9488] text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.babyFeedingCalculator.babySAgeMonths', 'Baby\'s Age (months)')}
              </label>
              <input
                type="number"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
                min="0"
                max="24"
                step="0.5"
                placeholder="e.g., 3"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.babyFeedingCalculator.babySWeight', 'Baby\'s Weight')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  step="0.1"
                  placeholder={weightUnit === 'kg' ? 'e.g., 5.5' : 'e.g., 12'}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb')}
                  className={`px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {result && (
              <>
                {/* Main Stats */}
                <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.babyFeedingCalculator.dailyAmount', 'Daily Amount')}
                      </div>
                      <div className="text-3xl font-bold text-[#0D9488]">
                        {result.dailyAmount.oz} oz
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({result.dailyAmount.ml} ml)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.babyFeedingCalculator.perFeeding', 'Per Feeding')}
                      </div>
                      <div className="text-3xl font-bold text-[#0D9488]">
                        {result.perFeedingAmount.oz} oz
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({result.perFeedingAmount.ml} ml)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feeding Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Baby className="w-5 h-5 mx-auto mb-1 text-[#0D9488]" />
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.feedingsPerDay}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.babyFeedingCalculator.feedingsDay', 'Feedings/Day')}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <Clock className="w-5 h-5 mx-auto mb-1 text-[#0D9488]" />
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.feedingInterval.replace('Every ', '')}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.babyFeedingCalculator.interval', 'Interval')}
                    </div>
                  </div>
                </div>

                {/* Guidelines */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.babyFeedingCalculator.feedingGuidelines', 'Feeding Guidelines')}
                  </h4>
                  <ul className="space-y-2">
                    {result.guidelines.map((guideline, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#0D9488] mt-1">•</span>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {guideline}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Age-Specific Tips */}
                {result.ageSpecificTips.length > 0 && (
                  <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-700' : 'bg-teal-50'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.babyFeedingCalculator.ageSpecificTips', 'Age-Specific Tips')}
                    </h4>
                    <ul className="space-y-1">
                      {result.ageSpecificTips.map((tip, index) => (
                        <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.babyFeedingCalculator.theseAreGeneralGuidelinesBased', 'These are general guidelines based on average needs. Every baby is different. Look for hunger and fullness cues, and consult your pediatrician for personalized advice.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyFeedingCalculatorTool;
