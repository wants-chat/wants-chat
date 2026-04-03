import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Layers, Ruler, Package, Info, ThermometerSun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type AreaType = 'wall' | 'attic' | 'floor';
type InsulationType = 'fiberglass_batts' | 'blown_in' | 'spray_foam';

interface InsulationConfig {
  name: string;
  description: string;
  rValuePerInch: number;
  coveragePerUnit: number; // sq ft per bag/roll
  unitName: string;
  costPerUnit: number; // approximate cost in USD
}

interface RValueOption {
  value: number;
  label: string;
  recommended: AreaType[];
}

interface InsulationCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const InsulationCalculatorTool: React.FC<InsulationCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [areaType, setAreaType] = useState<AreaType>('wall');
  const [insulationType, setInsulationType] = useState<InsulationType>('fiberglass_batts');
  const [length, setLength] = useState('20');
  const [width, setWidth] = useState('10');
  const [targetRValue, setTargetRValue] = useState(13);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 2) {
        setLength(params.numbers[0].toString());
        setWidth(params.numbers[1].toString());
        setIsPrefilled(true);
      } else if (params.length && params.width) {
        setLength(params.length.toString());
        setWidth(params.width.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const areaTypes: Record<AreaType, { name: string; icon: string; description: string }> = {
    wall: {
      name: 'Wall',
      icon: '🧱',
      description: 'Exterior or interior walls',
    },
    attic: {
      name: 'Attic',
      icon: '🏠',
      description: 'Attic floor or ceiling',
    },
    floor: {
      name: 'Floor',
      icon: '🪵',
      description: 'Raised floor or crawlspace',
    },
  };

  const insulationTypes: Record<InsulationType, InsulationConfig> = {
    fiberglass_batts: {
      name: 'Fiberglass Batts',
      description: 'Pre-cut panels, easy DIY installation',
      rValuePerInch: 3.2,
      coveragePerUnit: 40, // sq ft per roll (typical R-13)
      unitName: 'rolls',
      costPerUnit: 25,
    },
    blown_in: {
      name: 'Blown-In',
      description: 'Loose fill, great for irregular spaces',
      rValuePerInch: 2.5,
      coveragePerUnit: 25, // sq ft per bag at R-30
      unitName: 'bags',
      costPerUnit: 15,
    },
    spray_foam: {
      name: 'Spray Foam',
      description: 'Best seal, highest R-value per inch',
      rValuePerInch: 6.5,
      coveragePerUnit: 12, // board feet per kit (1 inch thick, 12 sq ft)
      unitName: 'kits',
      costPerUnit: 45,
    },
  };

  const rValueOptions: RValueOption[] = [
    { value: 11, label: 'R-11', recommended: ['wall'] },
    { value: 13, label: 'R-13', recommended: ['wall'] },
    { value: 15, label: 'R-15', recommended: ['wall'] },
    { value: 19, label: 'R-19', recommended: ['wall', 'floor'] },
    { value: 21, label: 'R-21', recommended: ['wall', 'floor'] },
    { value: 30, label: 'R-30', recommended: ['attic', 'floor'] },
    { value: 38, label: 'R-38', recommended: ['attic'] },
    { value: 49, label: 'R-49', recommended: ['attic'] },
    { value: 60, label: 'R-60', recommended: ['attic'] },
  ];

  const config = insulationTypes[insulationType];

  const calculations = useMemo(() => {
    const lengthFt = parseFloat(length) || 0;
    const widthFt = parseFloat(width) || 0;
    const squareFootage = lengthFt * widthFt;

    // Calculate thickness required to achieve target R-value
    const thicknessInches = targetRValue / config.rValuePerInch;

    // Adjust coverage based on thickness (thicker = less coverage per unit)
    const baseThickness = insulationType === 'fiberglass_batts' ? 3.5 : insulationType === 'blown_in' ? 10 : 1;
    const thicknessMultiplier = thicknessInches / baseThickness;
    const adjustedCoverage = config.coveragePerUnit / thicknessMultiplier;

    // Calculate units needed (add 10% for waste)
    const unitsNeeded = Math.ceil((squareFootage / adjustedCoverage) * 1.1);

    // Estimated cost
    const estimatedCost = unitsNeeded * config.costPerUnit;

    return {
      squareFootage: squareFootage.toFixed(0),
      thicknessInches: thicknessInches.toFixed(1),
      unitsNeeded: unitsNeeded,
      estimatedCost: estimatedCost.toFixed(0),
      coveragePerUnit: adjustedCoverage.toFixed(1),
    };
  }, [length, width, targetRValue, config, insulationType]);

  const getRecommendedRValues = () => {
    return rValueOptions.filter((opt) => opt.recommended.includes(areaType));
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Home className="w-5 h-5 text-emerald-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.insulationCalculator.insulationCalculator', 'Insulation Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insulationCalculator.calculateMaterialsNeededForYour', 'Calculate materials needed for your project')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Area Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.insulationCalculator.areaType', 'Area Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(areaTypes) as AreaType[]).map((type) => (
              <button
                key={type}
                onClick={() => setAreaType(type)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${areaType === type ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <span className="text-lg">{areaTypes[type].icon}</span>
                <span>{areaTypes[type].name}</span>
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {areaTypes[areaType].description}
          </p>
        </div>

        {/* Dimensions Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Ruler className="w-4 h-4 inline mr-1" />
            {t('tools.insulationCalculator.dimensionsFeet', 'Dimensions (feet)')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insulationCalculator.length', 'Length')}</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder={t('tools.insulationCalculator.length2', 'Length')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insulationCalculator.width', 'Width')}</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder={t('tools.insulationCalculator.width2', 'Width')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Insulation Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Layers className="w-4 h-4 inline mr-1" />
            {t('tools.insulationCalculator.insulationType', 'Insulation Type')}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(insulationTypes) as InsulationType[]).map((type) => (
              <button
                key={type}
                onClick={() => setInsulationType(type)}
                className={`py-3 px-4 rounded-lg text-left ${insulationType === type ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <div className="font-medium">{insulationTypes[type].name}</div>
                <div className={`text-xs ${insulationType === type ? 'text-emerald-100' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {insulationTypes[type].description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Insulation Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-emerald-500 font-bold">R-{config.rValuePerInch}/inch</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.insulationCalculator.coverage', 'Coverage:')}</span> ~{config.coveragePerUnit} sq ft/{config.unitName.slice(0, -1)}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.insulationCalculator.cost', 'Cost:')}</span> ~${config.costPerUnit}/{config.unitName.slice(0, -1)}
            </div>
          </div>
        </div>

        {/* R-Value Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <ThermometerSun className="w-4 h-4 inline mr-1" />
            {t('tools.insulationCalculator.targetRValue', 'Target R-Value')}
          </label>
          <div className="flex flex-wrap gap-2">
            {rValueOptions.map((opt) => {
              const isRecommended = opt.recommended.includes(areaType);
              return (
                <button
                  key={opt.value}
                  onClick={() => setTargetRValue(opt.value)}
                  className={`py-2 px-3 rounded-lg text-sm relative ${targetRValue === opt.value ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} ${isRecommended && targetRValue !== opt.value ? 'ring-2 ring-emerald-500/50' : ''}`}
                >
                  {opt.label}
                  {isRecommended && targetRValue !== opt.value && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Recommended for {areaTypes[areaType].name.toLowerCase()}: {getRecommendedRValues().map((r) => r.label).join(', ')}
          </p>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-emerald-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.insulationCalculator.area', 'Area')}</span>
            </div>
            <div className="text-3xl font-bold text-emerald-500">{calculations.squareFootage}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.insulationCalculator.squareFeet', 'square feet')}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.insulationCalculator.thickness', 'Thickness')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.thicknessInches}"</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.insulationCalculator.inchesRequired', 'inches required')}
            </div>
          </div>
        </div>

        {/* Materials Needed */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.insulationCalculator.materialsNeeded', 'Materials Needed')}</span>
          </div>
          <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.unitsNeeded} {config.unitName}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            (~{calculations.coveragePerUnit} sq ft coverage per {config.unitName.slice(0, -1)} at R-{targetRValue})
          </div>
          <div className={`text-lg font-semibold text-emerald-500 mt-2`}>
            Estimated Cost: ${calculations.estimatedCost}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('tools.insulationCalculator.includes10ForWasteOverlap', 'Includes 10% for waste/overlap')}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.insulationCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>Higher R-values = better insulation</li>
                <li>{t('tools.insulationCalculator.atticsTypicallyNeedR38', 'Attics typically need R-38 to R-60 in cold climates')}</li>
                <li>{t('tools.insulationCalculator.wallsAreUsuallyR13', 'Walls are usually R-13 to R-21')}</li>
                <li>{t('tools.insulationCalculator.doNotCompressInsulationIt', 'Do not compress insulation - it reduces effectiveness')}</li>
                <li>{t('tools.insulationCalculator.alwaysWearProtectiveGearWhen', 'Always wear protective gear when installing')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsulationCalculatorTool;
