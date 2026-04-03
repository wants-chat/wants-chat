import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Square, Ruler, Calculator, Plus, Minus, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type FenceStyle = 'privacy' | 'picket' | 'chain_link' | 'ranch';
type InputMethod = 'perimeter' | 'dimensions';

interface Gate {
  id: string;
  width: number;
  type: 'single' | 'double';
}

interface MaterialPrices {
  postPrice: number;
  railPrice: number;
  picketPrice: number;
  panelPrice: number;
  concretePrice: number;
  hardwarePrice: number;
  gatePrice: number;
}

interface FenceResult {
  posts: number;
  rails: number;
  pickets: number;
  panels: number;
  concreteBags: number;
  nails: number;
  screws: number;
  brackets: number;
  totalPerimeter: number;
  fenceablePerimeter: number;
  gates: Gate[];
  costs: {
    posts: number;
    rails: number;
    picketsOrPanels: number;
    concrete: number;
    hardware: number;
    gates: number;
    total: number;
  };
}

const FENCE_STYLES: Record<FenceStyle, { name: string; description: string; defaultHeight: number; postSpacing: number; railsPerSection: number }> = {
  privacy: {
    name: 'Privacy Fence',
    description: 'Solid fence for maximum privacy (6-8 ft typical)',
    defaultHeight: 6,
    postSpacing: 8,
    railsPerSection: 3,
  },
  picket: {
    name: 'Picket Fence',
    description: 'Classic decorative fence (3-4 ft typical)',
    defaultHeight: 4,
    postSpacing: 8,
    railsPerSection: 2,
  },
  chain_link: {
    name: 'Chain Link',
    description: 'Durable metal mesh fence (4-6 ft typical)',
    defaultHeight: 4,
    postSpacing: 10,
    railsPerSection: 1,
  },
  ranch: {
    name: 'Ranch/Split Rail',
    description: 'Open rail fence for large properties (3-4 ft typical)',
    defaultHeight: 4,
    postSpacing: 8,
    railsPerSection: 3,
  },
};

const DEFAULT_PRICES: MaterialPrices = {
  postPrice: 15,
  railPrice: 8,
  picketPrice: 2.5,
  panelPrice: 45,
  concretePrice: 5,
  hardwarePrice: 0.1,
  gatePrice: 150,
};

const COLUMNS: ColumnConfig[] = [
  { key: 'totalPerimeter', header: 'Total Perimeter (ft)', type: 'number', format: (v) => (v as number).toFixed(2) },
  { key: 'fenceablePerimeter', header: 'Fenceable Perimeter (ft)', type: 'number', format: (v) => (v as number).toFixed(2) },
  { key: 'posts', header: 'Posts (4x4)', type: 'number' },
  { key: 'rails', header: 'Rails', type: 'number' },
  { key: 'pickets', header: 'Pickets', type: 'number' },
  { key: 'panels', header: 'Panels/Rolls', type: 'number' },
  { key: 'concreteBags', header: 'Concrete Bags', type: 'number' },
  { key: 'nails', header: 'Nails', type: 'number' },
  { key: 'screws', header: 'Screws', type: 'number' },
  { key: 'brackets', header: 'Brackets', type: 'number' },
  { key: 'costs.total', header: 'Total Cost ($)', type: 'number', format: (v) => `$${(v as number).toFixed(2)}` },
];

