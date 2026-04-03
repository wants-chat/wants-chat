import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, DollarSign, Zap, Clock, TrendingDown, Info, Leaf } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface LightBulbSavingsToolProps {
  uiConfig?: UIConfig;
}

interface BulbType {
  id: string;
  name: string;
  watts: number;
  lumens: number;
  lifespan: number; // hours
  costPerBulb: number;
  color: string;
}

const bulbTypes: BulbType[] = [
  { id: 'incandescent', name: 'Incandescent', watts: 60, lumens: 800, lifespan: 1000, costPerBulb: 1, color: 'bg-yellow-500' },
  { id: 'halogen', name: 'Halogen', watts: 43, lumens: 800, lifespan: 2000, costPerBulb: 2, color: 'bg-orange-500' },
  { id: 'cfl', name: 'CFL', watts: 13, lumens: 800, lifespan: 8000, costPerBulb: 3, color: 'bg-blue-500' },
  { id: 'led', name: 'LED', watts: 9, lumens: 800, lifespan: 25000, costPerBulb: 5, color: 'bg-green-500' },
];

export const LightBulbSavingsTool: React.FC<LightBulbSavingsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentBulbType, setCurrentBulbType] = useState('incandescent');
  const [newBulbType, setNewBulbType] = useState('led');
  const [numberOfBulbs, setNumberOfBulbs] = useState('10');
  const [hoursPerDay, setHoursPerDay] = useState('5');
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [calculationPeriod, setCalculationPeriod] = useState<'yearly' | '5year' | '10year'>('yearly');

  const calculations = useMemo(() => {
    const currentBulb = bulbTypes.find((b) => b.id === currentBulbType)!;
    const newBulb = bulbTypes.find((b) => b.id === newBulbType)!;
    const bulbs = parseInt(numberOfBulbs) || 0;
    const hours = parseFloat(hoursPerDay) || 0;
    const rate = parseFloat(electricityRate) || 0.12;

    const hoursPerYear = hours * 365;
    const periodYears = calculationPeriod === 'yearly' ? 1 : calculationPeriod === '5year' ? 5 : 10;
    const totalHours = hoursPerYear * periodYears;

    // Energy calculations
    const currentKwhPerYear = (currentBulb.watts * hoursPerYear * bulbs) / 1000;
    const newKwhPerYear = (newBulb.watts * hoursPerYear * bulbs) / 1000;
    const kwhSavingsPerYear = currentKwhPerYear - newKwhPerYear;

    // Cost calculations per year
    const currentEnergyCostPerYear = currentKwhPerYear * rate;
    const newEnergyCostPerYear = newKwhPerYear * rate;
    const energySavingsPerYear = currentEnergyCostPerYear - newEnergyCostPerYear;

    // Bulb replacement calculations
    const currentBulbsPerYear = (hoursPerYear / currentBulb.lifespan) * bulbs;
    const newBulbsPerYear = (hoursPerYear / newBulb.lifespan) * bulbs;
    const currentBulbCostPerYear = currentBulbsPerYear * currentBulb.costPerBulb;
    const newBulbCostPerYear = newBulbsPerYear * newBulb.costPerBulb;
    const bulbCostSavingsPerYear = currentBulbCostPerYear - newBulbCostPerYear;

    // Total savings per year
    const totalSavingsPerYear = energySavingsPerYear + bulbCostSavingsPerYear;

    // Period totals
    const totalKwhSavings = kwhSavingsPerYear * periodYears;
    const totalEnergySavings = energySavingsPerYear * periodYears;
    const totalBulbSavings = bulbCostSavingsPerYear * periodYears;
    const totalSavings = totalSavingsPerYear * periodYears;

    // Initial investment for new bulbs
    const initialInvestment = bulbs * newBulb.costPerBulb;

    // Payback period (months)
    const paybackMonths = totalSavingsPerYear > 0 ? (initialInvestment / totalSavingsPerYear) * 12 : 0;

    // Energy reduction percentage
    const energyReduction = currentBulb.watts > 0 ? ((currentBulb.watts - newBulb.watts) / currentBulb.watts) * 100 : 0;

    // CO2 savings (0.92 lbs per kWh)
    const co2SavingsLbs = totalKwhSavings * 0.92;

    return {
      currentBulb,
      newBulb,
      currentKwhPerYear,
      newKwhPerYear,
      kwhSavingsPerYear,
      currentEnergyCostPerYear,
      newEnergyCostPerYear,
      energySavingsPerYear,
      currentBulbsPerYear,
      newBulbsPerYear,
      currentBulbCostPerYear,
      newBulbCostPerYear,
      bulbCostSavingsPerYear,
      totalSavingsPerYear,
      totalKwhSavings,
      totalEnergySavings,
      totalBulbSavings,
      totalSavings,
      initialInvestment,
      paybackMonths,
      energyReduction,
      co2SavingsLbs,
      periodYears,
    };
  }, [currentBulbType, newBulbType, numberOfBulbs, hoursPerDay, electricityRate, calculationPeriod]);

  const BulbCard = ({ bulb, isSelected, onSelect, label }: { bulb: BulbType; isSelected: boolean; onSelect: () => void; label: string }) => (
    <button
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? `border-[#0D9488] ${isDark ? 'bg-[#0D9488]/20' : 'bg-teal-50'}`
          : isDark
          ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-full ${bulb.color} flex items-center justify-center`}>
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{bulb.name}</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
        </div>
      </div>
      <div className={`grid grid-cols-2 gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <div>
          <span className="font-medium">{bulb.watts}W</span> power
        </div>
        <div>
          <span className="font-medium">{bulb.lumens}</span> lumens
        </div>
        <div>
          <span className="font-medium">{(bulb.lifespan / 1000).toFixed(0)}k</span> hrs life
        </div>
        <div>
          <span className="font-medium">${bulb.costPerBulb}</span> /bulb
        </div>
      </div>
    </button>
  );

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Lightbulb className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lightBulbSavings.lightBulbSavingsCalculator', 'Light Bulb Savings Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lightBulbSavings.compareLedVsIncandescentSavings', 'Compare LED vs incandescent savings')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bulb Selection */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.lightBulbSavings.currentBulbType', 'Current Bulb Type')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bulbTypes.map((bulb) => (
                <BulbCard
                  key={bulb.id}
                  bulb={bulb}
                  isSelected={currentBulbType === bulb.id}
                  onSelect={() => setCurrentBulbType(bulb.id)}
                  label="Current"
                />
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.lightBulbSavings.replaceWith', 'Replace With')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bulbTypes.map((bulb) => (
                <BulbCard
                  key={bulb.id}
                  bulb={bulb}
                  isSelected={newBulbType === bulb.id}
                  onSelect={() => setNewBulbType(bulb.id)}
                  label="New"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Usage Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.lightBulbSavings.numberOfBulbs', 'Number of Bulbs')}
            </label>
            <input
              type="number"
              value={numberOfBulbs}
              onChange={(e) => setNumberOfBulbs(e.target.value)}
              placeholder="10"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.lightBulbSavings.hoursPerDay', 'Hours per Day')}
            </label>
            <input
              type="number"
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              placeholder="5"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.lightBulbSavings.rateKwh', 'Rate ($/kWh)')}
            </label>
            <input
              type="number"
              step="0.01"
              value={electricityRate}
              onChange={(e) => setElectricityRate(e.target.value)}
              placeholder="0.12"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.lightBulbSavings.timePeriod', 'Time Period')}
            </label>
            <select
              value={calculationPeriod}
              onChange={(e) => setCalculationPeriod(e.target.value as any)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            >
              <option value="yearly">1 Year</option>
              <option value="5year">5 Years</option>
              <option value="10year">10 Years</option>
            </select>
          </div>
        </div>

        {/* Comparison Results */}
        <div className={`p-4 rounded-lg ${isDark ? t('tools.lightBulbSavings.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingDown className="w-4 h-4 text-[#0D9488]" />
            {calculations.periodYears} Year Savings Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lightBulbSavings.energySavings', 'Energy Savings')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.totalEnergySavings.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.totalKwhSavings.toFixed(0)} kWh saved</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lightBulbSavings.bulbSavings', 'Bulb Savings')}</div>
              <div className="text-xl font-bold text-[#0D9488]">${calculations.totalBulbSavings.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.lightBulbSavings.fewerReplacements', 'Fewer replacements')}</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lightBulbSavings.totalSavings', 'Total Savings')}</div>
              <div className="text-2xl font-bold text-green-500">${calculations.totalSavings.toFixed(2)}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Over {calculations.periodYears} year(s)</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lightBulbSavings.paybackPeriod', 'Payback Period')}</div>
              <div className="text-xl font-bold text-[#0D9488]">{calculations.paybackMonths.toFixed(1)} mo</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>${calculations.initialInvestment} investment</div>
            </div>
          </div>
        </div>

        {/* Detailed Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lightBulbSavings.annualCostComparison', 'Annual Cost Comparison')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Bulb */}
            <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full ${calculations.currentBulb.color} flex items-center justify-center`}>
                  <Lightbulb className="w-3 h-3 text-white" />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.currentBulb.name}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lightBulbSavings.energyCostYear', 'Energy Cost/Year')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.currentEnergyCostPerYear.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lightBulbSavings.bulbReplacementsYear', 'Bulb Replacements/Year')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.currentBulbsPerYear.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lightBulbSavings.bulbCostYear', 'Bulb Cost/Year')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.currentBulbCostPerYear.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lightBulbSavings.totalYear', 'Total/Year')}</span>
                  <span className="font-bold text-red-500">${(calculations.currentEnergyCostPerYear + calculations.currentBulbCostPerYear).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* New Bulb */}
            <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full ${calculations.newBulb.color} flex items-center justify-center`}>
                  <Lightbulb className="w-3 h-3 text-white" />
                </div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.newBulb.name}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lightBulbSavings.energyCostYear2', 'Energy Cost/Year')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.newEnergyCostPerYear.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lightBulbSavings.bulbReplacementsYear2', 'Bulb Replacements/Year')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.newBulbsPerYear.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lightBulbSavings.bulbCostYear2', 'Bulb Cost/Year')}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${calculations.newBulbCostPerYear.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lightBulbSavings.totalYear2', 'Total/Year')}</span>
                  <span className="font-bold text-green-500">${(calculations.newEnergyCostPerYear + calculations.newBulbCostPerYear).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Reduction Visual */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Zap className="w-4 h-4 text-[#0D9488]" />
            {t('tools.lightBulbSavings.energyReduction', 'Energy Reduction')}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{calculations.currentBulb.watts}W to {calculations.newBulb.watts}W</span>
              <span className="font-bold text-green-500">{calculations.energyReduction.toFixed(0)}% reduction</span>
            </div>
            <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-[#0D9488] to-green-500 rounded-full transition-all"
                style={{ width: `${calculations.energyReduction}%` }}
              />
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <Leaf className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h4 className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>{t('tools.lightBulbSavings.environmentalImpact', 'Environmental Impact')}</h4>
          </div>
          <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            By switching, you'll prevent <span className="font-bold">{calculations.co2SavingsLbs.toFixed(0)} lbs</span> of CO2 emissions over {calculations.periodYears} year(s).
            That's equivalent to planting <span className="font-bold">{Math.round(calculations.co2SavingsLbs / 48)}</span> trees!
          </p>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.lightBulbSavings.tipsForMaximumSavings', 'Tips for Maximum Savings:')}</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>{t('tools.lightBulbSavings.replaceHighestUsageBulbsFirst', 'Replace highest-usage bulbs first for immediate impact')}</li>
                <li>{t('tools.lightBulbSavings.lookForEnergyStarCertified', 'Look for ENERGY STAR certified LEDs for quality assurance')}</li>
                <li>{t('tools.lightBulbSavings.considerSmartLedsForAdditional', 'Consider smart LEDs for additional control and automation')}</li>
                <li>{t('tools.lightBulbSavings.warmWhite2700kLedsProvide', 'Warm white (2700K) LEDs provide similar ambiance to incandescents')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightBulbSavingsTool;
