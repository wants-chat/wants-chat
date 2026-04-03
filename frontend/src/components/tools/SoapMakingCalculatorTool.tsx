import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplet, Scale, Clock, Info, Beaker, Sparkles, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface OilConfig {
  name: string;
  sapNaOH: number; // SAP value for NaOH (sodium hydroxide)
  sapKOH: number; // SAP value for KOH (potassium hydroxide)
  properties: string;
}

interface SelectedOil {
  id: string;
  oilType: string;
  weight: number;
}

type LyeType = 'naoh' | 'koh';
type Unit = 'grams' | 'ounces';

const COLUMNS: ColumnConfig[] = [
  {
    key: 'oilType',
    header: 'Oil Type',
    type: 'string',
  },
  {
    key: 'weight',
    header: 'Weight',
    type: 'number',
  },
  {
    key: 'percentage',
    header: 'Percentage',
    type: 'string',
  },
];

interface SoapMakingCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const SoapMakingCalculatorTool: React.FC<SoapMakingCalculatorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [lyeType, setLyeType] = useState<LyeType>('naoh');
  const [unit, setUnit] = useState<Unit>('grams');
  const [waterRatio, setWaterRatio] = useState('38'); // water as percentage of oils
  const [superfatPercent, setSuperfatPercent] = useState('5');
  const [fragrancePercent, setFragrancePercent] = useState('3');
  const [selectedOils, setSelectedOils] = useState<SelectedOil[]>([
    { id: '1', oilType: 'olive', weight: 500 },
    { id: '2', oilType: 'coconut', weight: 200 },
    { id: '3', oilType: 'palm', weight: 150 },
  ]);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.lyeType && ['naoh', 'koh'].includes(params.lyeType)) {
        setLyeType(params.lyeType as LyeType);
        hasChanges = true;
      }
      if (params.waterRatio) {
        setWaterRatio(String(params.waterRatio));
        hasChanges = true;
      }
      if (params.superfatPercent) {
        setSuperfatPercent(String(params.superfatPercent));
        hasChanges = true;
      }
      if (params.totalOilWeight) {
        // Adjust the first oil weight if total is specified
        setSelectedOils([
          { id: '1', oilType: 'olive', weight: params.totalOilWeight },
        ]);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const oils: Record<string, OilConfig> = {
    olive: {
      name: 'Olive Oil',
      sapNaOH: 0.134,
      sapKOH: 0.188,
      properties: 'Moisturizing, conditioning, gentle lather',
    },
    coconut: {
      name: 'Coconut Oil',
      sapNaOH: 0.178,
      sapKOH: 0.250,
      properties: 'Cleansing, bubbly lather, hardness',
    },
    palm: {
      name: 'Palm Oil',
      sapNaOH: 0.141,
      sapKOH: 0.198,
      properties: 'Hardness, creamy lather, longevity',
    },
    castor: {
      name: 'Castor Oil',
      sapNaOH: 0.128,
      sapKOH: 0.180,
      properties: 'Bubbly lather, moisturizing',
    },
    shea: {
      name: 'Shea Butter',
      sapNaOH: 0.128,
      sapKOH: 0.180,
      properties: 'Conditioning, creamy, luxury feel',
    },
    cocoa: {
      name: 'Cocoa Butter',
      sapNaOH: 0.137,
      sapKOH: 0.193,
      properties: 'Hardness, skin conditioning',
    },
    avocado: {
      name: 'Avocado Oil',
      sapNaOH: 0.133,
      sapKOH: 0.187,
      properties: 'Moisturizing, vitamins, gentle',
    },
    sunflower: {
      name: 'Sunflower Oil',
      sapNaOH: 0.134,
      sapKOH: 0.188,
      properties: 'Conditioning, light, economical',
    },
    ricebran: {
      name: 'Rice Bran Oil',
      sapNaOH: 0.128,
      sapKOH: 0.180,
      properties: 'Silky feel, antioxidants',
    },
    sweet_almond: {
      name: 'Sweet Almond Oil',
      sapNaOH: 0.136,
      sapKOH: 0.191,
      properties: 'Moisturizing, mild, gentle',
    },
    jojoba: {
      name: 'Jojoba Oil',
      sapNaOH: 0.066,
      sapKOH: 0.093,
      properties: 'Skin conditioning, stable',
    },
    lard: {
      name: 'Lard',
      sapNaOH: 0.138,
      sapKOH: 0.194,
      properties: 'Creamy lather, hardness, conditioning',
    },
    tallow: {
      name: 'Tallow (Beef)',
      sapNaOH: 0.140,
      sapKOH: 0.197,
      properties: 'Hard bar, creamy lather, traditional',
    },
  };

  const addOil = () => {
    const newId = Date.now().toString();
    const availableOils = Object.keys(oils).filter(
      (oil) => !selectedOils.some((s) => s.oilType === oil)
    );
    if (availableOils.length > 0) {
      setSelectedOils([
        ...selectedOils,
        { id: newId, oilType: availableOils[0], weight: 100 },
      ]);
    }
  };

  const removeOil = (id: string) => {
    if (selectedOils.length > 1) {
      setSelectedOils(selectedOils.filter((oil) => oil.id !== id));
    }
  };

  const updateOil = (id: string, field: 'oilType' | 'weight', value: string | number) => {
    setSelectedOils(
      selectedOils.map((oil) =>
        oil.id === id ? { ...oil, [field]: value } : oil
      )
    );
  };

  const convertToGrams = (value: number): number => {
    return unit === 'ounces' ? value * 28.3495 : value;
  };

  const convertFromGrams = (value: number): number => {
    return unit === 'ounces' ? value / 28.3495 : value;
  };

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = selectedOils.map((oil) => ({
      oilType: oils[oil.oilType].name,
      weight: parseFloat(convertFromGrams(oil.weight).toFixed(1)),
      percentage: ((convertToGrams(oil.weight) / selectedOils.reduce((sum, o) => sum + convertToGrams(o.weight), 0)) * 100).toFixed(1),
    }));
    exportToCSV(dataToExport, COLUMNS, { filename: 'soap-recipe' });
  };

  const handleExportExcel = () => {
    const dataToExport = selectedOils.map((oil) => ({
      oilType: oils[oil.oilType].name,
      weight: parseFloat(convertFromGrams(oil.weight).toFixed(1)),
      percentage: ((convertToGrams(oil.weight) / selectedOils.reduce((sum, o) => sum + convertToGrams(o.weight), 0)) * 100).toFixed(1),
    }));
    exportToExcel(dataToExport, COLUMNS, { filename: 'soap-recipe' });
  };

  const handleExportJSON = () => {
    const dataToExport = selectedOils.map((oil) => ({
      oilType: oils[oil.oilType].name,
      weight: parseFloat(convertFromGrams(oil.weight).toFixed(1)),
      percentage: ((convertToGrams(oil.weight) / selectedOils.reduce((sum, o) => sum + convertToGrams(o.weight), 0)) * 100).toFixed(1),
    }));
    exportToJSON(dataToExport, { filename: 'soap-recipe' });
  };

  const handleExportPDF = async () => {
    const dataToExport = selectedOils.map((oil) => ({
      oilType: oils[oil.oilType].name,
      weight: parseFloat(convertFromGrams(oil.weight).toFixed(1)),
      percentage: ((convertToGrams(oil.weight) / selectedOils.reduce((sum, o) => sum + convertToGrams(o.weight), 0)) * 100).toFixed(1),
    }));
    await exportToPDF(dataToExport, COLUMNS, {
      filename: 'soap-recipe',
      title: 'Soap Making Recipe',
      orientation: 'portrait',
    });
  };

  const handlePrint = () => {
    const dataToExport = selectedOils.map((oil) => ({
      oilType: oils[oil.oilType].name,
      weight: parseFloat(convertFromGrams(oil.weight).toFixed(1)),
      percentage: ((convertToGrams(oil.weight) / selectedOils.reduce((sum, o) => sum + convertToGrams(o.weight), 0)) * 100).toFixed(1),
    }));
    printData(dataToExport, COLUMNS, {
      title: 'Soap Making Recipe',
    });
  };

  const handleCopyToClipboard = async () => {
    const dataToExport = selectedOils.map((oil) => ({
      oilType: oils[oil.oilType].name,
      weight: parseFloat(convertFromGrams(oil.weight).toFixed(1)),
      percentage: ((convertToGrams(oil.weight) / selectedOils.reduce((sum, o) => sum + convertToGrams(o.weight), 0)) * 100).toFixed(1),
    }));
    return await copyUtil(dataToExport, COLUMNS, 'tab');
  };

  const calculations = useMemo(() => {
    const superfat = parseFloat(superfatPercent) || 0;
    const waterPercent = parseFloat(waterRatio) || 38;
    const fragrancePerc = parseFloat(fragrancePercent) || 0;

    // Calculate total oils in grams
    let totalOilsInGrams = 0;
    let totalLye = 0;

    selectedOils.forEach((oil) => {
      const weightInGrams = convertToGrams(oil.weight);
      totalOilsInGrams += weightInGrams;

      const sapValue = lyeType === 'naoh' ? oils[oil.oilType].sapNaOH : oils[oil.oilType].sapKOH;
      totalLye += weightInGrams * sapValue;
    });

    // Apply superfat reduction to lye
    const lyeWithSuperfat = totalLye * (1 - superfat / 100);

    // Calculate water
    const waterAmount = totalOilsInGrams * (waterPercent / 100);

    // Calculate fragrance (based on total oils)
    const fragranceAmount = totalOilsInGrams * (fragrancePerc / 100);

    // Calculate total batch weight
    const totalBatch = totalOilsInGrams + lyeWithSuperfat + waterAmount + fragranceAmount;

    // Calculate oil percentages
    const oilPercentages = selectedOils.map((oil) => ({
      name: oils[oil.oilType].name,
      percentage: ((convertToGrams(oil.weight) / totalOilsInGrams) * 100).toFixed(1),
    }));

    // Cure time recommendation based on superfat and oil composition
    const hasHighCoconut = selectedOils.some(
      (oil) =>
        oil.oilType === 'coconut' &&
        (convertToGrams(oil.weight) / totalOilsInGrams) * 100 > 30
    );
    const cureTimeWeeks = hasHighCoconut ? '4-6' : '6-8';

    return {
      totalOils: convertFromGrams(totalOilsInGrams).toFixed(1),
      lye: convertFromGrams(lyeWithSuperfat).toFixed(2),
      water: convertFromGrams(waterAmount).toFixed(1),
      fragrance: convertFromGrams(fragranceAmount).toFixed(1),
      totalBatch: convertFromGrams(totalBatch).toFixed(1),
      oilPercentages,
      cureTime: cureTimeWeeks,
      lyeConcentration: ((lyeWithSuperfat / (lyeWithSuperfat + waterAmount)) * 100).toFixed(1),
    };
  }, [selectedOils, lyeType, unit, waterRatio, superfatPercent, fragrancePercent]);

  const unitLabel = unit === 'grams' ? 'g' : 'oz';

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Beaker className="w-5 h-5 text-purple-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.soapMakingCalculator.soapMakingCalculator', 'Soap Making Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.soapMakingCalculator.calculateLyeWaterAndBatch', 'Calculate lye, water, and batch sizes for cold process soap')}</p>
            </div>
          </div>
          {selectedOils.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              disabled={selectedOils.length === 0}
              showImport={false}
              theme={theme}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-500 font-medium">{t('tools.soapMakingCalculator.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Lye Type & Unit Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.soapMakingCalculator.lyeType', 'Lye Type')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLyeType('naoh')}
                className={`flex-1 py-2 rounded-lg text-sm ${lyeType === 'naoh' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.soapMakingCalculator.naohBarSoap', 'NaOH (Bar Soap)')}
              </button>
              <button
                onClick={() => setLyeType('koh')}
                className={`flex-1 py-2 rounded-lg text-sm ${lyeType === 'koh' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.soapMakingCalculator.kohLiquidSoap', 'KOH (Liquid Soap)')}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.soapMakingCalculator.units', 'Units')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setUnit('grams')}
                className={`flex-1 py-2 rounded-lg text-sm ${unit === 'grams' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.soapMakingCalculator.grams', 'Grams')}
              </button>
              <button
                onClick={() => setUnit('ounces')}
                className={`flex-1 py-2 rounded-lg text-sm ${unit === 'ounces' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.soapMakingCalculator.ounces', 'Ounces')}
              </button>
            </div>
          </div>
        </div>

        {/* Oil Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.soapMakingCalculator.oilsFats', 'Oils & Fats')}
            </label>
            <button
              onClick={addOil}
              className="flex items-center gap-1 text-sm text-purple-500 hover:text-purple-600"
            >
              <Plus className="w-4 h-4" />
              {t('tools.soapMakingCalculator.addOil', 'Add Oil')}
            </button>
          </div>

          {selectedOils.map((oil) => (
            <div key={oil.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <select
                  value={oil.oilType}
                  onChange={(e) => updateOil(oil.id, 'oilType', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {Object.keys(oils).map((key) => (
                    <option key={key} value={key}>
                      {oils[key].name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={oil.weight}
                  onChange={(e) => updateOil(oil.id, 'weight', parseFloat(e.target.value) || 0)}
                  className={`w-24 px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{unitLabel}</span>
                <button
                  onClick={() => removeOil(oil.id)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                  disabled={selectedOils.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {oils[oil.oilType].properties}
              </p>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.soapMakingCalculator.waterOfOils', 'Water (% of oils)')}
            </label>
            <input
              type="number"
              value={waterRatio}
              onChange={(e) => setWaterRatio(e.target.value)}
              min="25"
              max="50"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.soapMakingCalculator.typical3340', 'Typical: 33-40%')}</p>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.soapMakingCalculator.superfat', 'Superfat (%)')}
            </label>
            <input
              type="number"
              value={superfatPercent}
              onChange={(e) => setSuperfatPercent(e.target.value)}
              min="0"
              max="20"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.soapMakingCalculator.typical58', 'Typical: 5-8%')}</p>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.soapMakingCalculator.fragrance2', 'Fragrance (%)')}
            </label>
            <input
              type="number"
              value={fragrancePercent}
              onChange={(e) => setFragrancePercent(e.target.value)}
              min="0"
              max="6"
              step="0.5"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.soapMakingCalculator.typical35', 'Typical: 3-5%')}</p>
          </div>
        </div>

        {/* Oil Recipe Summary */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.soapMakingCalculator.oilRecipeBreakdown', 'Oil Recipe Breakdown')}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {calculations.oilPercentages.map((oil, index) => (
              <div key={index} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-medium">{oil.name}:</span> {oil.percentage}%
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {lyeType === 'naoh' ? t('tools.soapMakingCalculator.naohLye', 'NaOH (Lye)') : t('tools.soapMakingCalculator.kohLye', 'KOH (Lye)')}
              </span>
            </div>
            <div className="text-3xl font-bold text-purple-500">{calculations.lye}{unitLabel}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.lyeConcentration}% lye concentration
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.soapMakingCalculator.distilledWater', 'Distilled Water')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.water}{unitLabel}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {waterRatio}% of total oils
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.soapMakingCalculator.fragrance', 'Fragrance')}</span>
            </div>
            <div className="text-3xl font-bold text-pink-500">{calculations.fragrance}{unitLabel}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {fragrancePercent}% of oils
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Beaker className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.soapMakingCalculator.totalOils', 'Total Oils')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.totalOils}{unitLabel}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {superfatPercent}% superfat
            </div>
          </div>
        </div>

        {/* Total Batch & Cure Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.soapMakingCalculator.totalBatchWeight', 'Total Batch Weight')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.totalBatch}{unitLabel}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.soapMakingCalculator.recommendedCureTime', 'Recommended Cure Time')}</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.cureTime} weeks
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 text-red-500" />
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong className="text-red-500">{t('tools.soapMakingCalculator.safetyWarning', 'Safety Warning:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Always add lye to water, NEVER water to lye</li>
                <li>- Wear safety goggles and gloves at all times</li>
                <li>- Work in a well-ventilated area</li>
                <li>- Keep vinegar nearby to neutralize lye spills</li>
              </ul>
            </div>
          </div>
        </div>

        {/* General Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.soapMakingCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Use a digital scale for accurate measurements</li>
                <li>- Higher superfat = more moisturizing, but softer bar</li>
                <li>- Coconut oil over 30% may be drying for some skin types</li>
                <li>- Allow soap to cure in a cool, dry place with airflow</li>
                <li>- Use distilled water to prevent mineral deposits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoapMakingCalculatorTool;