interface FenceCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const FenceCalculatorTool: React.FC<FenceCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Input states
  const [inputMethod, setInputMethod] = useState<InputMethod>('perimeter');
  const [perimeter, setPerimeter] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [fenceStyle, setFenceStyle] = useState<FenceStyle>('privacy');
  const [fenceHeight, setFenceHeight] = useState('6');
  const [postSpacing, setPostSpacing] = useState('8');
  const [gates, setGates] = useState<Gate[]>([]);
  const [prices, setPrices] = useState<MaterialPrices>(DEFAULT_PRICES);
  const [showPricing, setShowPricing] = useState(false);
  const [result, setResult] = useState<FenceResult | null>(null);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setInputMethod('dimensions');
        setLength(params.numbers[0].toString());
        setWidth(params.numbers[1].toString());
        if (params.numbers[2]) {
          setFenceHeight(params.numbers[2].toString());
        }
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setInputMethod('dimensions');
        setLength(params.length.toString());
        setWidth(params.width.toString());
        setIsPrefilled(true);
      } else if (params.amount) {
        setPerimeter(params.amount.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleStyleChange = (style: FenceStyle) => {
    setFenceStyle(style);
    setFenceHeight(FENCE_STYLES[style].defaultHeight.toString());
    setPostSpacing(FENCE_STYLES[style].postSpacing.toString());
  };

  const addGate = () => {
    const newGate: Gate = {
      id: Date.now().toString(),
      width: 4,
      type: 'single',
    };
    setGates([...gates, newGate]);
  };

  const removeGate = (id: string) => {
    setGates(gates.filter(g => g.id !== id));
  };

  const updateGate = (id: string, updates: Partial<Gate>) => {
    setGates(gates.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const calculateFence = () => {
    let totalPerimeter: number;

    if (inputMethod === 'perimeter') {
      totalPerimeter = parseFloat(perimeter);
    } else {
      const l = parseFloat(length);
      const w = parseFloat(width);
      if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) {
        setValidationMessage('Please enter valid dimensions');
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }
      totalPerimeter = 2 * (l + w);
    }

    if (isNaN(totalPerimeter) || totalPerimeter <= 0) {
      setValidationMessage('Please enter a valid perimeter length');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const height = parseFloat(fenceHeight);
    const spacing = parseFloat(postSpacing);

    if (isNaN(height) || height <= 0 || isNaN(spacing) || spacing <= 0) {
      setValidationMessage('Please enter valid fence height and post spacing');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate gate widths
    const totalGateWidth = gates.reduce((sum, gate) => sum + gate.width, 0);
    const fenceablePerimeter = totalPerimeter - totalGateWidth;

    if (fenceablePerimeter <= 0) {
      setValidationMessage('Gate widths exceed the total perimeter');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Calculate posts (one at each end + one every 'spacing' feet)
    const sections = Math.ceil(fenceablePerimeter / spacing);
    const posts = sections + 1 + (gates.length * 2); // Extra posts for gate frames

    // Calculate rails based on fence style
    const styleConfig = FENCE_STYLES[fenceStyle];
    const rails = sections * styleConfig.railsPerSection;

    // Calculate pickets or panels
    let pickets = 0;
    let panels = 0;

    if (fenceStyle === 'privacy' || fenceStyle === 'picket') {
      // Pickets are typically 5.5 inches wide with 0.5 inch gap = 6 inches per picket
      const picketsPerFoot = 2;
      pickets = Math.ceil(fenceablePerimeter * picketsPerFoot);
    } else if (fenceStyle === 'chain_link') {
      // Chain link is sold in rolls, typically covers sections
      panels = sections;
    }

    // Concrete bags (1-2 bags per post for 4x4 posts)
    const concreteBags = posts * 2;

    // Hardware
    const nails = pickets > 0 ? pickets * 8 : 0; // 8 nails per picket
    const screws = rails * 4; // 4 screws per rail end
    const brackets = posts * styleConfig.railsPerSection; // One bracket per rail per post

    // Calculate costs
    const costs = {
      posts: posts * prices.postPrice,
      rails: rails * prices.railPrice,
      picketsOrPanels: fenceStyle === 'chain_link' ? panels * prices.panelPrice : pickets * prices.picketPrice,
      concrete: concreteBags * prices.concretePrice,
      hardware: (nails + screws) * prices.hardwarePrice + brackets * 1.5,
      gates: gates.reduce((sum, gate) => sum + (gate.type === 'double' ? prices.gatePrice * 1.8 : prices.gatePrice), 0),
      total: 0,
    };
    costs.total = costs.posts + costs.rails + costs.picketsOrPanels + costs.concrete + costs.hardware + costs.gates;

    setResult({
      posts,
      rails,
      pickets,
      panels,
      concreteBags,
      nails,
      screws,
      brackets,
      totalPerimeter,
      fenceablePerimeter,
      gates: [...gates],
      costs,
    });
  };

  const reset = () => {
    setInputMethod('perimeter');
    setPerimeter('');
    setLength('');
    setWidth('');
    setFenceStyle('privacy');
    setFenceHeight('6');
    setPostSpacing('8');
    setGates([]);
    setPrices(DEFAULT_PRICES);
    setResult(null);
  };

  const handleExportCSV = () => {
    if (!result) return;
    const data = [result];
    exportToCSV(data, COLUMNS, { filename: 'fence-calculator-results' });
  };

  const handleExportExcel = () => {
    if (!result) return;
    const data = [result];
    exportToExcel(data, COLUMNS, { filename: 'fence-calculator-results' });
  };

  const handleExportJSON = () => {
    if (!result) return;
    const data = [result];
    exportToJSON(data, { filename: 'fence-calculator-results' });
  };

  const handleExportPDF = async () => {
    if (!result) return;
    const data = [result];
    await exportToPDF(data, COLUMNS, {
      filename: 'fence-calculator-results',
      title: 'Fence Calculator Results',
      subtitle: 'Materials and Cost Estimate'
    });
  };

  const handlePrint = () => {
    if (!result) return;
    const data = [result];
    printData(data, COLUMNS, { title: 'Fence Calculator Results' });
  };

  const handleCopyToClipboard = async () => {
    if (!result) return;
    const data = [result];
    return await copyUtil(data, COLUMNS, 'tab');
  };

  // Visual preview calculations
  const previewData = useMemo(() => {
    let perim = 0;
    if (inputMethod === 'perimeter') {
      perim = parseFloat(perimeter) || 0;
    } else {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      perim = 2 * (l + w);
    }

    const spacing = parseFloat(postSpacing) || 8;
    const sections = perim > 0 ? Math.ceil(perim / spacing) : 0;

    return { perimeter: perim, sections };
  }, [inputMethod, perimeter, length, width, postSpacing]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-5xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Square className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.fenceCalculator.fenceCalculator', 'Fence Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.fenceCalculator.estimateMaterialsNeededForYour', 'Estimate materials needed for your fencing project')}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              {/* Input Method Toggle */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.fenceCalculator.inputMethod', 'Input Method')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInputMethod('perimeter')}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      inputMethod === 'perimeter'
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.fenceCalculator.perimeterLength', 'Perimeter Length')}
                  </button>
                  <button
                    onClick={() => setInputMethod('dimensions')}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      inputMethod === 'dimensions'
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.fenceCalculator.lengthXWidth', 'Length x Width')}
                  </button>
                </div>
              </div>

              {/* Perimeter or Dimensions Input */}
              {inputMethod === 'perimeter' ? (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fenceCalculator.totalPerimeterFeet', 'Total Perimeter (feet)')}
                  </label>
                  <div className="relative">
                    <Ruler className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="number"
                      value={perimeter}
                      onChange={(e) => setPerimeter(e.target.value)}
                      placeholder={t('tools.fenceCalculator.enterTotalFenceLength', 'Enter total fence length')}
                      min="0"
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fenceCalculator.lengthFeet', 'Length (feet)')}
                    </label>
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder={t('tools.fenceCalculator.length', 'Length')}
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.fenceCalculator.widthFeet', 'Width (feet)')}
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder={t('tools.fenceCalculator.width', 'Width')}
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>
              )}

              {/* Fence Style */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.fenceCalculator.fenceStyle', 'Fence Style')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(FENCE_STYLES) as [FenceStyle, typeof FENCE_STYLES[FenceStyle]][]).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => handleStyleChange(key)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        fenceStyle === key
                          ? 'bg-[#0D9488] text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium text-sm">{style.name}</div>
                      <div className={`text-xs ${fenceStyle === key ? 'text-white/80' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {style.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Height and Spacing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fenceCalculator.fenceHeightFeet', 'Fence Height (feet)')}
                  </label>
                  <input
                    type="number"
                    value={fenceHeight}
                    onChange={(e) => setFenceHeight(e.target.value)}
                    placeholder={t('tools.fenceCalculator.height', 'Height')}
                    min="1"
                    max="10"
                    step="0.5"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fenceCalculator.postSpacingFeet', 'Post Spacing (feet)')}
                  </label>
                  <input
                    type="number"
                    value={postSpacing}
                    onChange={(e) => setPostSpacing(e.target.value)}
                    placeholder={t('tools.fenceCalculator.spacing', 'Spacing')}
                    min="4"
                    max="12"
                    step="1"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>

              {/* Gates Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fenceCalculator.gates', 'Gates')}
                  </label>
                  <button
                    onClick={addGate}
                    className="flex items-center gap-1 text-sm text-[#0D9488] hover:text-[#0F766E] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('tools.fenceCalculator.addGate', 'Add Gate')}
                  </button>
                </div>
                {gates.length === 0 ? (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center py-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {t('tools.fenceCalculator.noGatesAddedClickAdd', 'No gates added. Click "Add Gate" to include gates in your estimate.')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gates.map((gate, index) => (
                      <div
                        key={gate.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Gate {index + 1}
                        </span>
                        <select
                          value={gate.type}
                          onChange={(e) => updateGate(gate.id, { type: e.target.value as 'single' | 'double' })}
                          className={`px-3 py-1 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="single">{t('tools.fenceCalculator.single', 'Single')}</option>
                          <option value="double">{t('tools.fenceCalculator.double', 'Double')}</option>
                        </select>
                        <input
                          type="number"
                          value={gate.width}
                          onChange={(e) => updateGate(gate.id, { width: parseFloat(e.target.value) || 0 })}
                          min="3"
                          max="16"
                          step="1"
                          className={`w-20 px-3 py-1 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ft</span>
                        <button
                          onClick={() => removeGate(gate.id)}
                          className="ml-auto text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing Toggle */}
              <button
                onClick={() => setShowPricing(!showPricing)}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showPricing ? t('tools.fenceCalculator.hide', 'Hide') : t('tools.fenceCalculator.show', 'Show')} Custom Pricing
              </button>

              {/* Custom Pricing */}
              {showPricing && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.fenceCalculator.materialPricesPerUnit', 'Material Prices (per unit)')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'postPrice', label: 'Post ($)' },
                      { key: 'railPrice', label: 'Rail ($)' },
                      { key: 'picketPrice', label: 'Picket ($)' },
                      { key: 'panelPrice', label: 'Panel ($)' },
                      { key: 'concretePrice', label: 'Concrete Bag ($)' },
                      { key: 'gatePrice', label: 'Gate ($)' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {label}
                        </label>
                        <input
                          type="number"
                          value={prices[key as keyof MaterialPrices]}
                          onChange={(e) => setPrices({ ...prices, [key]: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.5"
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={calculateFence}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  {t('tools.fenceCalculator.calculate', 'Calculate')}
                </button>
                <button
                  onClick={reset}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('tools.fenceCalculator.reset', 'Reset')}
                </button>
                {result && (
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
            </div>

            {/* Preview & Results Section */}
            <div className="space-y-4">
              {/* Visual Preview */}
              <Card className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.fenceCalculator.fenceLayoutPreview', 'Fence Layout Preview')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`relative h-48 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  } flex items-center justify-center overflow-hidden`}>
                    {previewData.perimeter > 0 ? (
                      <div className="relative w-40 h-32">
                        {/* Top side */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#0D9488] rounded flex items-center">
                          {Array.from({ length: Math.min(Math.ceil(previewData.sections / 4), 8) }).map((_, i) => (
                            <div
                              key={`top-${i}`}
                              className="absolute w-2 h-2 bg-amber-600 rounded-full -top-0.5"
                              style={{ left: `${(i / Math.max(Math.ceil(previewData.sections / 4), 1)) * 100}%` }}
                            />
                          ))}
                        </div>
                        {/* Right side */}
                        <div className="absolute top-0 right-0 w-1 h-full bg-[#0D9488] rounded flex flex-col items-center">
                          {Array.from({ length: Math.min(Math.ceil(previewData.sections / 4), 6) }).map((_, i) => (
                            <div
                              key={`right-${i}`}
                              className="absolute w-2 h-2 bg-amber-600 rounded-full -right-0.5"
                              style={{ top: `${(i / Math.max(Math.ceil(previewData.sections / 4), 1)) * 100}%` }}
                            />
                          ))}
                        </div>
                        {/* Bottom side */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0D9488] rounded flex items-center">
                          {Array.from({ length: Math.min(Math.ceil(previewData.sections / 4), 8) }).map((_, i) => (
                            <div
                              key={`bottom-${i}`}
                              className="absolute w-2 h-2 bg-amber-600 rounded-full -bottom-0.5"
                              style={{ left: `${(i / Math.max(Math.ceil(previewData.sections / 4), 1)) * 100}%` }}
                            />
                          ))}
                        </div>
                        {/* Left side */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#0D9488] rounded flex flex-col items-center">
                          {Array.from({ length: Math.min(Math.ceil(previewData.sections / 4), 6) }).map((_, i) => (
                            <div
                              key={`left-${i}`}
                              className="absolute w-2 h-2 bg-amber-600 rounded-full -left-0.5"
                              style={{ top: `${(i / Math.max(Math.ceil(previewData.sections / 4), 1)) * 100}%` }}
                            />
                          ))}
                        </div>
                        {/* Gate indicator */}
                        {gates.length > 0 && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-4 border-2 border-dashed border-amber-500 bg-amber-500/20 rounded" />
                        )}
                      </div>
                    ) : (
                      <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Square className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{t('tools.fenceCalculator.enterDimensionsToSeePreview', 'Enter dimensions to see preview')}</p>
                      </div>
                    )}
                  </div>
                  <div className={`mt-3 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex items-center justify-center gap-4`}>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-[#0D9488] rounded" /> Fence
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-amber-600 rounded-full" /> Posts
                    </span>
                    {gates.length > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-2 border border-dashed border-amber-500 rounded" /> Gate
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <>
                  {/* Summary */}
                  <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                    theme === 'dark' ? 'bg-gray-700' : t('tools.fenceCalculator.bg0d948810', 'bg-[#0D9488]/10')
                  }`}>
                    <div className="text-center mb-4">
                      <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.fenceCalculator.estimatedTotalCost', 'Estimated Total Cost')}
                      </div>
                      <div className="text-4xl font-bold text-[#0D9488]">
                        ${result.costs.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fenceCalculator.totalPerimeter', 'Total Perimeter')}</div>
                        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{result.totalPerimeter} ft</div>
                      </div>
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fenceCalculator.fenceLength', 'Fence Length')}</div>
                        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{result.fenceablePerimeter} ft</div>
                      </div>
                    </div>
                  </div>

                  {/* Materials List */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.fenceCalculator.materialsNeeded', 'Materials Needed')}
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Posts (4x4)', value: result.posts, cost: result.costs.posts },
                        { label: 'Rails', value: result.rails, cost: result.costs.rails },
                        ...(result.pickets > 0 ? [{ label: 'Pickets', value: result.pickets, cost: result.costs.picketsOrPanels }] : []),
                        ...(result.panels > 0 ? [{ label: 'Panels/Rolls', value: result.panels, cost: result.costs.picketsOrPanels }] : []),
                        { label: 'Concrete Bags', value: result.concreteBags, cost: result.costs.concrete },
                      ].map((item, idx) => (
                        <div key={idx} className={`flex justify-between items-center py-2 border-b ${
                          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                        }`}>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                          <div className="text-right">
                            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {item.value.toLocaleString()}
                            </span>
                            <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              (${item.cost.toFixed(2)})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hardware */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.fenceCalculator.hardware', 'Hardware')}
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {result.nails > 0 && (
                        <div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fenceCalculator.nails', 'Nails')}</div>
                          <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{result.nails.toLocaleString()}</div>
                        </div>
                      )}
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fenceCalculator.screws', 'Screws')}</div>
                        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{result.screws.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.fenceCalculator.brackets', 'Brackets')}</div>
                        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{result.brackets.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className={`text-right mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Hardware Cost: ${result.costs.hardware.toFixed(2)}
                    </div>
                  </div>

                  {/* Gates */}
                  {result.gates.length > 0 && (
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Gates ({result.gates.length})
                      </h3>
                      <div className="space-y-2">
                        {result.gates.map((gate, idx) => (
                          <div key={gate.id} className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span>Gate {idx + 1} ({gate.type}, {gate.width}ft)</span>
                            <span className="font-medium">
                              ${(gate.type === 'double' ? prices.gatePrice * 1.8 : prices.gatePrice).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className={`text-right mt-2 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Total Gates: ${result.costs.gates.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* Cost Breakdown */}
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <DollarSign className="w-5 h-5" />
                      {t('tools.fenceCalculator.costBreakdown', 'Cost Breakdown')}
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Posts', value: result.costs.posts },
                        { label: 'Rails', value: result.costs.rails },
                        { label: fenceStyle === 'chain_link' ? t('tools.fenceCalculator.panels', 'Panels') : t('tools.fenceCalculator.pickets', 'Pickets'), value: result.costs.picketsOrPanels },
                        { label: 'Concrete', value: result.costs.concrete },
                        { label: 'Hardware', value: result.costs.hardware },
                        ...(result.costs.gates > 0 ? [{ label: 'Gates', value: result.costs.gates }] : []),
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${item.value.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className={`border-t-2 pt-2 mt-2 flex justify-between ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.fenceCalculator.total', 'Total')}</span>
                        <span className="font-bold text-[#0D9488] text-lg">${result.costs.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.fenceCalculator.fenceInstallationTips', 'Fence Installation Tips')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>
                <strong>{t('tools.fenceCalculator.postDepth', 'Post Depth:')}</strong> Posts should be buried 1/3 of their total length (typically 2-3 feet) for stability.
              </p>
              <p>
                <strong>{t('tools.fenceCalculator.concrete', 'Concrete:')}</strong> Each post hole typically requires 1-2 bags of concrete mix depending on post size and soil conditions.
              </p>
              <p>
                <strong>{t('tools.fenceCalculator.extraMaterials', 'Extra Materials:')}</strong> It's recommended to purchase 10-15% extra materials to account for waste, mistakes, and future repairs.
              </p>
              <p className="text-xs mt-2 italic">
                {t('tools.fenceCalculator.notePricesAreEstimatesAnd', 'Note: Prices are estimates and may vary by location. Always check local building codes and property lines before installing a fence.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Toast */}
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {validationMessage}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default FenceCalculatorTool;
