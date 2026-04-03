import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Ruler, ThermometerSun, Sun, Info, Calculator, Leaf, DollarSign, Wind } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface GreenhouseCalculatorToolProps {
  uiConfig?: UIConfig;
}

type GreenhouseType = 'lean-to' | 'even-span' | 'gothic' | 'quonset' | 'a-frame';
type CoveringMaterial = 'glass' | 'polycarbonate' | 'polyethylene' | 'fiberglass';
type ClimateZone = 'cold' | 'moderate' | 'mild' | 'warm';

interface GreenhouseTypeInfo {
  name: string;
  description: string;
  heightMultiplier: number;
  costMultiplier: number;
}

interface CoveringInfo {
  name: string;
  rValue: number;
  lightTransmission: number;
  lifespan: number;
  costPerSqFt: number;
  description: string;
}

const greenhouseTypes: Record<GreenhouseType, GreenhouseTypeInfo> = {
  'lean-to': { name: 'Lean-to', description: 'Attaches to existing structure', heightMultiplier: 0.8, costMultiplier: 0.7 },
  'even-span': { name: 'Even-Span (Gable)', description: 'Traditional peaked roof', heightMultiplier: 1, costMultiplier: 1 },
  'gothic': { name: 'Gothic Arch', description: 'Curved peak, sheds snow well', heightMultiplier: 1.1, costMultiplier: 1.15 },
  'quonset': { name: 'Quonset (Hoop)', description: 'Semi-circular, economical', heightMultiplier: 0.7, costMultiplier: 0.6 },
  'a-frame': { name: 'A-Frame', description: 'Steep sides, unique look', heightMultiplier: 1.2, costMultiplier: 1.1 },
};

const coveringMaterials: Record<CoveringMaterial, CoveringInfo> = {
  'glass': { name: 'Glass', rValue: 0.9, lightTransmission: 90, lifespan: 25, costPerSqFt: 15, description: 'Classic, long-lasting, heavy' },
  'polycarbonate': { name: 'Polycarbonate (Twin-Wall)', rValue: 1.7, lightTransmission: 80, lifespan: 15, costPerSqFt: 8, description: 'Excellent insulation, durable' },
  'polyethylene': { name: 'Polyethylene Film', rValue: 0.87, lightTransmission: 85, lifespan: 4, costPerSqFt: 0.5, description: 'Economical, easy to install' },
  'fiberglass': { name: 'Fiberglass Panels', rValue: 1.0, lightTransmission: 75, lifespan: 15, costPerSqFt: 4, description: 'Durable, diffuses light well' },
};

const climateZones: Record<ClimateZone, { btuPerSqFt: number; description: string }> = {
  'cold': { btuPerSqFt: 50, description: 'Below 0°F winters (Zone 3-4)' },
  'moderate': { btuPerSqFt: 35, description: '0-20°F winters (Zone 5-6)' },
  'mild': { btuPerSqFt: 20, description: '20-40°F winters (Zone 7-8)' },
  'warm': { btuPerSqFt: 10, description: 'Above 40°F winters (Zone 9+)' },
};

