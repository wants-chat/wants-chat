import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, TrendingUp, Ruler, Scale, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BabyGrowthChartToolProps {
  uiConfig?: UIConfig;
}

type Gender = 'male' | 'female';
type MeasurementType = 'weight' | 'length' | 'headCircumference';

interface GrowthData {
  percentile: number;
  status: string;
  interpretation: string;
  percentileRange: { low: number; high: number };
}

// WHO Growth Standards (simplified LMS data)
const whoGrowthData = {
  weight: {
    male: {
      0: { L: 0.3487, M: 3.3464, S: 0.14602 },
      1: { L: 0.2297, M: 4.4709, S: 0.13395 },
      2: { L: 0.1970, M: 5.5675, S: 0.12385 },
      3: { L: 0.1738, M: 6.3762, S: 0.11727 },
      4: { L: 0.1553, M: 7.0023, S: 0.11316 },
      5: { L: 0.1395, M: 7.5105, S: 0.11080 },
      6: { L: 0.1257, M: 7.9340, S: 0.10958 },
      9: { L: 0.0956, M: 8.9014, S: 0.10850 },
      12: { L: 0.0693, M: 9.6479, S: 0.10983 },
      18: { L: 0.0343, M: 10.8478, S: 0.11420 },
      24: { L: 0.0095, M: 12.1515, S: 0.11820 },
      36: { L: -0.0250, M: 14.3441, S: 0.12270 },
    },
    female: {
      0: { L: 0.3809, M: 3.2322, S: 0.14171 },
      1: { L: 0.1714, M: 4.1873, S: 0.13724 },
      2: { L: 0.0962, M: 5.1282, S: 0.12879 },
      3: { L: 0.0402, M: 5.8458, S: 0.12393 },
      4: { L: -0.0050, M: 6.4237, S: 0.12130 },
      5: { L: -0.0430, M: 6.8985, S: 0.12001 },
      6: { L: -0.0758, M: 7.2970, S: 0.11947 },
      9: { L: -0.1424, M: 8.2034, S: 0.12017 },
      12: { L: -0.1900, M: 8.9481, S: 0.12210 },
      18: { L: -0.2460, M: 10.2378, S: 0.12550 },
      24: { L: -0.2860, M: 11.5340, S: 0.12790 },
      36: { L: -0.3200, M: 13.8720, S: 0.13100 },
    },
  },
  length: {
    male: {
      0: { L: 1.0, M: 49.8842, S: 0.03795 },
      1: { L: 1.0, M: 54.7244, S: 0.03558 },
      2: { L: 1.0, M: 58.4249, S: 0.03424 },
      3: { L: 1.0, M: 61.4292, S: 0.03328 },
      4: { L: 1.0, M: 63.8860, S: 0.03257 },
      5: { L: 1.0, M: 65.9026, S: 0.03204 },
      6: { L: 1.0, M: 67.6236, S: 0.03165 },
      9: { L: 1.0, M: 72.0319, S: 0.03101 },
      12: { L: 1.0, M: 75.7488, S: 0.03068 },
      18: { L: 1.0, M: 82.2991, S: 0.03042 },
      24: { L: 1.0, M: 87.8161, S: 0.03028 },
      36: { L: 1.0, M: 96.0950, S: 0.03010 },
    },
    female: {
      0: { L: 1.0, M: 49.1477, S: 0.03790 },
      1: { L: 1.0, M: 53.6872, S: 0.03610 },
      2: { L: 1.0, M: 57.0673, S: 0.03514 },
      3: { L: 1.0, M: 59.8029, S: 0.03451 },
      4: { L: 1.0, M: 62.0899, S: 0.03405 },
      5: { L: 1.0, M: 64.0301, S: 0.03370 },
      6: { L: 1.0, M: 65.7311, S: 0.03344 },
      9: { L: 1.0, M: 70.1435, S: 0.03298 },
      12: { L: 1.0, M: 74.0015, S: 0.03271 },
      18: { L: 1.0, M: 80.7151, S: 0.03245 },
      24: { L: 1.0, M: 86.4153, S: 0.03232 },
      36: { L: 1.0, M: 95.0820, S: 0.03200 },
    },
  },
  headCircumference: {
    male: {
      0: { L: 1.0, M: 34.4618, S: 0.03686 },
      1: { L: 1.0, M: 37.2759, S: 0.03133 },
      2: { L: 1.0, M: 39.1285, S: 0.02997 },
      3: { L: 1.0, M: 40.5135, S: 0.02918 },
      4: { L: 1.0, M: 41.6317, S: 0.02868 },
      5: { L: 1.0, M: 42.5576, S: 0.02837 },
      6: { L: 1.0, M: 43.3306, S: 0.02817 },
      9: { L: 1.0, M: 45.1900, S: 0.02787 },
      12: { L: 1.0, M: 46.4990, S: 0.02773 },
      18: { L: 1.0, M: 47.9670, S: 0.02762 },
      24: { L: 1.0, M: 48.9720, S: 0.02755 },
      36: { L: 1.0, M: 50.1300, S: 0.02750 },
    },
    female: {
      0: { L: 1.0, M: 33.8787, S: 0.03496 },
      1: { L: 1.0, M: 36.5463, S: 0.03114 },
      2: { L: 1.0, M: 38.2521, S: 0.02991 },
      3: { L: 1.0, M: 39.5328, S: 0.02921 },
      4: { L: 1.0, M: 40.5817, S: 0.02874 },
      5: { L: 1.0, M: 41.4590, S: 0.02842 },
      6: { L: 1.0, M: 42.1995, S: 0.02819 },
      9: { L: 1.0, M: 43.9100, S: 0.02787 },
      12: { L: 1.0, M: 45.1880, S: 0.02770 },
      18: { L: 1.0, M: 46.6590, S: 0.02758 },
      24: { L: 1.0, M: 47.6700, S: 0.02750 },
      36: { L: 1.0, M: 48.9500, S: 0.02745 },
    },
  },
};

