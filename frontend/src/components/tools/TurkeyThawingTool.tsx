import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bird, Clock, Thermometer, Users, AlertTriangle, Info, Snowflake } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TurkeyThawingToolProps {
  uiConfig?: UIConfig;
}

type ThawMethod = 'refrigerator' | 'coldwater' | 'microwave';
type WeightUnit = 'lbs' | 'kg';

interface ThawMethodConfig {
  name: string;
  timePerPound: number;
  description: string;
  instructions: string[];
}

export const TurkeyThawingTool: React.FC<TurkeyThawingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [weight, setWeight] = useState('12');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [thawMethod, setThawMethod] = useState<ThawMethod>('refrigerator');
  const [isStuffed, setIsStuffed] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.weight) setWeight(String(data.weight));
      if (data.weightUnit) setWeightUnit(data.weightUnit as WeightUnit);
      if (data.thawMethod) setThawMethod(data.thawMethod as ThawMethod);
      if (data.isStuffed !== undefined) setIsStuffed(Boolean(data.isStuffed));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const thawMethods: Record<ThawMethod, ThawMethodConfig> = {
    refrigerator: {
      name: 'Refrigerator',
      timePerPound: 24,
      description: 'Safest method - slow and steady at 40F or below',
      instructions: [
        'Keep turkey in original wrapper',
        'Place on a tray to catch drips',
        'Store on bottom shelf of fridge',
        'Turkey stays safe for 1-2 days after thawed',
      ],
    },
    coldwater: {
      name: 'Cold Water',
      timePerPound: 0.5,
      description: 'Faster method - requires attention every 30 minutes',
      instructions: [
        'Submerge turkey in cold water (40F or below)',
        'Change water every 30 minutes',
        'Keep turkey in leak-proof packaging',
        'Cook immediately after thawing',
      ],
    },
    microwave: {
      name: 'Microwave',
      timePerPound: 0.1,
      description: 'Fastest method - check your microwave manual for settings',
      instructions: [
        'Remove all packaging',
        'Use defrost setting based on weight',
        'Rotate turkey during thawing',
        'Cook immediately after thawing',
      ],
    },
  };

  const config = thawMethods[thawMethod];
  const SERVINGS_PER_POUND = 1.25;

  const calculations = useMemo(() => {
    let weightInPounds = parseFloat(weight) || 0;

    if (weightUnit === 'kg') {
      weightInPounds = weightInPounds * 2.205;
    }

    let thawHours: number;
    if (thawMethod === 'refrigerator') {
      thawHours = (weightInPounds / 4.5) * 24;
    } else if (thawMethod === 'coldwater') {
      thawHours = weightInPounds * 0.5;
    } else {
      thawHours = (weightInPounds * 6) / 60;
    }

    const roastMinutesPerPound = isStuffed ? 15 : 13;
    const roastMinutes = weightInPounds * roastMinutesPerPound;
    const roastHours = roastMinutes / 60;

    const servings = Math.round(weightInPounds * SERVINGS_PER_POUND);

    let thawTimeFormatted: string;
    if (thawHours >= 24) {
      const days = Math.ceil(thawHours / 24);
      thawTimeFormatted = `${days} day${days > 1 ? 's' : ''}`;
    } else if (thawHours >= 1) {
      const hours = Math.round(thawHours);
      thawTimeFormatted = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const minutes = Math.round(thawHours * 60);
      thawTimeFormatted = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    const roastHoursWhole = Math.floor(roastHours);
    const roastMinutesRemainder = Math.round((roastHours - roastHoursWhole) * 60);
    const roastTimeFormatted =
      roastHoursWhole > 0
        ? `${roastHoursWhole}h ${roastMinutesRemainder}m`
        : `${roastMinutesRemainder} minutes`;

    return {
      weightInPounds: weightInPounds.toFixed(1),
      thawHours: thawHours.toFixed(1),
      thawTimeFormatted,
      roastHours: roastHours.toFixed(1),
      roastTimeFormatted,
      roastMinutes: Math.round(roastMinutes),
      servings,
      internalTemp: 165,
    };
  }, [weight, weightUnit, thawMethod, isStuffed]);

  const safetyTips = [
    'Never thaw turkey on the counter at room temperature',
    'Turkey must reach internal temp of 165F (74C)',
    'Use a meat thermometer in the thickest part of the thigh',
    'Let turkey rest 20-30 minutes before carving',
    'Refrigerate leftovers within 2 hours of cooking',
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Bird className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.turkeyThawing.turkeyThawingRoastingCalculator', 'Turkey Thawing & Roasting Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.turkeyThawing.calculateThawAndCookTimes', 'Calculate thaw and cook times for your turkey')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Turkey Weight Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.turkeyThawing.turkeyWeight', 'Turkey Weight')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={t('tools.turkeyThawing.enterWeight', 'Enter weight')}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className="flex">
              <button
                onClick={() => setWeightUnit('lbs')}
                className={`px-4 py-2 rounded-l-lg ${weightUnit === 'lbs' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
              >
                lbs
              </button>
              <button
                onClick={() => setWeightUnit('kg')}
                className={`px-4 py-2 rounded-r-lg ${weightUnit === 'kg' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
              >
                kg
              </button>
            </div>
          </div>
          {/* Quick weight buttons */}
          <div className="flex gap-2 flex-wrap">
            {[8, 12, 16, 20, 24].map((w) => (
              <button
                key={w}
                onClick={() => { setWeight(w.toString()); setWeightUnit('lbs'); }}
                className={`px-3 py-1 text-sm rounded-lg ${parseFloat(weight) === w && weightUnit === 'lbs' ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {w} lbs
              </button>
            ))}
          </div>
        </div>

        {/* Thawing Method Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Snowflake className="w-4 h-4 inline mr-1" />
            {t('tools.turkeyThawing.thawingMethod', 'Thawing Method')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(thawMethods) as ThawMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setThawMethod(m)}
                className={`py-2 px-3 rounded-lg text-sm ${thawMethod === m ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {thawMethods[m].name}
              </button>
            ))}
          </div>
        </div>

        {/* Method Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name} Thawing</h4>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{config.description}</p>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.instructions.map((instruction, index) => (
              <li key={index}>- {instruction}</li>
            ))}
          </ul>
        </div>

        {/* Stuffed vs Unstuffed Toggle */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.turkeyThawing.roastingStyle', 'Roasting Style')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsStuffed(false)}
              className={`flex-1 py-2 rounded-lg ${!isStuffed ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.turkeyThawing.unstuffed', 'Unstuffed')}
            </button>
            <button
              onClick={() => setIsStuffed(true)}
              className={`flex-1 py-2 rounded-lg ${isStuffed ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.turkeyThawing.stuffed', 'Stuffed')}
            </button>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {isStuffed ? t('tools.turkeyThawing.stuffedTurkeysRequireLongerCooking', 'Stuffed turkeys require longer cooking time') : t('tools.turkeyThawing.unstuffedTurkeysCookFasterAnd', 'Unstuffed turkeys cook faster and more evenly')}
          </p>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Snowflake className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.turkeyThawing.thawTime', 'Thaw Time')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.thawTimeFormatted}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {thawMethod === 'refrigerator' ? t('tools.turkeyThawing.startThawingInAdvance', 'Start thawing in advance') : t('tools.turkeyThawing.activeThawingRequired', 'Active thawing required')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.turkeyThawing.roastTime', 'Roast Time')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.roastTimeFormatted}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              At 325F (163C) - {isStuffed ? t('tools.turkeyThawing.stuffed2', 'Stuffed') : t('tools.turkeyThawing.unstuffed2', 'Unstuffed')}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.turkeyThawing.servings', 'Servings')}</span>
            </div>
            <div className="text-2xl font-bold text-green-500">~{calculations.servings} people</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Based on {calculations.weightInPounds} lbs
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.turkeyThawing.safeTemp', 'Safe Temp')}</span>
            </div>
            <div className="text-2xl font-bold text-red-500">{calculations.internalTemp}F</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.turkeyThawing.74cInternalTemperature', '74C internal temperature')}
            </div>
          </div>
        </div>

        {/* Food Safety Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-5 h-5 mt-0.5 text-red-500`} />
            <div>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.turkeyThawing.foodSafetyTips', 'Food Safety Tips')}</h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {safetyTips.map((tip, index) => (
                  <li key={index}>- {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.turkeyThawing.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Plan for 1-1.5 lbs of turkey per person</li>
                <li>- Remove neck and giblets before cooking</li>
                <li>- Baste every 30-45 minutes for crispy skin</li>
                <li>- Tent with foil if browning too quickly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurkeyThawingTool;
