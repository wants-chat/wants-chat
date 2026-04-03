import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Home, MapPin, Package, DollarSign, Info, Sparkles, Calendar, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MovingCostCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const MovingCostCalculatorTool: React.FC<MovingCostCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [moveType, setMoveType] = useState<'local' | 'longDistance'>('local');
  const [homeSize, setHomeSize] = useState('2');
  const [distance, setDistance] = useState('25');
  const [packingService, setPackingService] = useState(false);
  const [specialItems, setSpecialItems] = useState({
    piano: false,
    hotTub: false,
    poolTable: false,
    safe: false,
    art: false,
  });
  const [storageMonths, setStorageMonths] = useState('0');
  const [moveDate, setMoveDate] = useState<'weekday' | 'weekend' | 'peakSeason'>('weekday');
  const [insuranceLevel, setInsuranceLevel] = useState<'basic' | 'full'>('basic');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.distance !== undefined) {
        setDistance(String(params.distance));
        if (params.distance > 100) setMoveType('longDistance');
        setIsPrefilled(true);
      }
      if (params.bedrooms !== undefined) {
        setHomeSize(String(params.bedrooms));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const homeSizeOptions = [
    { value: 'studio', label: 'Studio', weight: 2000, hours: 3 },
    { value: '1', label: '1 Bedroom', weight: 3500, hours: 4 },
    { value: '2', label: '2 Bedrooms', weight: 5000, hours: 6 },
    { value: '3', label: '3 Bedrooms', weight: 7500, hours: 8 },
    { value: '4', label: '4 Bedrooms', weight: 10000, hours: 10 },
    { value: '5', label: '5+ Bedrooms', weight: 12000, hours: 12 },
  ];

  const calculations = useMemo(() => {
    const sizeInfo = homeSizeOptions.find(s => s.value === homeSize) || homeSizeOptions[2];
    const dist = parseFloat(distance) || 0;
    const storage = parseInt(storageMonths) || 0;

    // Base rates
    const hourlyRate = 150; // Per hour for local
    const perPoundRate = 0.50; // Per pound for long distance
    const perMileRate = 0.50; // Additional per mile

    let baseCost = 0;
    let laborCost = 0;
    let transportCost = 0;

    if (moveType === 'local') {
      // Local move: hourly rate
      laborCost = sizeInfo.hours * hourlyRate;
      transportCost = dist * 2; // Round trip fuel
      baseCost = laborCost + transportCost;
    } else {
      // Long distance: weight + distance based
      laborCost = sizeInfo.hours * hourlyRate;
      transportCost = (sizeInfo.weight * perPoundRate) + (dist * perMileRate);
      baseCost = laborCost + transportCost;
    }

    // Packing service
    const packingCost = packingService ? sizeInfo.weight * 0.10 : 0;

    // Special items
    let specialItemsCost = 0;
    if (specialItems.piano) specialItemsCost += 500;
    if (specialItems.hotTub) specialItemsCost += 800;
    if (specialItems.poolTable) specialItemsCost += 400;
    if (specialItems.safe) specialItemsCost += 300;
    if (specialItems.art) specialItemsCost += 200;

    // Storage costs
    const monthlyStotageCost = 150 + (sizeInfo.weight * 0.02);
    const storageCost = storage * monthlyStotageCost;

    // Date premium
    let datePremium = 1;
    if (moveDate === 'weekend') datePremium = 1.15;
    if (moveDate === 'peakSeason') datePremium = 1.25;

    // Insurance
    const homeValue = sizeInfo.weight * 5; // Rough estimate
    const insuranceCost = insuranceLevel === 'full' ? homeValue * 0.02 : homeValue * 0.005;

    // Calculate totals
    const subtotal = baseCost + packingCost + specialItemsCost + storageCost + insuranceCost;
    const dateAdjustedTotal = subtotal * datePremium;

    // Tips (industry standard 15-20%)
    const tipLow = laborCost * 0.15;
    const tipHigh = laborCost * 0.20;

    // Grand total range
    const lowEstimate = dateAdjustedTotal * 0.85;
    const highEstimate = dateAdjustedTotal * 1.15;

    return {
      baseCost,
      laborCost,
      transportCost,
      packingCost,
      specialItemsCost,
      storageCost,
      insuranceCost,
      datePremium,
      dateMultiplier: (datePremium - 1) * 100,
      subtotal,
      total: dateAdjustedTotal,
      lowEstimate,
      highEstimate,
      tipLow,
      tipHigh,
      estimatedWeight: sizeInfo.weight,
      estimatedHours: sizeInfo.hours,
      monthlyStotageCost,
    };
  }, [moveType, homeSize, distance, packingService, specialItems, storageMonths, moveDate, insuranceLevel]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Truck className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostCalculator.movingCostCalculator', 'Moving Cost Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.movingCostCalculator.estimateYourMovingExpenses', 'Estimate your moving expenses')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.movingCostCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Move Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('tools.movingCostCalculator.moveType', 'Move Type')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMoveType('local')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                moveType === 'local'
                  ? 'bg-[#0D9488] text-white'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Local (&lt;100 miles)
            </button>
            <button
              onClick={() => setMoveType('longDistance')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                moveType === 'longDistance'
                  ? 'bg-[#0D9488] text-white'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('tools.movingCostCalculator.longDistance', 'Long Distance')}
            </button>
          </div>
        </div>

        {/* Home Size & Distance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Home className="w-4 h-4 inline mr-1" />
              {t('tools.movingCostCalculator.homeSize', 'Home Size')}
            </label>
            <select
              value={homeSize}
              onChange={(e) => setHomeSize(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {homeSizeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.movingCostCalculator.distanceMiles', 'Distance (miles)')}
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Move Date */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calendar className="w-4 h-4 inline mr-1" />
            {t('tools.movingCostCalculator.moveTiming', 'Move Timing')}
          </label>
          <div className="flex gap-2">
            {[
              { value: 'weekday', label: 'Weekday', premium: '' },
              { value: 'weekend', label: 'Weekend', premium: '+15%' },
              { value: 'peakSeason', label: 'Peak Season (May-Sep)', premium: '+25%' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMoveDate(opt.value as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  moveDate === opt.value
                    ? 'bg-[#0D9488] text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
                {opt.premium && <span className="block text-xs opacity-75">{opt.premium}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-4 h-4 inline mr-2" />
            {t('tools.movingCostCalculator.additionalServices', 'Additional Services')}
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={packingService}
                onChange={(e) => setPackingService(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Full Packing Service
                <span className={`text-sm ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  (+{formatCurrency(calculations.packingCost)})
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Special Items */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.movingCostCalculator.specialItemsAdditionalFees', 'Special Items (Additional Fees)')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'piano', label: 'Piano', cost: 500 },
              { key: 'hotTub', label: 'Hot Tub', cost: 800 },
              { key: 'poolTable', label: 'Pool Table', cost: 400 },
              { key: 'safe', label: 'Heavy Safe', cost: 300 },
              { key: 'art', label: 'Fine Art', cost: 200 },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={specialItems[item.key as keyof typeof specialItems]}
                  onChange={(e) => setSpecialItems({ ...specialItems, [item.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.label}
                  <span className={`text-xs ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    (+${item.cost})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Storage & Insurance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.movingCostCalculator.storageNeededMonths', 'Storage Needed (months)')}
            </label>
            <select
              value={storageMonths}
              onChange={(e) => setStorageMonths(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {[0, 1, 2, 3, 6, 12].map((m) => (
                <option key={m} value={m}>
                  {m === 0 ? 'None' : `${m} month${m > 1 ? 's' : ''}`}
                  {m > 0 && ` (~${formatCurrency(calculations.monthlyStotageCost)}/mo)`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.movingCostCalculator.insuranceCoverage', 'Insurance Coverage')}
            </label>
            <select
              value={insuranceLevel}
              onChange={(e) => setInsuranceLevel(e.target.value as any)}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="basic">{t('tools.movingCostCalculator.basic060Lb', 'Basic ($0.60/lb)')}</option>
              <option value="full">{t('tools.movingCostCalculator.fullValueProtection', 'Full Value Protection')}</option>
            </select>
          </div>
        </div>

        {/* Cost Summary */}
        <div className={`p-6 rounded-xl ${isDark ? t('tools.movingCostCalculator.bg0d948820Border0d9488', 'bg-[#0D9488]/20 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className="text-center mb-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.movingCostCalculator.estimatedMovingCost', 'Estimated Moving Cost')}</div>
            <div className="text-4xl font-bold text-[#0D9488]">
              {formatCurrency(calculations.total)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Range: {formatCurrency(calculations.lowEstimate)} - {formatCurrency(calculations.highEstimate)}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 inline mr-2" />
            {t('tools.movingCostCalculator.costBreakdown', 'Cost Breakdown')}
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Labor', value: calculations.laborCost },
              { label: 'Transportation', value: calculations.transportCost },
              { label: 'Packing Service', value: calculations.packingCost, show: packingService },
              { label: 'Special Items', value: calculations.specialItemsCost, show: calculations.specialItemsCost > 0 },
              { label: 'Storage', value: calculations.storageCost, show: parseInt(storageMonths) > 0 },
              { label: 'Insurance', value: calculations.insuranceCost },
            ].filter(item => item.show !== false && item.value > 0).map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{item.label}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
            {calculations.dateMultiplier > 0 && (
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {moveDate === 'weekend' ? t('tools.movingCostCalculator.weekend', 'Weekend') : t('tools.movingCostCalculator.peakSeason', 'Peak Season')} Premium
                </span>
                <span className="font-medium text-amber-500">
                  +{calculations.dateMultiplier.toFixed(0)}%
                </span>
              </div>
            )}
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostCalculator.total', 'Total')}</span>
              <span className="font-bold text-[#0D9488]">{formatCurrency(calculations.total)}</span>
            </div>
          </div>
        </div>

        {/* Tip Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-[#0D9488]" />
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostCalculator.moverTipsOptional', 'Mover Tips (Optional)')}</h4>
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.movingCostCalculator.industryStandard1520Of', 'Industry standard: 15-20% of labor costs')}
          </div>
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(calculations.tipLow)} - {formatCurrency(calculations.tipHigh)}
          </div>
        </div>

        {/* Move Details */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.movingCostCalculator.moveDetails', 'Move Details')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.movingCostCalculator.estWeight', 'Est. Weight')}</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.estimatedWeight.toLocaleString()} lbs
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.movingCostCalculator.estHours', 'Est. Hours')}</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.estimatedHours} hours
              </div>
            </div>
            <div>
              <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.movingCostCalculator.distance', 'Distance')}</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {distance} miles
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.movingCostCalculator.tips', 'Tips:')}</strong> Get at least 3 quotes from licensed movers. Avoid peak season (May-September) for lower rates. Declutter before moving to reduce weight and costs. Check reviews and verify DOT numbers for interstate moves.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovingCostCalculatorTool;
