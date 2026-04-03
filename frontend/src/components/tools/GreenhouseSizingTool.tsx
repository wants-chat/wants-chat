import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Thermometer, Wind, DollarSign, Ruler, Info, Grid3X3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GreenhouseSizingToolProps {
  uiConfig?: UIConfig;
}

type PlantType = 'vegetables' | 'herbs' | 'flowers' | 'tropicals' | 'succulents' | 'seedlings';
type GreenhouseType = 'hobby' | 'lean-to' | 'freestanding' | 'commercial';
type ClimateZone = 'cold' | 'temperate' | 'warm' | 'hot';

interface PlantConfig {
  name: string;
  spacePerPlant: number; // square feet
  heightRequirement: string;
  tempRange: string;
  description: string;
}

interface GreenhouseConfig {
  name: string;
  costPerSqFt: number; // USD
  heatingMultiplier: number;
  description: string;
}

export const GreenhouseSizingTool: React.FC<GreenhouseSizingToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [plantType, setPlantType] = useState<PlantType>('vegetables');
  const [greenhouseType, setGreenhouseType] = useState<GreenhouseType>('hobby');
  const [climateZone, setClimateZone] = useState<ClimateZone>('temperate');
  const [plantCount, setPlantCount] = useState('50');
  const [walkwayWidth, setWalkwayWidth] = useState('3');
  const [workbenchArea, setWorkbenchArea] = useState('20');
  const [includeHeating, setIncludeHeating] = useState(true);
  const [includeVentilation, setIncludeVentilation] = useState(true);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.plantType) setPlantType(prefillData.plantType as PlantType);
      if (prefillData.greenhouseType) setGreenhouseType(prefillData.greenhouseType as GreenhouseType);
      if (prefillData.climateZone) setClimateZone(prefillData.climateZone as ClimateZone);
      if (prefillData.plantCount) setPlantCount(String(prefillData.plantCount));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const plantTypes: Record<PlantType, PlantConfig> = {
    vegetables: {
      name: 'Vegetables',
      spacePerPlant: 2.5,
      heightRequirement: '6-8 ft',
      tempRange: '60-75°F (15-24°C)',
      description: 'Tomatoes, peppers, cucumbers, etc.',
    },
    herbs: {
      name: 'Herbs',
      spacePerPlant: 1.0,
      heightRequirement: '4-6 ft',
      tempRange: '55-70°F (13-21°C)',
      description: 'Basil, mint, cilantro, parsley, etc.',
    },
    flowers: {
      name: 'Flowers',
      spacePerPlant: 1.5,
      heightRequirement: '6-8 ft',
      tempRange: '55-75°F (13-24°C)',
      description: 'Roses, orchids, chrysanthemums, etc.',
    },
    tropicals: {
      name: 'Tropical Plants',
      spacePerPlant: 4.0,
      heightRequirement: '10-12 ft',
      tempRange: '70-85°F (21-29°C)',
      description: 'Palms, ferns, tropical fruits, etc.',
    },
    succulents: {
      name: 'Succulents & Cacti',
      spacePerPlant: 0.5,
      heightRequirement: '4-6 ft',
      tempRange: '50-80°F (10-27°C)',
      description: 'Low water, compact plants',
    },
    seedlings: {
      name: 'Seedlings & Starts',
      spacePerPlant: 0.25,
      heightRequirement: '4-6 ft',
      tempRange: '65-75°F (18-24°C)',
      description: 'Starting seeds and young plants',
    },
  };

  const greenhouseTypes: Record<GreenhouseType, GreenhouseConfig> = {
    hobby: {
      name: 'Hobby',
      costPerSqFt: 15,
      heatingMultiplier: 1.0,
      description: 'Small, basic structure for home gardeners',
    },
    'lean-to': {
      name: 'Lean-To',
      costPerSqFt: 20,
      heatingMultiplier: 0.7,
      description: 'Attached to existing building, shares wall',
    },
    freestanding: {
      name: 'Freestanding',
      costPerSqFt: 25,
      heatingMultiplier: 1.2,
      description: 'Standalone structure, more space',
    },
    commercial: {
      name: 'Commercial',
      costPerSqFt: 35,
      heatingMultiplier: 1.5,
      description: 'Large-scale, professional grade',
    },
  };

  const climateZones: Record<ClimateZone, { name: string; heatingBTU: number; coolingCFM: number }> = {
    cold: { name: 'Cold (USDA 3-5)', heatingBTU: 25, coolingCFM: 1.5 },
    temperate: { name: 'Temperate (USDA 6-7)', heatingBTU: 18, coolingCFM: 2.0 },
    warm: { name: 'Warm (USDA 8-9)', heatingBTU: 10, coolingCFM: 2.5 },
    hot: { name: 'Hot (USDA 10+)', heatingBTU: 5, coolingCFM: 3.0 },
  };

  const plantConfig = plantTypes[plantType];
  const ghConfig = greenhouseTypes[greenhouseType];
  const climate = climateZones[climateZone];

  const calculations = useMemo(() => {
    const numPlants = parseInt(plantCount) || 0;
    const walkway = parseFloat(walkwayWidth) || 0;
    const workbench = parseFloat(workbenchArea) || 0;

    // Growing area calculation
    const growingArea = numPlants * plantConfig.spacePerPlant;

    // Walkway calculation (assume 2 main aisles for access)
    const estimatedLength = Math.sqrt(growingArea * 1.5); // Approximate length
    const walkwayArea = walkway * estimatedLength * 2;

    // Total area
    const totalArea = growingArea + walkwayArea + workbench;

    // Dimensions (assuming 2:3 ratio width:length)
    const width = Math.sqrt(totalArea / 1.5);
    const length = width * 1.5;

    // Heating requirements (BTU per sq ft based on climate)
    const heatingBTU = totalArea * climate.heatingBTU * ghConfig.heatingMultiplier;

    // Ventilation needs (CFM - cubic feet per minute)
    const avgHeight = 8; // Assume 8ft average height
    const volume = totalArea * avgHeight;
    const ventilationCFM = volume * climate.coolingCFM / 60; // Air changes per hour / 60

    // Number of vents needed (assume each vent provides 200 CFM)
    const ventsNeeded = Math.ceil(ventilationCFM / 200);

    // Cost estimation
    const structureCost = totalArea * ghConfig.costPerSqFt;
    const heatingCost = includeHeating ? (heatingBTU / 1000) * 50 : 0; // $50 per 1000 BTU capacity
    const ventilationCost = includeVentilation ? ventsNeeded * 150 : 0; // $150 per vent
    const benchCost = workbench * 8; // $8 per sq ft of benching
    const totalCost = structureCost + heatingCost + ventilationCost + benchCost;

    return {
      growingArea: growingArea.toFixed(0),
      walkwayArea: walkwayArea.toFixed(0),
      totalArea: totalArea.toFixed(0),
      width: width.toFixed(1),
      length: length.toFixed(1),
      heatingBTU: Math.round(heatingBTU).toLocaleString(),
      ventilationCFM: Math.round(ventilationCFM),
      ventsNeeded,
      structureCost: Math.round(structureCost).toLocaleString(),
      heatingCost: Math.round(heatingCost).toLocaleString(),
      ventilationCost: Math.round(ventilationCost).toLocaleString(),
      benchCost: Math.round(benchCost).toLocaleString(),
      totalCost: Math.round(totalCost).toLocaleString(),
    };
  }, [plantCount, walkwayWidth, workbenchArea, plantConfig, ghConfig, climate, includeHeating, includeVentilation]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><Leaf className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.greenhouseSizing.greenhouseSizingTool', 'Greenhouse Sizing Tool')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.greenhouseSizing.calculateSizeHeatingVentilationCosts', 'Calculate size, heating, ventilation & costs')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Plant Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.greenhouseSizing.plantType', 'Plant Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(plantTypes) as PlantType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlantType(p)}
                className={`py-2 px-3 rounded-lg text-sm ${plantType === p ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {plantTypes[p].name}
              </button>
            ))}
          </div>
        </div>

        {/* Plant Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{plantConfig.name}</h4>
            <span className="text-green-500 font-bold">{plantConfig.spacePerPlant} sq ft/plant</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.greenhouseSizing.height', 'Height:')}</span> {plantConfig.heightRequirement}
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.greenhouseSizing.temp', 'Temp:')}</span> {plantConfig.tempRange}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {plantConfig.description}
          </p>
        </div>

        {/* Greenhouse Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.greenhouseSizing.greenhouseType', 'Greenhouse Type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(greenhouseTypes) as GreenhouseType[]).map((g) => (
              <button
                key={g}
                onClick={() => setGreenhouseType(g)}
                className={`py-2 px-3 rounded-lg text-sm ${greenhouseType === g ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {greenhouseTypes[g].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {ghConfig.description}
          </p>
        </div>

        {/* Climate Zone */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.greenhouseSizing.climateZone', 'Climate Zone')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(climateZones) as ClimateZone[]).map((c) => (
              <button
                key={c}
                onClick={() => setClimateZone(c)}
                className={`py-2 px-3 rounded-lg text-sm ${climateZone === c ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {climateZones[c].name}
              </button>
            ))}
          </div>
        </div>

        {/* Plant Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Grid3X3 className="w-4 h-4 inline mr-1" />
            {t('tools.greenhouseSizing.numberOfPlants', 'Number of Plants')}
          </label>
          <div className="flex gap-2 mb-2">
            {[25, 50, 100, 200].map((n) => (
              <button
                key={n}
                onClick={() => setPlantCount(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(plantCount) === n ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={plantCount}
            onChange={(e) => setPlantCount(e.target.value)}
            placeholder={t('tools.greenhouseSizing.enterPlantCount', 'Enter plant count')}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Walkway & Workbench */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.greenhouseSizing.walkwayWidthFt', 'Walkway Width (ft)')}
            </label>
            <input
              type="number"
              value={walkwayWidth}
              onChange={(e) => setWalkwayWidth(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.greenhouseSizing.workbenchAreaSqFt', 'Workbench Area (sq ft)')}
            </label>
            <input
              type="number"
              value={workbenchArea}
              onChange={(e) => setWorkbenchArea(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-4">
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={includeHeating}
              onChange={(e) => setIncludeHeating(e.target.checked)}
              className="w-4 h-4 rounded text-green-500"
            />
            {t('tools.greenhouseSizing.includeHeating', 'Include Heating')}
          </label>
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={includeVentilation}
              onChange={(e) => setIncludeVentilation(e.target.checked)}
              className="w-4 h-4 rounded text-green-500"
            />
            {t('tools.greenhouseSizing.includeVentilation', 'Include Ventilation')}
          </label>
        </div>

        {/* Size Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.greenhouseSizing.totalSize', 'Total Size')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.totalArea} sq ft</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.width}' x {calculations.length}'
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.greenhouseSizing.areaBreakdown', 'Area Breakdown')}</span>
            </div>
            <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <div>Growing: {calculations.growingArea} sq ft</div>
              <div>Walkways: {calculations.walkwayArea} sq ft</div>
              <div>Workbench: {workbenchArea} sq ft</div>
            </div>
          </div>
        </div>

        {/* Heating & Ventilation */}
        <div className="grid grid-cols-2 gap-4">
          {includeHeating && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.greenhouseSizing.heating', 'Heating')}</span>
              </div>
              <div className="text-2xl font-bold text-orange-500">{calculations.heatingBTU} BTU</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.greenhouseSizing.estimatedCapacityNeeded', 'Estimated capacity needed')}
              </div>
            </div>
          )}
          {includeVentilation && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-sky-900/20 border-sky-800' : 'bg-sky-50 border-sky-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-sky-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.greenhouseSizing.ventilation', 'Ventilation')}</span>
              </div>
              <div className="text-2xl font-bold text-sky-500">{calculations.ventilationCFM} CFM</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ~{calculations.ventsNeeded} vents recommended
              </div>
            </div>
          )}
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.greenhouseSizing.costEstimate', 'Cost Estimate')}</span>
          </div>
          <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex justify-between">
              <span>Structure ({ghConfig.name})</span>
              <span>${calculations.structureCost}</span>
            </div>
            {includeHeating && (
              <div className="flex justify-between">
                <span>{t('tools.greenhouseSizing.heatingSystem', 'Heating System')}</span>
                <span>${calculations.heatingCost}</span>
              </div>
            )}
            {includeVentilation && (
              <div className="flex justify-between">
                <span>Ventilation ({calculations.ventsNeeded} vents)</span>
                <span>${calculations.ventilationCost}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t('tools.greenhouseSizing.benchesShelving', 'Benches & Shelving')}</span>
              <span>${calculations.benchCost}</span>
            </div>
            <div className={`flex justify-between pt-2 border-t font-bold text-lg ${isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
              <span>{t('tools.greenhouseSizing.totalEstimate', 'Total Estimate')}</span>
              <span className="text-green-500">${calculations.totalCost}</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.greenhouseSizing.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>* Add 10-20% extra space for future expansion</li>
                <li>* South-facing orientation maximizes natural light</li>
                <li>* Consider automated vents for temperature control</li>
                <li>* Insulated glazing reduces heating costs by 30-40%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenhouseSizingTool;
