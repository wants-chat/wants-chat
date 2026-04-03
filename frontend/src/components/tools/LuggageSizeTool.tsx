import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Luggage, Plane, Ruler, Weight, Check, X, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface AirlinePolicy {
  name: string;
  code: string;
  carryOn: {
    dimensions: { length: number; width: number; height: number };
    weight: number | null;
    personalItem: boolean;
  };
  checked: {
    dimensions: { length: number; width: number; height: number };
    weight: number;
    freeAllowance: string;
  };
  notes?: string;
}

const AIRLINES: AirlinePolicy[] = [
  {
    name: 'United Airlines',
    code: 'UA',
    carryOn: { dimensions: { length: 56, width: 35, height: 22 }, weight: null, personalItem: true },
    checked: { dimensions: { length: 157, width: 0, height: 0 }, weight: 23, freeAllowance: '1-2 bags (fare dependent)' },
    notes: 'Linear dimensions for checked bags (L+W+H)',
  },
  {
    name: 'American Airlines',
    code: 'AA',
    carryOn: { dimensions: { length: 56, width: 36, height: 23 }, weight: null, personalItem: true },
    checked: { dimensions: { length: 157, width: 0, height: 0 }, weight: 23, freeAllowance: '0-2 bags (fare dependent)' },
  },
  {
    name: 'Delta Air Lines',
    code: 'DL',
    carryOn: { dimensions: { length: 56, width: 35, height: 23 }, weight: null, personalItem: true },
    checked: { dimensions: { length: 157, width: 0, height: 0 }, weight: 23, freeAllowance: '1-2 bags (fare dependent)' },
  },
  {
    name: 'Southwest Airlines',
    code: 'WN',
    carryOn: { dimensions: { length: 61, width: 40, height: 24 }, weight: null, personalItem: true },
    checked: { dimensions: { length: 157, width: 0, height: 0 }, weight: 23, freeAllowance: '2 free bags' },
    notes: 'Known for generous free checked bag policy',
  },
  {
    name: 'British Airways',
    code: 'BA',
    carryOn: { dimensions: { length: 56, width: 45, height: 25 }, weight: 23, personalItem: true },
    checked: { dimensions: { length: 90, width: 75, height: 43 }, weight: 23, freeAllowance: '1-2 bags (fare dependent)' },
  },
  {
    name: 'Lufthansa',
    code: 'LH',
    carryOn: { dimensions: { length: 55, width: 40, height: 23 }, weight: 8, personalItem: true },
    checked: { dimensions: { length: 158, width: 0, height: 0 }, weight: 23, freeAllowance: '1 bag (Economy)' },
  },
  {
    name: 'Air France',
    code: 'AF',
    carryOn: { dimensions: { length: 55, width: 35, height: 25 }, weight: 12, personalItem: true },
    checked: { dimensions: { length: 158, width: 0, height: 0 }, weight: 23, freeAllowance: '1 bag (Economy)' },
  },
  {
    name: 'Emirates',
    code: 'EK',
    carryOn: { dimensions: { length: 55, width: 38, height: 20 }, weight: 7, personalItem: false },
    checked: { dimensions: { length: 150, width: 0, height: 0 }, weight: 30, freeAllowance: '1 bag (Economy), 2 bags (Business)' },
    notes: 'Generous checked baggage allowance',
  },
  {
    name: 'Qatar Airways',
    code: 'QR',
    carryOn: { dimensions: { length: 50, width: 37, height: 25 }, weight: 7, personalItem: true },
    checked: { dimensions: { length: 158, width: 0, height: 0 }, weight: 30, freeAllowance: '1-2 bags (fare dependent)' },
  },
  {
    name: 'Singapore Airlines',
    code: 'SQ',
    carryOn: { dimensions: { length: 56, width: 36, height: 23 }, weight: 7, personalItem: false },
    checked: { dimensions: { length: 158, width: 0, height: 0 }, weight: 30, freeAllowance: '2 bags (Economy)' },
  },
  {
    name: 'Ryanair',
    code: 'FR',
    carryOn: { dimensions: { length: 40, width: 25, height: 20 }, weight: 10, personalItem: false },
    checked: { dimensions: { length: 81, width: 119, height: 119 }, weight: 20, freeAllowance: 'None (fee required)' },
    notes: 'Strict carry-on policy - Priority boarding for larger carry-on',
  },
  {
    name: 'EasyJet',
    code: 'U2',
    carryOn: { dimensions: { length: 45, width: 36, height: 20 }, weight: null, personalItem: false },
    checked: { dimensions: { length: 275, width: 0, height: 0 }, weight: 32, freeAllowance: 'None (fee required)' },
    notes: 'Cabin bag goes under seat unless you have speedy boarding',
  },
  {
    name: 'JetBlue',
    code: 'B6',
    carryOn: { dimensions: { length: 56, width: 35, height: 23 }, weight: null, personalItem: true },
    checked: { dimensions: { length: 157, width: 0, height: 0 }, weight: 23, freeAllowance: '1 free bag (Blue Plus/Extra)' },
  },
  {
    name: 'Air Canada',
    code: 'AC',
    carryOn: { dimensions: { length: 55, width: 40, height: 23 }, weight: 10, personalItem: true },
    checked: { dimensions: { length: 158, width: 0, height: 0 }, weight: 23, freeAllowance: '0-2 bags (fare dependent)' },
  },
  {
    name: 'Qantas',
    code: 'QF',
    carryOn: { dimensions: { length: 56, width: 36, height: 23 }, weight: 7, personalItem: true },
    checked: { dimensions: { length: 158, width: 0, height: 0 }, weight: 23, freeAllowance: '1 bag (Economy)' },
  },
];

