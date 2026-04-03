import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Recycle, Plus, Trash2, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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

interface CompostRatioToolProps {
  uiConfig?: UIConfig;
}

interface Material {
  id: string;
  name: string;
  weight: number;
  cnRatio: number;
  type: 'green' | 'brown';
}

interface MaterialReference {
  name: string;
  cnRatio: number;
  type: 'green' | 'brown';
  description: string;
}

const MATERIAL_REFERENCES: MaterialReference[] = [
  // Green materials (nitrogen-rich)
  { name: 'Grass Clippings', cnRatio: 20, type: 'green', description: 'Fresh lawn clippings' },
  { name: 'Food Scraps', cnRatio: 15, type: 'green', description: 'Fruit & vegetable waste' },
  { name: 'Coffee Grounds', cnRatio: 20, type: 'green', description: 'Used coffee grounds' },
  { name: 'Fresh Manure', cnRatio: 15, type: 'green', description: 'Cow, horse, or chicken' },
  { name: 'Green Leaves', cnRatio: 25, type: 'green', description: 'Fresh green leaves' },
  { name: 'Seaweed', cnRatio: 19, type: 'green', description: 'Fresh or dried seaweed' },
  { name: 'Vegetable Trimmings', cnRatio: 25, type: 'green', description: 'Kitchen veggie scraps' },
  { name: 'Clover', cnRatio: 16, type: 'green', description: 'Fresh clover clippings' },
  // Brown materials (carbon-rich)
  { name: 'Dry Leaves', cnRatio: 60, type: 'brown', description: 'Fallen autumn leaves' },
  { name: 'Cardboard', cnRatio: 350, type: 'brown', description: 'Shredded cardboard' },
  { name: 'Newspaper', cnRatio: 175, type: 'brown', description: 'Shredded newspaper' },
  { name: 'Straw', cnRatio: 75, type: 'brown', description: 'Wheat or oat straw' },
  { name: 'Wood Chips', cnRatio: 400, type: 'brown', description: 'Untreated wood chips' },
  { name: 'Sawdust', cnRatio: 325, type: 'brown', description: 'Untreated sawdust' },
  { name: 'Paper', cnRatio: 170, type: 'brown', description: 'Office paper, shredded' },
  { name: 'Pine Needles', cnRatio: 80, type: 'brown', description: 'Dried pine needles' },
  { name: 'Corn Stalks', cnRatio: 75, type: 'brown', description: 'Dried corn stalks' },
  { name: 'Hay', cnRatio: 25, type: 'brown', description: 'Dried hay' },
];

const IDEAL_RATIO = 30;
const ACCEPTABLE_RANGE = { min: 25, max: 35 };

// Column configuration for exports
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Material Name', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'weight', header: 'Weight (lbs)', type: 'number' },
  { key: 'cnRatio', header: 'C:N Ratio', type: 'number' },
];