export const GreenhouseCalculatorTool: React.FC<GreenhouseCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [length, setLength] = useState('16');
  const [width, setWidth] = useState('10');
  const [wallHeight, setWallHeight] = useState('6');
  const [greenhouseType, setGreenhouseType] = useState<GreenhouseType>('even-span');
  const [coveringMaterial, setCoveringMaterial] = useState<CoveringMaterial>('polycarbonate');
  const [climateZone, setClimateZone] = useState<ClimateZone>('moderate');
  const [minWinterTemp, setMinWinterTemp] = useState('20');
  const [targetTemp, setTargetTemp] = useState('60');

  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.length) setLength(String(prefillData.length));
      if (prefillData.width) setWidth(String(prefillData.width));
      if (prefillData.type) setGreenhouseType(prefillData.type as GreenhouseType);
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const typeInfo = greenhouseTypes[greenhouseType];
  const coveringInfo = coveringMaterials[coveringMaterial];
  const climateInfo = climateZones[climateZone];

  const calculations = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(wallHeight) || 0;
    const minTemp = parseFloat(minWinterTemp) || 0;
    const target = parseFloat(targetTemp) || 60;

    // Floor area
    const floorArea = l * w;

    // Roof area calculation (depends on type)
    let roofArea: number;
    const roofHeight = h * 0.5 * typeInfo.heightMultiplier; // peak height above wall

    if (greenhouseType === 'quonset') {
      // Semi-circular: circumference / 2 * length
      roofArea = (Math.PI * w / 2) * l;
    } else if (greenhouseType === 'gothic') {
      // Approximation for gothic arch
      roofArea = w * 1.2 * l;
    } else {
      // Gable/A-frame: two triangular sides
      const roofSlope = Math.sqrt(Math.pow(w / 2, 2) + Math.pow(roofHeight, 2));
      roofArea = roofSlope * 2 * l;
    }

    // Wall area
    const endWallArea = (w * h) + (w * roofHeight / 2); // rectangle + triangle
    const totalEndWalls = endWallArea * 2;
    const sideWallArea = l * h * 2;
    const totalWallArea = totalEndWalls + sideWallArea;

    // Total glazing area
    const totalGlazingArea = roofArea + totalWallArea;

    // Volume
    const volume = floorArea * (h + roofHeight / 2);

    // Covering material cost
    const coveringCost = totalGlazingArea * coveringInfo.costPerSqFt;

    // Frame cost estimate (rough: $3-5 per sq ft of floor area)
    const frameCost = floorArea * 4 * typeInfo.costMultiplier;

    // Foundation cost (perimeter * $15/ft for simple)
    const perimeter = 2 * (l + w);
    const foundationCost = perimeter * 15;

    // Heating requirements
    const tempDiff = target - minTemp;
    const heatLoss = (totalGlazingArea / coveringInfo.rValue) * tempDiff;
    const btuRequired = heatLoss * 1.3; // Add 30% safety factor

    // Alternative BTU calculation based on climate
    const btuByClimate = floorArea * climateInfo.btuPerSqFt;

    // Ventilation (need to exchange air volume every 1-2 minutes for summer)
    const cfmRequired = volume / 2;

    // Bench/growing space (typically 70-80% of floor area)
    const growingSpace = floorArea * 0.75;

    // Number of plants (varies widely, using averages)
    const plantsFlat = Math.floor(growingSpace * 4); // 4 plants per sq ft (seedlings)
    const plantsPot = Math.floor(growingSpace * 1); // 1 gallon pots

    // Total estimated cost
    const totalCost = coveringCost + frameCost + foundationCost;

    return {
      floorArea: floorArea.toFixed(0),
      roofArea: roofArea.toFixed(0),
      totalWallArea: totalWallArea.toFixed(0),
      totalGlazingArea: totalGlazingArea.toFixed(0),
      volume: volume.toFixed(0),
      perimeter: perimeter.toFixed(0),
      coveringCost: coveringCost.toFixed(0),
      frameCost: frameCost.toFixed(0),
      foundationCost: foundationCost.toFixed(0),
      totalCost: totalCost.toFixed(0),
      btuRequired: btuRequired.toFixed(0),
      btuByClimate: btuByClimate.toFixed(0),
      cfmRequired: cfmRequired.toFixed(0),
      growingSpace: growingSpace.toFixed(0),
      plantsFlat: plantsFlat.toFixed(0),
      plantsPot: plantsPot.toFixed(0),
      peakHeight: (h + roofHeight).toFixed(1),
    };
  }, [length, width, wallHeight, greenhouseType, coveringMaterial, climateZone, minWinterTemp, targetTemp, typeInfo, coveringInfo, climateInfo]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Home className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.greenhouseCalculator.greenhouseCalculator', 'Greenhouse Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.greenhouseCalculator.sizeMaterialsAndHeatingRequirements', 'Size, materials, and heating requirements')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Dimensions */}
        <div className="space-y-4">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Ruler className="w-4 h-4 text-teal-500" />
            {t('tools.greenhouseCalculator.dimensionsFeet', 'Dimensions (feet)')}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.length', 'Length')}</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                min="6"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.width', 'Width')}</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="6"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.wallHeight', 'Wall Height')}</label>
              <input
                type="number"
                value={wallHeight}
                onChange={(e) => setWallHeight(e.target.value)}
                min="4"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { l: 8, w: 6 },
              { l: 12, w: 8 },
              { l: 16, w: 10 },
              { l: 20, w: 12 },
              { l: 24, w: 14 },
            ].map(size => (
              <button
                key={`${size.l}x${size.w}`}
                onClick={() => { setLength(size.l.toString()); setWidth(size.w.toString()); }}
                className={`px-3 py-1 text-xs rounded ${
                  length === size.l.toString() && width === size.w.toString()
                    ? 'bg-teal-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size.l}' x {size.w}'
              </button>
            ))}
          </div>
        </div>

        {/* Greenhouse Type */}
        <div className="space-y-3">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Home className="w-4 h-4 text-teal-500" />
            {t('tools.greenhouseCalculator.greenhouseType', 'Greenhouse Type')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(Object.keys(greenhouseTypes) as GreenhouseType[]).map(type => (
              <button
                key={type}
                onClick={() => setGreenhouseType(type)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  greenhouseType === type
                    ? 'bg-teal-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {greenhouseTypes[type].name}
              </button>
            ))}
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{typeInfo.description}</p>
        </div>

        {/* Covering Material */}
        <div className="space-y-3">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Sun className="w-4 h-4 text-teal-500" />
            {t('tools.greenhouseCalculator.coveringMaterial', 'Covering Material')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(coveringMaterials) as CoveringMaterial[]).map(mat => (
              <button
                key={mat}
                onClick={() => setCoveringMaterial(mat)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  coveringMaterial === mat
                    ? 'bg-teal-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {coveringMaterials[mat].name}
              </button>
            ))}
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'} text-sm`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.greenhouseCalculator.rValue', 'R-Value:')}</span> <strong className="text-teal-500">{coveringInfo.rValue}</strong></div>
              <div><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.greenhouseCalculator.light', 'Light:')}</span> <strong className="text-teal-500">{coveringInfo.lightTransmission}%</strong></div>
              <div><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.greenhouseCalculator.life', 'Life:')}</span> <strong className="text-teal-500">{coveringInfo.lifespan} yrs</strong></div>
              <div><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.greenhouseCalculator.cost', 'Cost:')}</span> <strong className="text-teal-500">${coveringInfo.costPerSqFt}/sqft</strong></div>
            </div>
          </div>
        </div>

        {/* Climate/Heating */}
        <div className="space-y-3">
          <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <ThermometerSun className="w-4 h-4 text-teal-500" />
            {t('tools.greenhouseCalculator.climateHeating', 'Climate & Heating')}
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(climateZones) as ClimateZone[]).map(zone => (
              <button
                key={zone}
                onClick={() => setClimateZone(zone)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  climateZone === zone
                    ? 'bg-teal-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {zone.charAt(0).toUpperCase() + zone.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.minWinterTempF', 'Min Winter Temp (F)')}</label>
              <input
                type="number"
                value={minWinterTemp}
                onChange={(e) => setMinWinterTemp(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.targetInsideTempF', 'Target Inside Temp (F)')}</label>
              <input
                type="number"
                value={targetTemp}
                onChange={(e) => setTargetTemp(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calculator className="w-4 h-4 text-teal-500" />
            {t('tools.greenhouseCalculator.greenhouseSpecifications', 'Greenhouse Specifications')}
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-teal-500/10">
              <div className="text-2xl font-bold text-teal-500">{calculations.floorArea}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.sqFtFloor', 'sq ft floor')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <div className="text-2xl font-bold text-blue-500">{calculations.totalGlazingArea}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.sqFtGlazing', 'sq ft glazing')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/10">
              <div className="text-2xl font-bold text-purple-500">{calculations.volume}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.cubicFt', 'cubic ft')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/10">
              <div className="text-2xl font-bold text-amber-500">{calculations.peakHeight}'</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.peakHeight', 'peak height')}</div>
            </div>
          </div>

          {/* Heating & Ventilation */}
          <div className={`border-t pt-4 mb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ThermometerSun className="w-4 h-4 text-orange-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.heatingNeeded', 'Heating Needed')}</span>
                </div>
                <div className="font-bold text-orange-500 text-lg">{calculations.btuRequired} BTU/hr</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Or ~{calculations.btuByClimate} BTU by zone
                </div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.greenhouseCalculator.ventilation', 'Ventilation')}</span>
                </div>
                <div className="font-bold text-blue-500 text-lg">{calculations.cfmRequired} CFM</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {t('tools.greenhouseCalculator.fanCapacityNeeded', 'Fan capacity needed')}
                </div>
              </div>
            </div>
          </div>

          {/* Growing Space */}
          <div className={`border-t pt-4 mb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-green-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.greenhouseCalculator.growingCapacity', 'Growing Capacity')}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.greenhouseCalculator.benchSpace', 'Bench Space:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.growingSpace} sq ft</span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.greenhouseCalculator.seedlings', 'Seedlings:')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.plantsFlat}+</span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>1-gal pots: </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{calculations.plantsPot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 text-teal-500" />
            {t('tools.greenhouseCalculator.estimatedMaterialCosts', 'Estimated Material Costs')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{coveringInfo.name} ({calculations.totalGlazingArea} sq ft)</span>
              <span>${calculations.coveringCost}</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{t('tools.greenhouseCalculator.frameStructure', 'Frame & Structure')}</span>
              <span>${calculations.frameCost}</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Foundation ({calculations.perimeter} linear ft)</span>
              <span>${calculations.foundationCost}</span>
            </div>
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-teal-800' : 'border-teal-200'}`}>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.greenhouseCalculator.estimatedTotal', 'Estimated Total')}</span>
              <span className="text-2xl font-bold text-teal-500">${calculations.totalCost}</span>
            </div>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            * Does not include labor, heating system, ventilation, or accessories
          </p>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.greenhouseCalculator.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.greenhouseCalculator.orientLengthEastWestFor', 'Orient length east-west for maximum sun exposure')}</li>
                <li>{t('tools.greenhouseCalculator.allowFor3WideAisles', 'Allow for 3\' wide aisles between benches')}</li>
                <li>{t('tools.greenhouseCalculator.includeRoofVentsEqualTo', 'Include roof vents equal to 15-20% of floor area')}</li>
                <li>{t('tools.greenhouseCalculator.doubleLayerPolyWithInflation', 'Double-layer poly with inflation saves heating costs')}</li>
                <li>{t('tools.greenhouseCalculator.considerShadeClothForSummer', 'Consider shade cloth for summer heat management')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenhouseCalculatorTool;