interface LuggageSizeToolProps {
  uiConfig?: UIConfig;
}

export const LuggageSizeTool: React.FC<LuggageSizeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedAirline, setSelectedAirline] = useState<string>('UA');
  const [luggageLength, setLuggageLength] = useState<string>('55');
  const [luggageWidth, setLuggageWidth] = useState<string>('35');
  const [luggageHeight, setLuggageHeight] = useState<string>('20');
  const [luggageWeight, setLuggageWeight] = useState<string>('7');
  const [bagType, setBagType] = useState<'carry-on' | 'checked'>('carry-on');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasChanges = false;

      if (params.airline) {
        const code = String(params.airline).toUpperCase();
        if (AIRLINES.find(a => a.code === code)) {
          setSelectedAirline(code);
          hasChanges = true;
        }
      }
      if (params.length) {
        setLuggageLength(String(params.length));
        hasChanges = true;
      }
      if (params.width) {
        setLuggageWidth(String(params.width));
        hasChanges = true;
      }
      if (params.height) {
        setLuggageHeight(String(params.height));
        hasChanges = true;
      }
      if (params.weight) {
        setLuggageWeight(String(params.weight));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const analysis = useMemo(() => {
    const airline = AIRLINES.find(a => a.code === selectedAirline);
    if (!airline) return null;

    const length = parseFloat(luggageLength) || 0;
    const width = parseFloat(luggageWidth) || 0;
    const height = parseFloat(luggageHeight) || 0;
    const weight = parseFloat(luggageWeight) || 0;

    const linearDimensions = length + width + height;
    const policy = bagType === 'carry-on' ? airline.carryOn : airline.checked;

    let dimensionsOk = false;
    let weightOk = true;

    if (bagType === 'carry-on') {
      dimensionsOk =
        length <= policy.dimensions.length &&
        width <= policy.dimensions.width &&
        height <= policy.dimensions.height;
      if (policy.weight !== null) {
        weightOk = weight <= policy.weight;
      }
    } else {
      // Checked bags often use linear dimensions
      if (policy.dimensions.width === 0 && policy.dimensions.height === 0) {
        dimensionsOk = linearDimensions <= policy.dimensions.length;
      } else {
        dimensionsOk =
          length <= policy.dimensions.length &&
          width <= policy.dimensions.width &&
          height <= policy.dimensions.height;
      }
      weightOk = policy.weight !== null ? weight <= policy.weight : true;
    }

    return {
      airline,
      policy,
      linearDimensions,
      dimensionsOk,
      weightOk,
      overallOk: dimensionsOk && weightOk,
      overLength: length - policy.dimensions.length,
      overWidth: width - policy.dimensions.width,
      overHeight: height - policy.dimensions.height,
      overWeight: bagType === 'carry-on' && policy.weight ? weight - policy.weight : weight - (airline.checked.weight || 23),
    };
  }, [selectedAirline, luggageLength, luggageWidth, luggageHeight, luggageWeight, bagType]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Luggage className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.luggageSize.airlineLuggageSizeGuide', 'Airline Luggage Size Guide')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.luggageSize.checkIfYourLuggageMeets', 'Check if your luggage meets airline requirements')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-500 font-medium">{t('tools.luggageSize.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Airline Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Plane className="w-4 h-4 inline mr-1" />
                {t('tools.luggageSize.selectAirline', 'Select Airline')}
              </label>
              <select
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {AIRLINES.map((airline) => (
                  <option key={airline.code} value={airline.code}>
                    {airline.name} ({airline.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Bag Type Toggle */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.luggageSize.bagType', 'Bag Type')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBagType('carry-on')}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    bagType === 'carry-on'
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Luggage className="w-5 h-5" />
                  {t('tools.luggageSize.carryOn2', 'Carry-On')}
                </button>
                <button
                  onClick={() => setBagType('checked')}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    bagType === 'checked'
                      ? 'bg-[#0D9488] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Luggage className="w-5 h-5" />
                  {t('tools.luggageSize.checkedBag2', 'Checked Bag')}
                </button>
              </div>
            </div>

            {/* Luggage Dimensions */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Ruler className="w-4 h-4 inline mr-1" />
                {t('tools.luggageSize.yourLuggageDimensionsCm', 'Your Luggage Dimensions (cm)')}
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.luggageSize.length', 'Length')}</label>
                  <input
                    type="number"
                    min="0"
                    value={luggageLength}
                    onChange={(e) => setLuggageLength(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.luggageSize.width', 'Width')}</label>
                  <input
                    type="number"
                    min="0"
                    value={luggageWidth}
                    onChange={(e) => setLuggageWidth(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.luggageSize.height', 'Height')}</label>
                  <input
                    type="number"
                    min="0"
                    value={luggageHeight}
                    onChange={(e) => setLuggageHeight(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Weight className="w-4 h-4 inline mr-1" />
                {t('tools.luggageSize.yourLuggageWeightKg', 'Your Luggage Weight (kg)')}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={luggageWeight}
                onChange={(e) => setLuggageWeight(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Results */}
            {analysis && (
              <div className="space-y-4">
                {/* Overall Status */}
                <div className={`p-6 rounded-xl border ${
                  analysis.overallOk
                    ? isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
                    : isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-4">
                    {analysis.overallOk ? (
                      <Check className="w-10 h-10 text-green-500" />
                    ) : (
                      <X className="w-10 h-10 text-red-500" />
                    )}
                    <div>
                      <h2 className={`text-xl font-bold ${analysis.overallOk ? 'text-green-500' : 'text-red-500'}`}>
                        {analysis.overallOk ? t('tools.luggageSize.yourLuggageMeetsRequirements', 'Your luggage meets requirements!') : t('tools.luggageSize.yourLuggageExceedsLimits', 'Your luggage exceeds limits')}
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {analysis.airline.name} - {bagType === 'carry-on' ? t('tools.luggageSize.carryOn3', 'Carry-On') : t('tools.luggageSize.checkedBag3', 'Checked Bag')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.luggageSize.sizeComparison', 'Size Comparison')}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <th className="text-left py-2">{t('tools.luggageSize.dimension', 'Dimension')}</th>
                          <th className="text-right py-2">{t('tools.luggageSize.yourBag', 'Your Bag')}</th>
                          <th className="text-right py-2">{t('tools.luggageSize.limit', 'Limit')}</th>
                          <th className="text-right py-2">{t('tools.luggageSize.status', 'Status')}</th>
                        </tr>
                      </thead>
                      <tbody className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                        <tr>
                          <td className="py-2">{t('tools.luggageSize.length2', 'Length')}</td>
                          <td className="text-right">{luggageLength} cm</td>
                          <td className="text-right">{analysis.policy.dimensions.length} cm</td>
                          <td className="text-right">
                            {parseFloat(luggageLength) <= analysis.policy.dimensions.length ? (
                              <Check className="w-4 h-4 text-green-500 inline" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 inline" />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2">{t('tools.luggageSize.width2', 'Width')}</td>
                          <td className="text-right">{luggageWidth} cm</td>
                          <td className="text-right">{analysis.policy.dimensions.width || 'N/A'} cm</td>
                          <td className="text-right">
                            {analysis.policy.dimensions.width === 0 || parseFloat(luggageWidth) <= analysis.policy.dimensions.width ? (
                              <Check className="w-4 h-4 text-green-500 inline" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 inline" />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2">{t('tools.luggageSize.height2', 'Height')}</td>
                          <td className="text-right">{luggageHeight} cm</td>
                          <td className="text-right">{analysis.policy.dimensions.height || 'N/A'} cm</td>
                          <td className="text-right">
                            {analysis.policy.dimensions.height === 0 || parseFloat(luggageHeight) <= analysis.policy.dimensions.height ? (
                              <Check className="w-4 h-4 text-green-500 inline" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 inline" />
                            )}
                          </td>
                        </tr>
                        <tr className={`border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                          <td className="py-2">{t('tools.luggageSize.weight', 'Weight')}</td>
                          <td className="text-right">{luggageWeight} kg</td>
                          <td className="text-right">
                            {bagType === 'carry-on'
                              ? analysis.airline.carryOn.weight ? `${analysis.airline.carryOn.weight} kg` : 'No limit'
                              : `${analysis.airline.checked.weight} kg`}
                          </td>
                          <td className="text-right">
                            {analysis.weightOk ? (
                              <Check className="w-4 h-4 text-green-500 inline" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 inline" />
                            )}
                          </td>
                        </tr>
                        {bagType === 'checked' && (
                          <tr className={`border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                            <td className="py-2">{t('tools.luggageSize.linearTotal', 'Linear Total')}</td>
                            <td className="text-right">{analysis.linearDimensions.toFixed(0)} cm</td>
                            <td className="text-right">
                              {analysis.policy.dimensions.width === 0 ? `${analysis.policy.dimensions.length} cm` : 'N/A'}
                            </td>
                            <td className="text-right">
                              {analysis.dimensionsOk ? (
                                <Check className="w-4 h-4 text-green-500 inline" />
                              ) : (
                                <X className="w-4 h-4 text-red-500 inline" />
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Airline Policy Details */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analysis.airline.name} Policy
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.luggageSize.carryOn', 'Carry-On')}</h4>
                      <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li>Max: {analysis.airline.carryOn.dimensions.length} x {analysis.airline.carryOn.dimensions.width} x {analysis.airline.carryOn.dimensions.height} cm</li>
                        <li>Weight: {analysis.airline.carryOn.weight ? `${analysis.airline.carryOn.weight} kg` : 'No specific limit'}</li>
                        <li>Personal Item: {analysis.airline.carryOn.personalItem ? t('tools.luggageSize.yesAllowed', 'Yes, allowed') : t('tools.luggageSize.notIncluded', 'Not included')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.luggageSize.checkedBag', 'Checked Bag')}</h4>
                      <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li>
                          {analysis.airline.checked.dimensions.width === 0
                            ? `Linear: ${analysis.airline.checked.dimensions.length} cm (L+W+H)`
                            : `Max: ${analysis.airline.checked.dimensions.length} x ${analysis.airline.checked.dimensions.width} x ${analysis.airline.checked.dimensions.height} cm`}
                        </li>
                        <li>Weight: {analysis.airline.checked.weight} kg</li>
                        <li>Free Allowance: {analysis.airline.checked.freeAllowance}</li>
                      </ul>
                    </div>
                  </div>
                  {analysis.airline.notes && (
                    <div className={`mt-3 p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <Info className="w-3 h-3 inline mr-1" />
                        {analysis.airline.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Warning if over limit */}
                {!analysis.overallOk && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'} flex items-start gap-3`}>
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                        {t('tools.luggageSize.oversizedOverweightBagFeesApply', 'Oversized/Overweight Bag Fees Apply')}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Your bag may incur additional fees. Consider repacking or using a smaller/lighter bag.
                        Fees typically range from $50-$200 depending on the airline and how much you exceed limits.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-start gap-3`}>
              <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Airline policies change frequently. Always verify current requirements on the airline's
                official website before traveling. Some routes and fare classes may have different allowances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuggageSizeTool;