export function CompostRatioTool({ uiConfig }: CompostRatioToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      // Add prefill logic here based on available fields
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [weight, setWeight] = useState('');
  const [showReference, setShowReference] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const addMaterial = () => {
    if (!selectedMaterial || !weight || parseFloat(weight) <= 0) {
      return;
    }

    const reference = MATERIAL_REFERENCES.find(m => m.name === selectedMaterial);
    if (!reference) return;

    const newMaterial: Material = {
      id: Date.now().toString(),
      name: reference.name,
      weight: parseFloat(weight),
      cnRatio: reference.cnRatio,
      type: reference.type,
    };

    setMaterials([...materials, newMaterial]);
    setSelectedMaterial('');
    setWeight('');
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const resetAll = () => {
    setMaterials([]);
    setSelectedMaterial('');
    setWeight('');
  };

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(materials, COLUMNS, { filename: 'compost-materials' });
  };

  const handleExportExcel = () => {
    exportToExcel(materials, COLUMNS, { filename: 'compost-materials' });
  };

  const handleExportJSON = () => {
    exportToJSON(materials, { filename: 'compost-materials' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(materials, COLUMNS, {
      filename: 'compost-materials',
      title: 'Compost Ratio Calculator Report',
      subtitle: `Generated: ${new Date().toLocaleDateString()}`,
    });
  };

  const handlePrint = () => {
    printData(materials, COLUMNS, {
      title: 'Compost Ratio Calculator - Materials List',
    });
  };

  const handleCopyToClipboard = async () => {
    return await copyUtil(materials, COLUMNS, 'tab');
  };

  const calculation = useMemo(() => {
    if (materials.length === 0) {
      return null;
    }

    let totalCarbon = 0;
    let totalNitrogen = 0;
    let totalGreenWeight = 0;
    let totalBrownWeight = 0;

    materials.forEach(material => {
      // Calculate carbon and nitrogen content
      // C:N ratio means C parts carbon to 1 part nitrogen
      // For simplicity, assume equal nitrogen content per weight unit
      const nitrogenContent = material.weight;
      const carbonContent = material.weight * material.cnRatio;

      totalCarbon += carbonContent;
      totalNitrogen += nitrogenContent;

      if (material.type === 'green') {
        totalGreenWeight += material.weight;
      } else {
        totalBrownWeight += material.weight;
      }
    });

    const currentRatio = totalNitrogen > 0 ? totalCarbon / totalNitrogen : 0;
    const totalWeight = totalGreenWeight + totalBrownWeight;

    return {
      currentRatio: parseFloat(currentRatio.toFixed(1)),
      totalGreenWeight,
      totalBrownWeight,
      totalWeight,
      totalCarbon,
      totalNitrogen,
    };
  }, [materials]);

  const getRatioStatus = () => {
    if (!calculation) return null;

    const { currentRatio } = calculation;

    if (currentRatio >= ACCEPTABLE_RANGE.min && currentRatio <= ACCEPTABLE_RANGE.max) {
      return {
        status: 'ideal',
        color: '#10b981',
        message: 'Excellent! Your compost ratio is in the ideal range.',
        icon: CheckCircle,
      };
    } else if (currentRatio < ACCEPTABLE_RANGE.min) {
      return {
        status: 'too-low',
        color: '#f59e0b',
        message: 'Your ratio is too low (too much nitrogen). Add more brown materials.',
        icon: AlertCircle,
      };
    } else {
      return {
        status: 'too-high',
        color: '#ef4444',
        message: 'Your ratio is too high (too much carbon). Add more green materials.',
        icon: AlertCircle,
      };
    }
  };

  const getSuggestions = () => {
    if (!calculation) return [];

    const { currentRatio, totalGreenWeight, totalBrownWeight } = calculation;
    const suggestions: string[] = [];

    if (currentRatio < ACCEPTABLE_RANGE.min) {
      const deficit = IDEAL_RATIO - currentRatio;
      suggestions.push(`Add more brown materials (leaves, cardboard, straw) to increase the C:N ratio.`);
      suggestions.push(`Try adding about ${(totalGreenWeight * 0.5).toFixed(1)} lbs of dry leaves or straw.`);
    } else if (currentRatio > ACCEPTABLE_RANGE.max) {
      const excess = currentRatio - IDEAL_RATIO;
      suggestions.push(`Add more green materials (grass, food scraps) to lower the C:N ratio.`);
      suggestions.push(`Try adding about ${(totalBrownWeight * 0.3).toFixed(1)} lbs of fresh grass clippings or food scraps.`);
    } else {
      suggestions.push('Your compost mix is well balanced!');
      suggestions.push('Keep turning your pile regularly and maintain moisture like a wrung-out sponge.');
    }

    return suggestions;
  };

  const ratioStatus = getRatioStatus();
  const suggestions = getSuggestions();

  const greenMaterials = MATERIAL_REFERENCES.filter(m => m.type === 'green');
  const brownMaterials = MATERIAL_REFERENCES.filter(m => m.type === 'brown');

  const getBalancePosition = () => {
    if (!calculation) return 50;
    const { currentRatio } = calculation;
    // Map ratio 0-60 to position 0-100
    const position = Math.min(100, Math.max(0, (currentRatio / 60) * 100));
    return position;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.compostRatio.compostRatioCalculator', 'Compost Ratio Calculator')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.compostRatio.calculateTheIdealCarbonTo', 'Calculate the ideal carbon to nitrogen (C:N) ratio for composting')}
                </p>
              </div>
            </div>
            {materials.length > 0 && (
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                onCopyToClipboard={handleCopyToClipboard}
                showImport={false}
                theme={theme}
              />
            )}
          </div>

          {/* Ideal Ratio Info */}
          <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} border-l-4 border-[#0D9488]`}>
            <div className="flex items-start gap-3">
              <Leaf className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? t('tools.compostRatio.text0d9488', 'text-[#0D9488]') : 'text-green-600'}`} />
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.compostRatio.idealCNRatio25', 'Ideal C:N Ratio: 25:1 to 35:1 (Target: 30:1)')}
                </p>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('tools.compostRatio.greenMaterialsAreNitrogenRich', 'Green materials are nitrogen-rich, brown materials are carbon-rich.')}
                </p>
              </div>
            </div>
          </div>

          {/* Add Material Form */}
          <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.compostRatio.addMaterials', 'Add Materials')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.compostRatio.selectAMaterial', 'Select a material...')}</option>
                <optgroup label="Green Materials (Nitrogen-rich)">
                  {greenMaterials.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name} (C:N {m.cnRatio}:1)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Brown Materials (Carbon-rich)">
                  {brownMaterials.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name} (C:N {m.cnRatio}:1)
                    </option>
                  ))}
                </optgroup>
              </select>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={t('tools.compostRatio.weightLbs', 'Weight (lbs)')}
                min="0"
                step="0.1"
                className={`w-full sm:w-32 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <button
                onClick={addMaterial}
                disabled={!selectedMaterial || !weight}
                className="px-4 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {t('tools.compostRatio.add', 'Add')}
              </button>
            </div>
          </div>

          {/* Materials List */}
          {materials.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.compostRatio.yourMaterials', 'Your Materials')}
                </h3>
                <button
                  onClick={resetAll}
                  className={`text-sm px-3 py-1 rounded-lg ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {t('tools.compostRatio.clearAll', 'Clear All')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      material.type === 'green'
                        ? theme === 'dark'
                          ? 'bg-green-900/30 border-green-700'
                          : 'bg-green-50 border-green-200'
                        : theme === 'dark'
                        ? 'bg-amber-900/30 border-amber-700'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          material.type === 'green' ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {material.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {material.weight} lbs | C:N {material.cnRatio}:1
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMaterial(material.id)}
                      className={`p-2 rounded-lg ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                          : 'hover:bg-gray-200 text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {calculation && (
            <div className="space-y-4 mb-6">
              {/* Visual Balance Indicator */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.compostRatio.cNRatioBalance', 'C:N Ratio Balance')}
                </h3>
                <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-yellow-400 via-green-500 to-red-400">
                  {/* Ideal zone indicator */}
                  <div
                    className="absolute top-0 h-full bg-green-500/30 border-x-2 border-green-600"
                    style={{
                      left: `${(ACCEPTABLE_RANGE.min / 60) * 100}%`,
                      width: `${((ACCEPTABLE_RANGE.max - ACCEPTABLE_RANGE.min) / 60) * 100}%`,
                    }}
                  />
                  {/* Current position marker */}
                  <div
                    className="absolute top-0 h-full w-1 bg-white shadow-lg transform -translate-x-1/2 transition-all duration-300"
                    style={{ left: `${getBalancePosition()}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {calculation.currentRatio}:1
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>0:1 (Too much N)</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>30:1 Ideal</span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>60:1 (Too much C)</span>
                </div>
              </div>

              {/* Ratio Result */}
              {ratioStatus && (
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: `${ratioStatus.color}15`, borderLeft: `4px solid ${ratioStatus.color}` }}
                >
                  <div className="flex items-start gap-3">
                    <ratioStatus.icon className="w-6 h-6 mt-0.5" style={{ color: ratioStatus.color }} />
                    <div>
                      <div className="text-2xl font-bold mb-1" style={{ color: ratioStatus.color }}>
                        Current Ratio: {calculation.currentRatio}:1
                      </div>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {ratioStatus.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostRatio.totalWeight', 'Total Weight')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {calculation.totalWeight.toFixed(1)} lbs
                  </p>
                </div>
                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{t('tools.compostRatio.greenMaterials', 'Green Materials')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                    {calculation.totalGreenWeight.toFixed(1)} lbs
                  </p>
                </div>
                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>{t('tools.compostRatio.brownMaterials', 'Brown Materials')}</p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                    {calculation.totalBrownWeight.toFixed(1)} lbs
                  </p>
                </div>
                <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.compostRatio.targetRatio', 'Target Ratio')}</p>
                  <p className={`text-xl font-bold text-[#0D9488]`}>30:1</p>
                </div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.compostRatio.recommendations', 'Recommendations')}
                  </h4>
                  <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#0D9488]">*</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {materials.length === 0 && (
            <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <Recycle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">{t('tools.compostRatio.noMaterialsAddedYet', 'No materials added yet')}</p>
              <p className="text-sm">{t('tools.compostRatio.startByAddingGreenAnd', 'Start by adding green and brown materials to calculate your compost ratio.')}</p>
            </div>
          )}

          {/* Material Reference Guide */}
          <button
            onClick={() => setShowReference(!showReference)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors mb-3`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.compostRatio.materialReferenceGuide', 'Material Reference Guide')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showReference ? '-' : '+'}
            </span>
          </button>

          {showReference && (
            <div className={`p-4 rounded-lg mb-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Green Materials */}
                <div>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    {t('tools.compostRatio.greenMaterialsNitrogenRich', 'Green Materials (Nitrogen-rich)')}
                  </h4>
                  <div className="space-y-2">
                    {greenMaterials.map(m => (
                      <div key={m.name} className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span>{m.name}</span>
                        <span className="font-mono">{m.cnRatio}:1</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Brown Materials */}
                <div>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    {t('tools.compostRatio.brownMaterialsCarbonRich', 'Brown Materials (Carbon-rich)')}
                  </h4>
                  <div className="space-y-2">
                    {brownMaterials.map(m => (
                      <div key={m.name} className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span>{m.name}</span>
                        <span className="font-mono">{m.cnRatio}:1</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Composting Tips */}
          <button
            onClick={() => setShowTips(!showTips)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Leaf className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.compostRatio.tipsForSuccessfulComposting', 'Tips for Successful Composting')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showTips ? '-' : '+'}
            </span>
          </button>

          {showTips && (
            <div className={`mt-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <ul className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-[#0D9488] font-bold">1.</span>
                  <span><strong>{t('tools.compostRatio.balanceIsKey', 'Balance is key:')}</strong> {t('tools.compostRatio.aimForRoughly23', 'Aim for roughly 2-3 parts brown to 1 part green by volume (not weight).')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0D9488] font-bold">2.</span>
                  <span><strong>{t('tools.compostRatio.moisture', 'Moisture:')}</strong> {t('tools.compostRatio.keepYourCompostAsMoist', 'Keep your compost as moist as a wrung-out sponge. Too dry slows decomposition, too wet causes odor.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0D9488] font-bold">3.</span>
                  <span><strong>{t('tools.compostRatio.aeration', 'Aeration:')}</strong> {t('tools.compostRatio.turnYourPileEvery1', 'Turn your pile every 1-2 weeks to introduce oxygen and speed up decomposition.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0D9488] font-bold">4.</span>
                  <span><strong>{t('tools.compostRatio.sizeMatters', 'Size matters:')}</strong> {t('tools.compostRatio.chopOrShredLargerMaterials', 'Chop or shred larger materials to increase surface area and speed breakdown.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0D9488] font-bold">5.</span>
                  <span><strong>{t('tools.compostRatio.avoid', 'Avoid:')}</strong> {t('tools.compostRatio.meatDairyDiseasedPlantsPet', 'Meat, dairy, diseased plants, pet waste, and treated wood - these can cause problems.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0D9488] font-bold">6.</span>
                  <span><strong>{t('tools.compostRatio.temperature', 'Temperature:')}</strong> {t('tools.compostRatio.aHotCompostPile130', 'A hot compost pile (130-160F) kills weed seeds and pathogens faster.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0D9488] font-bold">7.</span>
                  <span><strong>{t('tools.compostRatio.patience', 'Patience:')}</strong> {t('tools.compostRatio.finishedCompostTakes26', 'Finished compost takes 2-6 months depending on conditions and method.')}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompostRatioTool;
