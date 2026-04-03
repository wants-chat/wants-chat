import React, { useState, useMemo, useEffect } from 'react';
import { Dog, Cat, Scale, Calculator, Info, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PetFoodCalculatorToolProps {
  uiConfig?: UIConfig;
}

type PetType = 'dog' | 'cat';
type ActivityLevel = 'low' | 'moderate' | 'high' | 'very_high';
type LifeStage = 'puppy' | 'adult' | 'senior';

export const PetFoodCalculatorTool: React.FC<PetFoodCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [petType, setPetType] = useState<PetType>('dog');
  const [weight, setWeight] = useState('25');
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [lifeStage, setLifeStage] = useState<LifeStage>('adult');
  const [isNeutered, setIsNeutered] = useState(true);
  const [foodCalories, setFoodCalories] = useState('350'); // kcal per cup
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setWeight(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const activityLabels: Record<ActivityLevel, string> = {
    low: 'Low (sedentary)',
    moderate: 'Moderate (regular walks)',
    high: 'High (active/working)',
    very_high: 'Very High (athlete)',
  };

  const activityMultipliers: Record<ActivityLevel, number> = {
    low: 1.0,
    moderate: 1.2,
    high: 1.4,
    very_high: 1.6,
  };

  const lifeStageMultipliers: Record<LifeStage, number> = {
    puppy: 2.0,
    adult: 1.0,
    senior: 0.8,
  };

  const calculations = useMemo(() => {
    let weightKg = parseFloat(weight) || 0;
    if (unit === 'lbs') {
      weightKg = weightKg * 0.453592;
    }

    // Resting Energy Requirement (RER)
    // RER = 70 × (body weight in kg)^0.75
    const rer = 70 * Math.pow(weightKg, 0.75);

    // Maintenance Energy Requirement (MER)
    // Apply multipliers based on activity, life stage, and neuter status
    let mer = rer;

    // Activity multiplier
    mer *= activityMultipliers[activityLevel];

    // Life stage multiplier
    mer *= lifeStageMultipliers[lifeStage];

    // Neuter adjustment (neutered pets typically need 20-30% less)
    if (isNeutered && lifeStage === 'adult') {
      mer *= 0.85;
    }

    // Cat vs Dog adjustment
    if (petType === 'cat') {
      mer *= 0.8; // Cats generally need fewer calories per kg
    }

    // Food amount calculations
    const caloriesPerCup = parseFloat(foodCalories) || 350;
    const cupsPerDay = mer / caloriesPerCup;
    const gramsPerDay = cupsPerDay * 100; // Approximate conversion

    // Feeding schedule
    const mealsPerDay = lifeStage === 'puppy' ? 3 : 2;
    const cupsPerMeal = cupsPerDay / mealsPerDay;

    // Water recommendation (dogs: ~50ml per kg, cats: ~45ml per kg)
    const waterMl = petType === 'dog' ? weightKg * 50 : weightKg * 45;
    const waterOz = waterMl / 29.574;

    return {
      rer: Math.round(rer),
      mer: Math.round(mer),
      cupsPerDay: cupsPerDay.toFixed(2),
      cupsPerMeal: cupsPerMeal.toFixed(2),
      gramsPerDay: Math.round(gramsPerDay),
      mealsPerDay,
      waterMl: Math.round(waterMl),
      waterOz: waterOz.toFixed(1),
      weightKg: weightKg.toFixed(1),
    };
  }, [petType, weight, unit, activityLevel, lifeStage, isNeutered, foodCalories, activityMultipliers, lifeStageMultipliers]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            {petType === 'dog' ? <Dog className="w-5 h-5 text-orange-500" /> : <Cat className="w-5 h-5 text-orange-500" />}
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petFoodCalculator.petFoodCalculator', 'Pet Food Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petFoodCalculator.calculateDailyFoodNeedsFor', 'Calculate daily food needs for your pet')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.petFoodCalculator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Pet Type */}
        <div className="flex gap-4">
          <button
            onClick={() => setPetType('dog')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl ${petType === 'dog' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Dog className="w-6 h-6" /> Dog
          </button>
          <button
            onClick={() => setPetType('cat')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl ${petType === 'cat' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Cat className="w-6 h-6" /> Cat
          </button>
        </div>

        {/* Weight Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Scale className="w-4 h-4 inline mr-1" />
            {t('tools.petFoodCalculator.petWeight', 'Pet Weight')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={() => setUnit('lbs')}
              className={`px-4 py-2 rounded-lg ${unit === 'lbs' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              lbs
            </button>
            <button
              onClick={() => setUnit('kg')}
              className={`px-4 py-2 rounded-lg ${unit === 'kg' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              kg
            </button>
          </div>
        </div>

        {/* Life Stage */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.petFoodCalculator.lifeStage', 'Life Stage')}
          </label>
          <div className="flex gap-2">
            {(['puppy', 'adult', 'senior'] as LifeStage[]).map((stage) => (
              <button
                key={stage}
                onClick={() => setLifeStage(stage)}
                className={`flex-1 py-2 rounded-lg capitalize ${lifeStage === stage ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {stage === 'puppy' ? (petType === 'dog' ? t('tools.petFoodCalculator.puppy', 'Puppy') : t('tools.petFoodCalculator.kitten', 'Kitten')) : stage}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.petFoodCalculator.activityLevel', 'Activity Level')}
          </label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {Object.entries(activityLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isNeutered}
              onChange={(e) => setIsNeutered(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.petFoodCalculator.spayedNeutered', 'Spayed/Neutered')}
            </span>
          </label>
        </div>

        {/* Food Calories */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.petFoodCalculator.foodCaloriesKcalCup', 'Food Calories (kcal/cup)')}
          </label>
          <input
            type="number"
            value={foodCalories}
            onChange={(e) => setFoodCalories(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            placeholder={t('tools.petFoodCalculator.checkYourFoodPackage', 'Check your food package')}
          />
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.petFoodCalculator.typicalRange250450Kcal', 'Typical range: 250-450 kcal/cup. Check your pet food package.')}
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <Calculator className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petFoodCalculator.dailyFoodAmount', 'Daily Food Amount')}</div>
          <div className="text-5xl font-bold text-orange-500 my-2">
            {calculations.cupsPerDay}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            cups per day (~{calculations.gramsPerDay}g)
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petFoodCalculator.perMeal', 'Per Meal')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.cupsPerMeal} cups
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {calculations.mealsPerDay} meals/day
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.petFoodCalculator.dailyCalories', 'Daily Calories')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.mer}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.petFoodCalculator.kcalDay', 'kcal/day')}
            </div>
          </div>
        </div>

        {/* Water Recommendation */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              💧
            </div>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petFoodCalculator.waterNeeds', 'Water Needs')}</span>
          </div>
          <div className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {calculations.waterMl} mL ({calculations.waterOz} oz) daily
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.petFoodCalculator.alwaysProvideFreshCleanWater', 'Always provide fresh, clean water')}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.petFoodCalculator.important', 'Important:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• This is an estimate. Adjust based on your pet's condition</li>
                <li>• Monitor weight and adjust portions as needed</li>
                <li>• Consult your vet for specific dietary needs</li>
                <li>• Include treats in daily calorie count (max 10%)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetFoodCalculatorTool;
