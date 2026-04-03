import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, DollarSign, Calendar, TrendingDown, Info, Sparkles, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface DepreciationYear {
  year: number;
  value: number;
  depreciation: number;
  percentOfOriginal: number;
}

interface CarDepreciationToolProps {
  uiConfig?: UIConfig;
}

export const CarDepreciationTool: React.FC<CarDepreciationToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [purchasePrice, setPurchasePrice] = useState('35000');
  const [vehicleAge, setVehicleAge] = useState('0');
  const [vehicleType, setVehicleType] = useState<'sedan' | 'suv' | 'truck' | 'luxury' | 'sports' | 'economy'>('sedan');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [annualMileage, setAnnualMileage] = useState('12000');
  const [yearsToProject, setYearsToProject] = useState('10');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.price !== undefined || params.amount !== undefined) {
        setPurchasePrice(String(params.price || params.amount));
        setIsPrefilled(true);
      }
      if (params.age !== undefined || params.vehicleAge !== undefined) {
        setVehicleAge(String(params.age || params.vehicleAge));
        setIsPrefilled(true);
      }
      if (params.mileage !== undefined) {
        setAnnualMileage(String(params.mileage));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.price && !params.amount) {
        const priceMatch = textContent.match(/\$?([\d,]+(?:\.\d{2})?)/);
        if (priceMatch) {
          setPurchasePrice(priceMatch[1].replace(/,/g, ''));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Depreciation rates by vehicle type (first year, subsequent years)
  const depreciationRates: Record<string, { firstYear: number; subsequent: number }> = {
    sedan: { firstYear: 0.20, subsequent: 0.15 },
    suv: { firstYear: 0.18, subsequent: 0.14 },
    truck: { firstYear: 0.15, subsequent: 0.12 },
    luxury: { firstYear: 0.25, subsequent: 0.18 },
    sports: { firstYear: 0.22, subsequent: 0.16 },
    economy: { firstYear: 0.22, subsequent: 0.14 },
  };

  // Condition multipliers
  const conditionMultipliers: Record<string, number> = {
    excellent: 1.10,
    good: 1.00,
    fair: 0.85,
    poor: 0.70,
  };

  // Mileage impact (per 1000 miles over/under average 12000/year)
  const mileageImpact = 0.005; // 0.5% per 1000 miles deviation

  const calculations = useMemo(() => {
    const price = parseFloat(purchasePrice) || 0;
    const age = parseInt(vehicleAge) || 0;
    const projectionYears = parseInt(yearsToProject) || 10;
    const mileage = parseFloat(annualMileage) || 12000;
    const rates = depreciationRates[vehicleType];
    const conditionMult = conditionMultipliers[condition];

    const schedule: DepreciationYear[] = [];
    let currentValue = price;

    // Calculate current value based on age
    for (let y = 1; y <= age; y++) {
      const rate = y === 1 ? rates.firstYear : rates.subsequent;
      currentValue = currentValue * (1 - rate);
    }

    // Apply condition and mileage adjustments
    const mileageDeviation = (mileage - 12000) / 1000;
    const mileageAdjustment = 1 - (mileageDeviation * mileageImpact * age);
    currentValue = currentValue * conditionMult * Math.max(0.5, mileageAdjustment);

    const startingValue = currentValue;

    // Project future depreciation
    for (let year = 0; year <= projectionYears; year++) {
      const totalAge = age + year;
      if (year === 0) {
        schedule.push({
          year: totalAge,
          value: currentValue,
          depreciation: 0,
          percentOfOriginal: (currentValue / price) * 100,
        });
      } else {
        const rate = totalAge === 1 ? rates.firstYear : rates.subsequent;
        const prevValue = currentValue;
        currentValue = currentValue * (1 - rate);
        // Apply ongoing mileage adjustment
        currentValue = currentValue * (1 - (mileageDeviation > 0 ? mileageImpact * 0.1 : 0));

        schedule.push({
          year: totalAge,
          value: currentValue,
          depreciation: prevValue - currentValue,
          percentOfOriginal: (currentValue / price) * 100,
        });
      }
    }

    const totalDepreciation = price - currentValue;
    const yearlyAvgDepreciation = totalDepreciation / (age + projectionYears);

    return {
      currentValue: startingValue,
      futureValue: currentValue,
      totalDepreciation,
      yearlyAvgDepreciation,
      schedule,
      percentRetained: (currentValue / price) * 100,
    };
  }, [purchasePrice, vehicleAge, vehicleType, condition, annualMileage, yearsToProject]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const vehicleTypes = [
    { value: 'sedan', label: 'Sedan', icon: '🚗' },
    { value: 'suv', label: 'SUV/Crossover', icon: '🚙' },
    { value: 'truck', label: 'Truck', icon: '🛻' },
    { value: 'luxury', label: 'Luxury', icon: '✨' },
    { value: 'sports', label: 'Sports Car', icon: '🏎️' },
    { value: 'economy', label: 'Economy', icon: '💰' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><TrendingDown className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carDepreciation.carDepreciationCalculator', 'Car Depreciation Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.carDepreciation.estimateYourVehicleSValue', 'Estimate your vehicle\'s value over time')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.carDepreciation.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Purchase Price */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.carDepreciation.purchasePriceMsrp', 'Purchase Price (MSRP)')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="35000"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Car className="w-4 h-4 inline mr-1" />
            {t('tools.carDepreciation.vehicleType', 'Vehicle Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {vehicleTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setVehicleType(type.value as typeof vehicleType)}
                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                  vehicleType === type.value
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{type.icon}</span> {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age and Condition Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.carDepreciation.currentAgeYears', 'Current Age (years)')}
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={vehicleAge}
              onChange={(e) => setVehicleAge(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carDepreciation.condition', 'Condition')}
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as typeof condition)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="excellent">{t('tools.carDepreciation.excellent10', 'Excellent (+10%)')}</option>
              <option value="good">{t('tools.carDepreciation.goodBaseline', 'Good (Baseline)')}</option>
              <option value="fair">{t('tools.carDepreciation.fair15', 'Fair (-15%)')}</option>
              <option value="poor">{t('tools.carDepreciation.poor30', 'Poor (-30%)')}</option>
            </select>
          </div>
        </div>

        {/* Mileage and Projection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carDepreciation.annualMileage', 'Annual Mileage')}
            </label>
            <input
              type="number"
              value={annualMileage}
              onChange={(e) => setAnnualMileage(e.target.value)}
              placeholder="12000"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.carDepreciation.averageIs12000Miles', 'Average is 12,000 miles/year')}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.carDepreciation.projectYearsAhead', 'Project Years Ahead')}
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={yearsToProject}
              onChange={(e) => setYearsToProject(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Current Value Display */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {parseInt(vehicleAge) === 0 ? t('tools.carDepreciation.valueAfterYear1', 'Value After Year 1') : t('tools.carDepreciation.estimatedCurrentValue', 'Estimated Current Value')}
          </div>
          <div className="text-4xl font-bold text-teal-500 my-2">
            {formatCurrency(calculations.currentValue)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {((calculations.currentValue / parseFloat(purchasePrice)) * 100).toFixed(1)}% of original price
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Value in {yearsToProject}yr</div>
            <div className="text-xl font-bold text-teal-500">{formatCurrency(calculations.futureValue)}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carDepreciation.totalDepreciation', 'Total Depreciation')}</div>
            <div className="text-xl font-bold text-red-500">{formatCurrency(calculations.totalDepreciation)}</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.carDepreciation.avgYear', 'Avg/Year')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(calculations.yearlyAvgDepreciation)}</div>
          </div>
        </div>

        {/* Depreciation Schedule */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-teal-500" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.carDepreciation.depreciationSchedule', 'Depreciation Schedule')}</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2">{t('tools.carDepreciation.year', 'Year')}</th>
                  <th className="text-right py-2">{t('tools.carDepreciation.value', 'Value')}</th>
                  <th className="text-right py-2">{t('tools.carDepreciation.depreciation', 'Depreciation')}</th>
                  <th className="text-right py-2">% Retained</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {calculations.schedule.map((row, idx) => (
                  <tr key={idx} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2">Year {row.year}</td>
                    <td className="text-right py-2 text-teal-500 font-medium">{formatCurrency(row.value)}</td>
                    <td className="text-right py-2 text-red-500">{row.depreciation > 0 ? `-${formatCurrency(row.depreciation)}` : '-'}</td>
                    <td className="text-right py-2">{row.percentOfOriginal.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.carDepreciation.minimizeDepreciation', 'Minimize Depreciation:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.carDepreciation.chooseVehiclesWithStrongResale', 'Choose vehicles with strong resale value (trucks, popular SUVs)')}</li>
                <li>{t('tools.carDepreciation.keepMileageBelowAverage12', 'Keep mileage below average (12,000 miles/year)')}</li>
                <li>{t('tools.carDepreciation.maintainExcellentConditionWithRegular', 'Maintain excellent condition with regular service')}</li>
                <li>{t('tools.carDepreciation.considerBuying23Year', 'Consider buying 2-3 year old vehicles to avoid steepest depreciation')}</li>
                <li>{t('tools.carDepreciation.avoidLuxuryVehiclesIfResale', 'Avoid luxury vehicles if resale value is a concern')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDepreciationTool;
