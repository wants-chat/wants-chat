import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, DollarSign, Droplets, Zap, Sparkles, Info, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type WashLocation = 'home' | 'laundromat' | 'dryClean';

interface LaundryCostToolProps {
  uiConfig?: UIConfig;
}

export const LaundryCostTool: React.FC<LaundryCostToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [location, setLocation] = useState<WashLocation>('home');
  const [loadsPerWeek, setLoadsPerWeek] = useState('4');
  const [waterCostPerGallon, setWaterCostPerGallon] = useState('0.005');
  const [electricityCostPerKwh, setElectricityCostPerKwh] = useState('0.12');
  const [gasCostPerTherm, setGasCostPerTherm] = useState('1.50');
  const [detergentCostPerLoad, setDetergentCostPerLoad] = useState('0.25');
  const [usesGasDryer, setUsesGasDryer] = useState(false);
  const [laundromatWashCost, setLaundromatWashCost] = useState('3.00');
  const [laundromatDryCost, setLaundromatDryCost] = useState('2.50');
  const [dryCleanCostPerItem, setDryCleanCostPerItem] = useState('6.00');
  const [dryCleanItemsPerWeek, setDryCleanItemsPerWeek] = useState('3');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.location) {
        setLocation(params.location as WashLocation);
        setIsPrefilled(true);
      }
      if (params.loadsPerWeek !== undefined) {
        setLoadsPerWeek(String(params.loadsPerWeek));
        setIsPrefilled(true);
      }
      if (params.electricityCost !== undefined) {
        setElectricityCostPerKwh(String(params.electricityCost));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const loads = parseFloat(loadsPerWeek) || 0;
    const waterCost = parseFloat(waterCostPerGallon) || 0;
    const electricCost = parseFloat(electricityCostPerKwh) || 0;
    const gasCost = parseFloat(gasCostPerTherm) || 0;
    const detergentCost = parseFloat(detergentCostPerLoad) || 0;
    const laundromatWash = parseFloat(laundromatWashCost) || 0;
    const laundromatDry = parseFloat(laundromatDryCost) || 0;
    const dryCleanCost = parseFloat(dryCleanCostPerItem) || 0;
    const dryCleanItems = parseFloat(dryCleanItemsPerWeek) || 0;

    // Home washing estimates (per load)
    const gallonsPerLoad = 20; // Average modern washer
    const washerKwhPerLoad = 0.5; // Energy Star washer
    const electricDryerKwhPerLoad = 3.0;
    const gasDryerThermPerLoad = 0.11;

    // Calculate home costs per load
    const homeWaterCost = gallonsPerLoad * waterCost;
    const homeWasherEnergy = washerKwhPerLoad * electricCost;
    const homeDryerEnergy = usesGasDryer
      ? gasDryerThermPerLoad * gasCost
      : electricDryerKwhPerLoad * electricCost;
    const homeCostPerLoad = homeWaterCost + homeWasherEnergy + homeDryerEnergy + detergentCost;

    // Weekly costs
    const homeWeekly = homeCostPerLoad * loads;
    const laundromatWeekly = (laundromatWash + laundromatDry) * loads;
    const dryCleanWeekly = dryCleanCost * dryCleanItems;

    // Monthly and yearly calculations
    const weeksPerMonth = 4.33;
    const weeksPerYear = 52;

    let currentWeeklyCost: number;
    let currentMonthlyCost: number;
    let currentYearlyCost: number;
    let breakdown: { label: string; amount: number }[] = [];

    switch (location) {
      case 'home':
        currentWeeklyCost = homeWeekly;
        breakdown = [
          { label: 'Water', amount: homeWaterCost * loads },
          { label: 'Washer Energy', amount: homeWasherEnergy * loads },
          { label: 'Dryer Energy', amount: homeDryerEnergy * loads },
          { label: 'Detergent', amount: detergentCost * loads },
        ];
        break;
      case 'laundromat':
        currentWeeklyCost = laundromatWeekly;
        breakdown = [
          { label: 'Wash Cycles', amount: laundromatWash * loads },
          { label: 'Dry Cycles', amount: laundromatDry * loads },
        ];
        break;
      case 'dryClean':
        currentWeeklyCost = dryCleanWeekly;
        breakdown = [
          { label: 'Dry Cleaning', amount: dryCleanCost * dryCleanItems },
        ];
        break;
    }

    currentMonthlyCost = currentWeeklyCost * weeksPerMonth;
    currentYearlyCost = currentWeeklyCost * weeksPerYear;

    // Comparison costs
    const homeYearly = homeWeekly * weeksPerYear;
    const laundromatYearly = laundromatWeekly * weeksPerYear;

    return {
      weekly: currentWeeklyCost,
      monthly: currentMonthlyCost,
      yearly: currentYearlyCost,
      perLoad: location === 'home' ? homeCostPerLoad : location === 'laundromat' ? laundromatWash + laundromatDry : dryCleanCost,
      breakdown,
      comparison: {
        home: homeYearly,
        laundromat: laundromatYearly,
        savings: location === 'home' ? laundromatYearly - homeYearly : homeYearly - laundromatYearly,
      },
      environmentalImpact: {
        waterGallons: gallonsPerLoad * loads * weeksPerYear,
        energyKwh: (washerKwhPerLoad + (usesGasDryer ? 0 : electricDryerKwhPerLoad)) * loads * weeksPerYear,
      },
    };
  }, [location, loadsPerWeek, waterCostPerGallon, electricityCostPerKwh, gasCostPerTherm,
      detergentCostPerLoad, usesGasDryer, laundromatWashCost, laundromatDryCost,
      dryCleanCostPerItem, dryCleanItemsPerWeek]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Shirt className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCost.laundryCostCalculator', 'Laundry Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.laundryCost.calculateYourLaundryExpenses', 'Calculate your laundry expenses')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.laundryCost.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Location Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.laundryCost.whereDoYouDoLaundry', 'Where do you do laundry?')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'home', name: 'At Home', icon: '🏠' },
              { id: 'laundromat', name: 'Laundromat', icon: '🏪' },
              { id: 'dryClean', name: 'Dry Clean', icon: '👔' },
            ].map((loc) => (
              <button
                key={loc.id}
                onClick={() => setLocation(loc.id as WashLocation)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  location === loc.id
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xl">{loc.icon}</span>
                <span className="font-medium">{loc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Common Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calculator className="w-4 h-4 inline mr-1" />
            {location === 'dryClean' ? t('tools.laundryCost.itemsPerWeek', 'Items per Week') : t('tools.laundryCost.loadsPerWeek', 'Loads per Week')}
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={location === 'dryClean' ? dryCleanItemsPerWeek : loadsPerWeek}
            onChange={(e) => location === 'dryClean' ? setDryCleanItemsPerWeek(e.target.value) : setLoadsPerWeek(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Location-specific inputs */}
        {location === 'home' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Droplets className="w-4 h-4 inline mr-1" />
                  {t('tools.laundryCost.waterGallon', 'Water ($/gallon)')}
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={waterCostPerGallon}
                  onChange={(e) => setWaterCostPerGallon(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Zap className="w-4 h-4 inline mr-1" />
                  {t('tools.laundryCost.electricityKwh', 'Electricity ($/kWh)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={electricityCostPerKwh}
                  onChange={(e) => setElectricityCostPerKwh(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.laundryCost.detergentLoad', 'Detergent ($/load)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={detergentCostPerLoad}
                  onChange={(e) => setDetergentCostPerLoad(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.laundryCost.dryerType', 'Dryer Type')}
                </label>
                <button
                  onClick={() => setUsesGasDryer(!usesGasDryer)}
                  className={`w-full py-2 rounded-lg ${usesGasDryer ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {usesGasDryer ? t('tools.laundryCost.gasDryer', 'Gas Dryer') : t('tools.laundryCost.electricDryer', 'Electric Dryer')}
                </button>
              </div>
            </div>
            {usesGasDryer && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.laundryCost.gasCostTherm', 'Gas Cost ($/therm)')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={gasCostPerTherm}
                  onChange={(e) => setGasCostPerTherm(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            )}
          </div>
        )}

        {location === 'laundromat' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.laundryCost.washCostLoad', 'Wash Cost ($/load)')}
              </label>
              <input
                type="number"
                step="0.25"
                value={laundromatWashCost}
                onChange={(e) => setLaundromatWashCost(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.laundryCost.dryCostLoad', 'Dry Cost ($/load)')}
              </label>
              <input
                type="number"
                step="0.25"
                value={laundromatDryCost}
                onChange={(e) => setLaundromatDryCost(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        )}

        {location === 'dryClean' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.laundryCost.costPerItem', 'Cost per Item ($)')}
            </label>
            <input
              type="number"
              step="0.50"
              value={dryCleanCostPerItem}
              onChange={(e) => setDryCleanCostPerItem(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.laundryCost.annualLaundryCost', 'Annual Laundry Cost')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            ${calculations.yearly.toFixed(2)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            ${calculations.perLoad.toFixed(2)} per {location === 'dryClean' ? 'item' : 'load'}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.laundryCost.weekly', 'Weekly')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.weekly.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.laundryCost.monthly', 'Monthly')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.monthly.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Per {location === 'dryClean' ? t('tools.laundryCost.item', 'Item') : t('tools.laundryCost.load', 'Load')}</div>
            <div className="text-2xl font-bold text-teal-500">
              ${calculations.perLoad.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {calculations.breakdown.length > 0 && (
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCost.weeklyCostBreakdown', 'Weekly Cost Breakdown')}</h4>
            <div className="space-y-2">
              {calculations.breakdown.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                >
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison (Home vs Laundromat) */}
        {location !== 'dryClean' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.laundryCost.annualComparison', 'Annual Comparison')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${location === 'home' ? 'ring-2 ring-teal-500' : ''} ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.laundryCost.home', 'Home')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.comparison.home.toFixed(0)}/yr
                </div>
              </div>
              <div className={`p-3 rounded-lg ${location === 'laundromat' ? 'ring-2 ring-teal-500' : ''} ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.laundryCost.laundromat', 'Laundromat')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.comparison.laundromat.toFixed(0)}/yr
                </div>
              </div>
            </div>
            {calculations.comparison.savings > 0 && (
              <p className={`text-sm mt-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Potential savings: <span className="text-teal-500 font-medium">${calculations.comparison.savings.toFixed(0)}/year</span>
              </p>
            )}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.laundryCost.moneySavingTips', 'Money-Saving Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Wash with cold water to save energy</li>
                <li>- Run full loads only</li>
                <li>- Air dry when possible</li>
                <li>- Buy detergent in bulk</li>
                <li>- Clean dryer lint filter for efficiency</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaundryCostTool;
