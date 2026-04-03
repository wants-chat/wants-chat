import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, Ruler, Mail, Scale, FoldVertical, Pencil, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type PaperSize = 'a4' | 'a5' | 'a6' | 'letter' | 'legal' | 'square6' | 'square8' | 'custom';
type Unit = 'mm' | 'in' | 'cm';

interface PaperDimensions {
  name: string;
  width: number; // in mm
  height: number; // in mm
  description: string;
}

interface EnvelopeSize {
  name: string;
  width: number; // in mm
  height: number; // in mm
  fitsCard: string;
}

interface PaperWeight {
  gsm: number;
  name: string;
  uses: string;
  thickness: string;
}

interface PaperCraftSizerToolProps {
  uiConfig?: UIConfig;
}

export const PaperCraftSizerTool: React.FC<PaperCraftSizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [activeTab, setActiveTab] = useState<'size' | 'scale' | 'envelope' | 'weight' | 'fold' | 'score'>('size');
  const [selectedSize, setSelectedSize] = useState<PaperSize>('a4');
  const [unit, setUnit] = useState<Unit>('mm');
  const [customWidth, setCustomWidth] = useState('210');
  const [customHeight, setCustomHeight] = useState('297');
  const [scalePercent, setScalePercent] = useState('100');
  const [cardWidth, setCardWidth] = useState('105');
  const [cardHeight, setCardHeight] = useState('148');
  const [foldCount, setFoldCount] = useState('1');
  const [foldDirection, setFoldDirection] = useState<'horizontal' | 'vertical'>('vertical');

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      if (params.paperSize && ['a4', 'a5', 'a6', 'letter', 'legal', 'square6', 'square8', 'custom'].includes(params.paperSize)) {
        setSelectedSize(params.paperSize as PaperSize);
        hasChanges = true;
      }
      if (params.customWidth) {
        setCustomWidth(String(params.customWidth));
        hasChanges = true;
      }
      if (params.customHeight) {
        setCustomHeight(String(params.customHeight));
        hasChanges = true;
      }
      if (params.scalePercent) {
        setScalePercent(String(params.scalePercent));
        hasChanges = true;
      }
      if (params.foldCount) {
        setFoldCount(String(params.foldCount));
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const paperSizes: Record<PaperSize, PaperDimensions> = {
    a4: { name: 'A4', width: 210, height: 297, description: 'Standard paper size' },
    a5: { name: 'A5', width: 148, height: 210, description: 'Half of A4, great for cards' },
    a6: { name: 'A6', width: 105, height: 148, description: 'Postcard size' },
    letter: { name: 'US Letter', width: 216, height: 279, description: 'Standard US paper' },
    legal: { name: 'US Legal', width: 216, height: 356, description: 'US legal documents' },
    square6: { name: '6" Square', width: 152, height: 152, description: 'Square card base' },
    square8: { name: '8" Square', width: 203, height: 203, description: 'Larger square card' },
    custom: { name: 'Custom', width: 0, height: 0, description: 'Enter your dimensions' },
  };

  const envelopeSizes: EnvelopeSize[] = [
    { name: 'C6', width: 114, height: 162, fitsCard: 'A6 card (105x148mm)' },
    { name: 'C5', width: 162, height: 229, fitsCard: 'A5 card (148x210mm)' },
    { name: 'C4', width: 229, height: 324, fitsCard: 'A4 flat (210x297mm)' },
    { name: 'DL', width: 110, height: 220, fitsCard: 'A4 tri-fold' },
    { name: '#10 (US)', width: 105, height: 241, fitsCard: 'Letter tri-fold' },
    { name: 'A2 (US)', width: 111, height: 146, fitsCard: '4.25x5.5" card' },
    { name: 'A6 (US)', width: 121, height: 165, fitsCard: '4.5x6.25" card' },
    { name: 'A7 (US)', width: 133, height: 184, fitsCard: '5x7" card' },
  ];

  const paperWeights: PaperWeight[] = [
    { gsm: 80, name: 'Copy Paper', uses: 'Printing, drafts, practice', thickness: '0.1mm' },
    { gsm: 120, name: 'Text Weight', uses: 'Letterheads, flyers', thickness: '0.15mm' },
    { gsm: 160, name: 'Light Card', uses: 'Light cards, invitations', thickness: '0.2mm' },
    { gsm: 200, name: 'Medium Card', uses: 'Postcards, covers', thickness: '0.25mm' },
    { gsm: 250, name: 'Heavy Card', uses: 'Business cards, greeting cards', thickness: '0.3mm' },
    { gsm: 300, name: 'Cardstock', uses: 'High-quality cards, bases', thickness: '0.38mm' },
    { gsm: 350, name: 'Thick Cardstock', uses: 'Box making, sturdy cards', thickness: '0.45mm' },
    { gsm: 400, name: 'Mount Board', uses: 'Backing, structural elements', thickness: '0.5mm' },
  ];

  const convertUnit = (mm: number, toUnit: Unit): number => {
    switch (toUnit) {
      case 'in': return mm / 25.4;
      case 'cm': return mm / 10;
      default: return mm;
    }
  };

  const formatDimension = (mm: number): string => {
    const value = convertUnit(mm, unit);
    return unit === 'mm' ? value.toFixed(0) : value.toFixed(2);
  };

  const getUnitSuffix = (): string => {
    switch (unit) {
      case 'in': return '"';
      case 'cm': return 'cm';
      default: return 'mm';
    }
  };

  const currentPaper = useMemo(() => {
    if (selectedSize === 'custom') {
      return {
        width: parseFloat(customWidth) || 0,
        height: parseFloat(customHeight) || 0,
      };
    }
    return paperSizes[selectedSize];
  }, [selectedSize, customWidth, customHeight]);

  const scaledDimensions = useMemo(() => {
    const scale = parseFloat(scalePercent) / 100 || 1;
    return {
      width: currentPaper.width * scale,
      height: currentPaper.height * scale,
    };
  }, [currentPaper, scalePercent]);

  const recommendedEnvelope = useMemo(() => {
    const cardW = parseFloat(cardWidth) || 0;
    const cardH = parseFloat(cardHeight) || 0;

    return envelopeSizes.find(env =>
      env.width >= cardW + 6 && env.height >= cardH + 6
    ) || envelopeSizes[envelopeSizes.length - 1];
  }, [cardWidth, cardHeight]);

  const foldDimensions = useMemo(() => {
    const folds = parseInt(foldCount) || 1;
    let width = currentPaper.width;
    let height = currentPaper.height;

    for (let i = 0; i < folds; i++) {
      if (foldDirection === 'vertical') {
        width = width / 2;
      } else {
        height = height / 2;
      }
    }

    return { width, height, panels: Math.pow(2, folds) };
  }, [currentPaper, foldCount, foldDirection]);

  const scoringGuide = useMemo(() => {
    const folds = parseInt(foldCount) || 1;
    const lines: { position: number; direction: string }[] = [];

    if (foldDirection === 'vertical') {
      const segmentWidth = currentPaper.width / Math.pow(2, folds);
      for (let i = 1; i < Math.pow(2, folds); i++) {
        lines.push({
          position: segmentWidth * i,
          direction: 'vertical',
        });
      }
    } else {
      const segmentHeight = currentPaper.height / Math.pow(2, folds);
      for (let i = 1; i < Math.pow(2, folds); i++) {
        lines.push({
          position: segmentHeight * i,
          direction: 'horizontal',
        });
      }
    }

    return lines;
  }, [currentPaper, foldCount, foldDirection]);

  const tabs = [
    { id: 'size', label: 'Paper Size', icon: Ruler },
    { id: 'scale', label: 'Scale', icon: Scissors },
    { id: 'envelope', label: 'Envelope', icon: Mail },
    { id: 'weight', label: 'Weight', icon: Scale },
    { id: 'fold', label: 'Fold', icon: FoldVertical },
    { id: 'score', label: 'Score', icon: Pencil },
  ] as const;

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg"><Scissors className="w-5 h-5 text-pink-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.paperCraftSizerTool', 'Paper Craft Sizer Tool')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.paperCraftSizer.sizeScaleAndFoldCalculations', 'Size, scale, and fold calculations for crafts')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-pink-500 font-medium">{t('tools.paperCraftSizer.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 ${activeTab === tab.id ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Unit Selector */}
        <div className="flex gap-2">
          {(['mm', 'cm', 'in'] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`flex-1 py-2 rounded-lg ${unit === u ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Paper Size Tab */}
        {activeTab === 'size' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(paperSizes) as PaperSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-2 rounded-lg text-sm ${selectedSize === size ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {paperSizes[size].name}
                </button>
              ))}
            </div>

            {selectedSize === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Width ({unit})
                  </label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Height ({unit})
                  </label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            )}

            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedSize === 'custom' ? 'Custom Size' : paperSizes[selectedSize].name}
                </h4>
                <span className="text-pink-500 font-bold">
                  {formatDimension(currentPaper.width)} x {formatDimension(currentPaper.height)}{getUnitSuffix()}
                </span>
              </div>
              {selectedSize !== 'custom' && (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {paperSizes[selectedSize].description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paperCraftSizer.halfSize', 'Half Size')}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDimension(currentPaper.width / 2)} x {formatDimension(currentPaper.height / 2)}{getUnitSuffix()}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paperCraftSizer.quarterSize', 'Quarter Size')}</div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDimension(currentPaper.width / 4)} x {formatDimension(currentPaper.height / 4)}{getUnitSuffix()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scale Tab */}
        {activeTab === 'scale' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.paperCraftSizer.scalePercentage', 'Scale Percentage')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {[50, 75, 100, 125, 150, 200].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setScalePercent(percent.toString())}
                    className={`py-2 px-4 rounded-lg ${parseInt(scalePercent) === percent ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={scalePercent}
                onChange={(e) => setScalePercent(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder={t('tools.paperCraftSizer.customPercentage', 'Custom percentage')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-4 h-4 text-pink-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.original', 'Original')}</span>
                </div>
                <div className="text-2xl font-bold text-pink-500">
                  {formatDimension(currentPaper.width)} x {formatDimension(currentPaper.height)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{getUnitSuffix()}</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Scissors className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Scaled ({scalePercent}%)</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  {formatDimension(scaledDimensions.width)} x {formatDimension(scaledDimensions.height)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{getUnitSuffix()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Envelope Tab */}
        {activeTab === 'envelope' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Card Width ({unit})
                </label>
                <input
                  type="number"
                  value={cardWidth}
                  onChange={(e) => setCardWidth(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Card Height ({unit})
                </label>
                <input
                  type="number"
                  value={cardHeight}
                  onChange={(e) => setCardHeight(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-pink-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.recommendedEnvelope', 'Recommended Envelope')}</h4>
              </div>
              <div className="text-2xl font-bold text-pink-500">{recommendedEnvelope.name}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatDimension(recommendedEnvelope.width)} x {formatDimension(recommendedEnvelope.height)}{getUnitSuffix()}
              </div>
              <div className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {recommendedEnvelope.fitsCard}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.allEnvelopeSizes', 'All Envelope Sizes')}</h4>
              <div className="grid gap-2">
                {envelopeSizes.map((env) => (
                  <div
                    key={env.name}
                    className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{env.name}</span>
                      <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDimension(env.width)} x {formatDimension(env.height)}{getUnitSuffix()}
                      </span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{env.fitsCard}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weight Tab */}
        {activeTab === 'weight' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-pink-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.paperWeightGuide', 'Paper Weight Guide')}</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.paperCraftSizer.gsmGramsPerSquareMeter', 'GSM (grams per square meter) indicates paper thickness and quality')}
              </p>
            </div>

            <div className="space-y-2">
              {paperWeights.map((weight) => (
                <div
                  key={weight.gsm}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-pink-500 font-bold">{weight.gsm} GSM</span>
                      <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {weight.name}
                      </span>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ~{weight.thickness}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{weight.uses}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fold Tab */}
        {activeTab === 'fold' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.paperCraftSizer.numberOfFolds', 'Number of Folds')}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFoldCount(n.toString())}
                    className={`flex-1 py-2 rounded-lg ${parseInt(foldCount) === n ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.paperCraftSizer.foldDirection', 'Fold Direction')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFoldDirection('vertical')}
                  className={`flex-1 py-2 rounded-lg ${foldDirection === 'vertical' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('tools.paperCraftSizer.verticalPortrait', 'Vertical (Portrait)')}
                </button>
                <button
                  onClick={() => setFoldDirection('horizontal')}
                  className={`flex-1 py-2 rounded-lg ${foldDirection === 'horizontal' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t('tools.paperCraftSizer.horizontalLandscape', 'Horizontal (Landscape)')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-4 h-4 text-pink-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.originalSize', 'Original Size')}</span>
                </div>
                <div className="text-xl font-bold text-pink-500">
                  {formatDimension(currentPaper.width)} x {formatDimension(currentPaper.height)}{getUnitSuffix()}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FoldVertical className="w-4 h-4 text-purple-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.foldedSize', 'Folded Size')}</span>
                </div>
                <div className="text-xl font-bold text-purple-500">
                  {formatDimension(foldDimensions.width)} x {formatDimension(foldDimensions.height)}{getUnitSuffix()}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.paperCraftSizer.thisCreates', 'This creates')}</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {foldDimensions.panels} panels
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                with {foldCount} fold{parseInt(foldCount) > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Score Tab */}
        {activeTab === 'score' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Pencil className="w-5 h-5 text-pink-500" />
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.scoringGuide', 'Scoring Guide')}</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Score lines for clean folds on {paperSizes[selectedSize]?.name || 'Custom'} paper
              </p>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.paperCraftSizer.numberOfEqualSections', 'Number of Equal Sections')}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFoldCount(n.toString())}
                    className={`flex-1 py-2 rounded-lg ${parseInt(foldCount) === n ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {Math.pow(2, n)} parts
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFoldDirection('vertical')}
                className={`flex-1 py-2 rounded-lg ${foldDirection === 'vertical' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.paperCraftSizer.verticalLines', 'Vertical Lines')}
              </button>
              <button
                onClick={() => setFoldDirection('horizontal')}
                className={`flex-1 py-2 rounded-lg ${foldDirection === 'horizontal' ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.paperCraftSizer.horizontalLines', 'Horizontal Lines')}
              </button>
            </div>

            <div className="space-y-2">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.paperCraftSizer.scoreLinePositions', 'Score Line Positions')}</h4>
              {scoringGuide.length > 0 ? (
                <div className="grid gap-2">
                  {scoringGuide.map((line, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                    >
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Line {index + 1}
                      </span>
                      <span className="text-pink-500 font-bold">
                        {formatDimension(line.position)}{getUnitSuffix()} from {line.direction === 'vertical' ? t('tools.paperCraftSizer.leftEdge', 'left edge') : t('tools.paperCraftSizer.topEdge', 'top edge')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.paperCraftSizer.noScoreLinesNeededFor', 'No score lines needed for single panel')}</p>
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.paperCraftSizer.scoringTips', 'Scoring Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>- Use a bone folder or scoring tool</li>
                    <li>- Score on the inside of the fold</li>
                    <li>- Apply firm, even pressure</li>
                    <li>- Use a ruler as a guide for straight lines</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.paperCraftSizer.generalTips', 'General Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Always measure twice, cut once</li>
                <li>- Add 3-6mm clearance for envelopes</li>
                <li>- Use 250+ GSM for sturdy cards</li>
                <li>- Grain direction affects folding quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperCraftSizerTool;
