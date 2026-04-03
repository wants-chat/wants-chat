import React, { useState, useMemo, useEffect } from 'react';
import { PawPrint, ArrowRightLeft, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PetAgeToolProps {
  uiConfig?: UIConfig;
}

type PetType = 'dog_small' | 'dog_medium' | 'dog_large' | 'cat';

export const PetAgeTool: React.FC<PetAgeToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [petType, setPetType] = useState<PetType>('dog_medium');
  const [petAge, setPetAge] = useState('5');
  const [mode, setMode] = useState<'toHuman' | 'toPet'>('toHuman');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from conversation
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setPetAge(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const petTypes = [
    { value: 'dog_small', label: 'Small Dog (<20 lbs)', icon: '🐕' },
    { value: 'dog_medium', label: 'Medium Dog (20-50 lbs)', icon: '🐕' },
    { value: 'dog_large', label: 'Large Dog (>50 lbs)', icon: '🦮' },
    { value: 'cat', label: 'Cat', icon: '🐱' },
  ];

  const calculateHumanAge = useMemo(() => {
    const age = parseFloat(petAge) || 0;
    if (age <= 0) return { humanAge: 0, lifeStage: 'Unknown' };

    let humanAge = 0;
    let lifeStage = '';

    if (petType === 'cat') {
      // Cat age calculation
      if (age <= 1) {
        humanAge = age * 15;
      } else if (age <= 2) {
        humanAge = 15 + (age - 1) * 9;
      } else {
        humanAge = 24 + (age - 2) * 4;
      }

      if (age < 1) lifeStage = 'Kitten';
      else if (age < 7) lifeStage = 'Adult';
      else if (age < 11) lifeStage = 'Mature';
      else if (age < 15) lifeStage = 'Senior';
      else lifeStage = 'Geriatric';
    } else {
      // Dog age calculation (varies by size)
      const firstYear = petType === 'dog_large' ? 12 : 15;
      const secondYear = petType === 'dog_large' ? 9 : petType === 'dog_small' ? 9 : 9;
      const subsequentYears = petType === 'dog_large' ? 8 : petType === 'dog_small' ? 4 : 5;

      if (age <= 1) {
        humanAge = age * firstYear;
      } else if (age <= 2) {
        humanAge = firstYear + (age - 1) * secondYear;
      } else {
        humanAge = firstYear + secondYear + (age - 2) * subsequentYears;
      }

      if (age < 1) lifeStage = 'Puppy';
      else if (age < 2) lifeStage = 'Adolescent';
      else if (age < 7) lifeStage = 'Adult';
      else if (age < 10) lifeStage = 'Senior';
      else lifeStage = 'Geriatric';
    }

    return { humanAge: Math.round(humanAge), lifeStage };
  }, [petAge, petType]);

  const calculatePetAge = useMemo(() => {
    const humanYears = parseFloat(petAge) || 0;
    if (humanYears <= 0) return 0;

    // Reverse calculation (approximate)
    let petYears = 0;

    if (petType === 'cat') {
      if (humanYears <= 15) {
        petYears = humanYears / 15;
      } else if (humanYears <= 24) {
        petYears = 1 + (humanYears - 15) / 9;
      } else {
        petYears = 2 + (humanYears - 24) / 4;
      }
    } else {
      const firstYear = petType === 'dog_large' ? 12 : 15;
      const secondYear = petType === 'dog_large' ? 9 : 9;
      const subsequentYears = petType === 'dog_large' ? 8 : petType === 'dog_small' ? 4 : 5;

      if (humanYears <= firstYear) {
        petYears = humanYears / firstYear;
      } else if (humanYears <= firstYear + secondYear) {
        petYears = 1 + (humanYears - firstYear) / secondYear;
      } else {
        petYears = 2 + (humanYears - firstYear - secondYear) / subsequentYears;
      }
    }

    return Math.max(0, petYears);
  }, [petAge, petType]);

  const ageComparison = [
    { pet: '1 year', dog_small: 15, dog_medium: 15, dog_large: 12, cat: 15 },
    { pet: '2 years', dog_small: 24, dog_medium: 24, dog_large: 21, cat: 24 },
    { pet: '5 years', dog_small: 36, dog_medium: 39, dog_large: 45, cat: 36 },
    { pet: '10 years', dog_small: 56, dog_medium: 64, dog_large: 85, cat: 56 },
    { pet: '15 years', dog_small: 76, dog_medium: 89, dog_large: 125, cat: 76 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <PawPrint className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.petAge.petAgeCalculator', 'Pet Age Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.petAge.convertPetYearsToHuman', 'Convert pet years to human years')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.petAge.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${mode === 'toHuman' ? isDark ? 'text-orange-400' : 'text-orange-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.petAge.petHuman', 'Pet → Human')}
          </span>
          <button
            onClick={() => setMode(mode === 'toHuman' ? t('tools.petAge.topet', 'toPet') : t('tools.petAge.tohuman', 'toHuman'))}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <ArrowRightLeft className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <span className={`text-sm font-medium ${mode === 'toPet' ? isDark ? 'text-orange-400' : 'text-orange-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('tools.petAge.humanPet', 'Human → Pet')}
          </span>
        </div>

        {/* Pet Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.petAge.petType', 'Pet Type')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {petTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setPetType(type.value as PetType)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  petType === type.value
                    ? 'bg-orange-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Age Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {mode === 'toHuman' ? t('tools.petAge.petAgeYears', 'Pet Age (years)') : t('tools.petAge.humanAgeYears', 'Human Age (years)')}
          </label>
          <input
            type="number"
            min="0"
            max="30"
            step="0.5"
            value={petAge}
            onChange={(e) => setPetAge(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border text-xl text-center ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-100'} border`}>
          {mode === 'toHuman' ? (
            <>
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                {t('tools.petAge.humanEquivalentAge', 'Human Equivalent Age')}
              </div>
              <div className={`text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculateHumanAge.humanAge} years
              </div>
              <div className={`text-lg ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                Life Stage: {calculateHumanAge.lifeStage}
              </div>
            </>
          ) : (
            <>
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                {t('tools.petAge.petEquivalentAge', 'Pet Equivalent Age')}
              </div>
              <div className={`text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculatePetAge.toFixed(1)} years
              </div>
              <div className={`text-lg ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                in {petType.includes('dog') ? 'dog' : 'cat'} years
              </div>
            </>
          )}
        </div>

        {/* Age Comparison Table */}
        <div className="space-y-3">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.petAge.ageComparisonChart', 'Age Comparison Chart')}
          </h4>
          <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                  <th className={`p-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.petAge.petAge', 'Pet Age')}</th>
                  <th className={`p-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.petAge.smallDog', 'Small Dog')}</th>
                  <th className={`p-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.petAge.medium', 'Medium')}</th>
                  <th className={`p-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.petAge.largeDog', 'Large Dog')}</th>
                  <th className={`p-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.petAge.cat', 'Cat')}</th>
                </tr>
              </thead>
              <tbody>
                {ageComparison.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? '' : isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'}>
                    <td className={`p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{row.pet}</td>
                    <td className={`p-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.dog_small}</td>
                    <td className={`p-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.dog_medium}</td>
                    <td className={`p-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.dog_large}</td>
                    <td className={`p-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.cat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.petAge.note', 'Note:')}</strong> The "7 years per human year" rule is a myth. Dogs age faster in their
            first years, and larger dogs tend to age faster than smaller ones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetAgeTool;