const calculatePercentile = (value: number, L: number, M: number, S: number): number => {
  if (L === 0) {
    const z = Math.log(value / M) / S;
    return normalCDF(z) * 100;
  }
  const z = (Math.pow(value / M, L) - 1) / (L * S);
  return normalCDF(z) * 100;
};

const normalCDF = (z: number): number => {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
};

export const BabyGrowthChartTool: React.FC<BabyGrowthChartToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [gender, setGender] = useState<Gender>('male');
  const [ageMonths, setAgeMonths] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [lengthUnit, setLengthUnit] = useState<'cm' | 'in'>('cm');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        // Try to extract numbers for weight/length
        const numbers = params.content.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          setWeight(numbers[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const getClosestAgeKey = (months: number): number => {
    const ageKeys = [0, 1, 2, 3, 4, 5, 6, 9, 12, 18, 24, 36];
    return ageKeys.reduce((prev, curr) =>
      Math.abs(curr - months) < Math.abs(prev - months) ? curr : prev
    );
  };

  const calculateGrowthData = (
    value: number,
    type: MeasurementType,
    ageInMonths: number
  ): GrowthData | null => {
    const ageKey = getClosestAgeKey(ageInMonths);
    const data = whoGrowthData[type][gender][ageKey as keyof typeof whoGrowthData.weight.male];

    if (!data) return null;

    const percentile = calculatePercentile(value, data.L, data.M, data.S);

    let status: string;
    let interpretation: string;

    if (percentile < 3) {
      status = 'Very Low';
      interpretation = `Below the 3rd percentile. This may indicate a need for further evaluation.`;
    } else if (percentile < 15) {
      status = 'Low';
      interpretation = `Between the 3rd and 15th percentile. On the lower end but may be normal.`;
    } else if (percentile < 85) {
      status = 'Normal';
      interpretation = `Between the 15th and 85th percentile. This is within the healthy range.`;
    } else if (percentile < 97) {
      status = 'High';
      interpretation = `Between the 85th and 97th percentile. On the higher end but often normal.`;
    } else {
      status = 'Very High';
      interpretation = `Above the 97th percentile. May warrant discussion with a pediatrician.`;
    }

    return {
      percentile: Math.round(percentile * 10) / 10,
      status,
      interpretation,
      percentileRange: { low: Math.max(0, percentile - 5), high: Math.min(100, percentile + 5) },
    };
  };

  const convertWeight = (value: number, from: 'kg' | 'lb'): number => {
    return from === 'lb' ? value * 0.453592 : value;
  };

  const convertLength = (value: number, from: 'cm' | 'in'): number => {
    return from === 'in' ? value * 2.54 : value;
  };

  const results = useMemo(() => {
    const age = parseFloat(ageMonths);
    if (isNaN(age) || age < 0 || age > 36) return null;

    const weightValue = parseFloat(weight);
    const lengthValue = parseFloat(length);
    const headValue = parseFloat(headCircumference);

    return {
      weight: !isNaN(weightValue) && weightValue > 0
        ? calculateGrowthData(convertWeight(weightValue, weightUnit), 'weight', age)
        : null,
      length: !isNaN(lengthValue) && lengthValue > 0
        ? calculateGrowthData(convertLength(lengthValue, lengthUnit), 'length', age)
        : null,
      headCircumference: !isNaN(headValue) && headValue > 0
        ? calculateGrowthData(convertLength(headValue, lengthUnit), 'headCircumference', age)
        : null,
    };
  }, [ageMonths, weight, length, headCircumference, gender, weightUnit, lengthUnit]);

  const getPercentileColor = (percentile: number) => {
    if (percentile < 3 || percentile > 97) return 'text-red-500';
    if (percentile < 15 || percentile > 85) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Very Low':
      case 'Very High':
        return isDark ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-700 border-red-200';
      case 'Low':
      case 'High':
        return isDark ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return isDark ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const renderPercentileBar = (percentile: number) => (
    <div className="relative h-4 mt-2">
      <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
        <div className="absolute inset-0 flex">
          <div className="w-[3%] bg-red-400/30 rounded-l-full" />
          <div className="w-[12%] bg-yellow-400/30" />
          <div className="flex-1 bg-green-400/30" />
          <div className="w-[12%] bg-yellow-400/30" />
          <div className="w-[3%] bg-red-400/30 rounded-r-full" />
        </div>
      </div>
      <div
        className="absolute top-0 w-3 h-4 bg-[#0D9488] rounded-full transform -translate-x-1/2 shadow-lg"
        style={{ left: `${Math.min(100, Math.max(0, percentile))}%` }}
      />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.babyGrowthChart.babyGrowthChart', 'Baby Growth Chart')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.babyGrowthChart.calculatePercentilesBasedOnWho', 'Calculate percentiles based on WHO growth standards')}
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
                  {t('tools.babyGrowthChart.dataLoadedFromYourConversation', 'Data loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.babyGrowthChart.gender', 'Gender')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    gender === 'male'
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.babyGrowthChart.male', 'Male')}
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    gender === 'female'
                      ? 'bg-pink-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.babyGrowthChart.female', 'Female')}
                </button>
              </div>
            </div>

            {/* Age Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.babyGrowthChart.ageMonths', 'Age (months)')}
              </label>
              <input
                type="number"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
                min="0"
                max="36"
                placeholder="0-36 months"
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
                <Scale className="w-4 h-4 inline mr-1" />
                {t('tools.babyGrowthChart.weight2', 'Weight')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  step="0.1"
                  placeholder={weightUnit === 'kg' ? 'e.g., 7.5' : 'e.g., 16.5'}
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

            {/* Length Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                {t('tools.babyGrowthChart.lengthHeight2', 'Length/Height')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  step="0.1"
                  placeholder={lengthUnit === 'cm' ? 'e.g., 65' : 'e.g., 25.5'}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <select
                  value={lengthUnit}
                  onChange={(e) => setLengthUnit(e.target.value as 'cm' | 'in')}
                  className={`px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
            </div>

            {/* Head Circumference Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Baby className="w-4 h-4 inline mr-1" />
                {t('tools.babyGrowthChart.headCircumference2', 'Head Circumference')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={headCircumference}
                  onChange={(e) => setHeadCircumference(e.target.value)}
                  step="0.1"
                  placeholder={lengthUnit === 'cm' ? 'e.g., 42' : 'e.g., 16.5'}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <span className={`px-4 py-3 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}>
                  {lengthUnit}
                </span>
              </div>
            </div>

            {/* Results */}
            {results && (results.weight || results.length || results.headCircumference) && (
              <div className="space-y-4">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.babyGrowthChart.growthPercentiles', 'Growth Percentiles')}
                </h4>

                {results.weight && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#0D9488]" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.babyGrowthChart.weight', 'Weight')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getPercentileColor(results.weight.percentile)}`}>
                          {results.weight.percentile}%
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadgeColor(results.weight.status)}`}>
                          {results.weight.status}
                        </span>
                      </div>
                    </div>
                    {renderPercentileBar(results.weight.percentile)}
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {results.weight.interpretation}
                    </p>
                  </div>
                )}

                {results.length && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-[#0D9488]" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.babyGrowthChart.lengthHeight', 'Length/Height')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getPercentileColor(results.length.percentile)}`}>
                          {results.length.percentile}%
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadgeColor(results.length.status)}`}>
                          {results.length.status}
                        </span>
                      </div>
                    </div>
                    {renderPercentileBar(results.length.percentile)}
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {results.length.interpretation}
                    </p>
                  </div>
                )}

                {results.headCircumference && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-[#0D9488]" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.babyGrowthChart.headCircumference', 'Head Circumference')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getPercentileColor(results.headCircumference.percentile)}`}>
                          {results.headCircumference.percentile}%
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadgeColor(results.headCircumference.status)}`}>
                          {results.headCircumference.status}
                        </span>
                      </div>
                    </div>
                    {renderPercentileBar(results.headCircumference.percentile)}
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {results.headCircumference.interpretation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.babyGrowthChart.percentilesAreBasedOnWho', 'Percentiles are based on WHO Child Growth Standards (0-36 months). A percentile shows how your baby compares to other children of the same age and gender. Always consult your pediatrician for proper evaluation.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyGrowthChartTool;
