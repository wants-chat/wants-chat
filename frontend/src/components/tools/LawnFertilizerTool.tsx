import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Calculator, Scale, Calendar, Info, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type GrassType = 'kentucky-bluegrass' | 'bermuda' | 'fescue' | 'zoysia' | 'st-augustine' | 'ryegrass';
type FertilizerType = 'balanced' | 'starter' | 'high-nitrogen' | 'fall-winter' | 'organic' | 'custom';
type LawnSizeUnit = 'sqft' | 'sqm' | 'acre';

interface GrassConfig {
  name: string;
  nitrogenNeed: number; // lbs N per 1000 sqft per year
  applicationsPerYear: number;
  bestSeasons: string[];
  description: string;
}

interface FertilizerConfig {
  name: string;
  npk: [number, number, number]; // N-P-K ratio
  description: string;
  bestFor: string;
}

interface SpreaderSetting {
  type: string;
  granular: string;
  broadcast: string;
}

interface LawnFertilizerToolProps {
  uiConfig?: UIConfig;
}

export const LawnFertilizerTool: React.FC<LawnFertilizerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [lawnSize, setLawnSize] = useState('5000');
  const [sizeUnit, setSizeUnit] = useState<LawnSizeUnit>('sqft');
  const [grassType, setGrassType] = useState<GrassType>('kentucky-bluegrass');
  const [fertilizerType, setFertilizerType] = useState<FertilizerType>('balanced');
  const [customNPK, setCustomNPK] = useState({ n: '10', p: '10', k: '10' });
  const [bagWeight, setBagWeight] = useState('25');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length >= 1) {
        setLawnSize(params.numbers[0].toString());
        setIsPrefilled(true);
      } else if (params.amount) {
        setLawnSize(params.amount.toString());
        setIsPrefilled(true);
      } else if (params.area) {
        setLawnSize(params.area.toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const grassTypes: Record<GrassType, GrassConfig> = {
    'kentucky-bluegrass': {
      name: 'Kentucky Bluegrass',
      nitrogenNeed: 3.5,
      applicationsPerYear: 4,
      bestSeasons: ['Spring', 'Fall'],
      description: 'Cool-season grass, needs consistent nitrogen',
    },
    'bermuda': {
      name: 'Bermuda Grass',
      nitrogenNeed: 4.0,
      applicationsPerYear: 5,
      bestSeasons: ['Late Spring', 'Summer'],
      description: 'Warm-season grass, heavy feeder',
    },
    'fescue': {
      name: 'Tall Fescue',
      nitrogenNeed: 2.5,
      applicationsPerYear: 3,
      bestSeasons: ['Fall', 'Early Spring'],
      description: 'Cool-season grass, drought tolerant',
    },
    'zoysia': {
      name: 'Zoysia Grass',
      nitrogenNeed: 2.0,
      applicationsPerYear: 3,
      bestSeasons: ['Late Spring', 'Summer'],
      description: 'Warm-season grass, slow growing',
    },
    'st-augustine': {
      name: 'St. Augustine',
      nitrogenNeed: 3.0,
      applicationsPerYear: 4,
      bestSeasons: ['Spring', 'Summer'],
      description: 'Warm-season grass, shade tolerant',
    },
    'ryegrass': {
      name: 'Perennial Ryegrass',
      nitrogenNeed: 3.0,
      applicationsPerYear: 4,
      bestSeasons: ['Fall', 'Spring'],
      description: 'Cool-season grass, quick establishment',
    },
  };

  const fertilizerTypes: Record<FertilizerType, FertilizerConfig> = {
    'balanced': {
      name: 'Balanced (10-10-10)',
      npk: [10, 10, 10],
      description: 'Equal parts N-P-K for general maintenance',
      bestFor: 'General lawn maintenance',
    },
    'starter': {
      name: 'Starter (18-24-12)',
      npk: [18, 24, 12],
      description: 'High phosphorus for root development',
      bestFor: 'New lawns and overseeding',
    },
    'high-nitrogen': {
      name: 'High Nitrogen (30-0-4)',
      npk: [30, 0, 4],
      description: 'Promotes lush green growth',
      bestFor: 'Spring green-up and growth',
    },
    'fall-winter': {
      name: 'Fall/Winter (22-0-14)',
      npk: [22, 0, 14],
      description: 'High potassium for cold hardiness',
      bestFor: 'Fall preparation and root strength',
    },
    'organic': {
      name: 'Organic (4-3-3)',
      npk: [4, 3, 3],
      description: 'Slow-release, natural nutrients',
      bestFor: 'Environmentally conscious care',
    },
    'custom': {
      name: 'Custom NPK',
      npk: [10, 10, 10],
      description: 'Enter your own NPK values',
      bestFor: 'Specific soil needs',
    },
  };

  const spreaderSettings: SpreaderSetting[] = [
    { type: 'Scotts EdgeGuard', granular: '3.5 - 4', broadcast: '4 - 4.5' },
    { type: 'Scotts Turf Builder', granular: '4 - 5', broadcast: '5 - 5.5' },
    { type: 'Vigoro/Earthway', granular: '12 - 14', broadcast: '14 - 16' },
    { type: 'Generic Drop', granular: '5 - 6', broadcast: 'N/A' },
  ];

  const grassConfig = grassTypes[grassType];
  const fertConfig = fertilizerTypes[fertilizerType];

  const npk = fertilizerType === 'custom'
    ? [parseFloat(customNPK.n) || 0, parseFloat(customNPK.p) || 0, parseFloat(customNPK.k) || 0] as [number, number, number]
    : fertConfig.npk;

  const calculations = useMemo(() => {
    let sizeInSqFt = parseFloat(lawnSize) || 0;

    // Convert to square feet if needed
    if (sizeUnit === 'sqm') {
      sizeInSqFt = sizeInSqFt * 10.764;
    } else if (sizeUnit === 'acre') {
      sizeInSqFt = sizeInSqFt * 43560;
    }

    // Calculate nitrogen needed per application (lbs)
    const nitrogenPerApplication = (grassConfig.nitrogenNeed / grassConfig.applicationsPerYear) * (sizeInSqFt / 1000);

    // Calculate fertilizer needed based on NPK
    // Formula: Fertilizer lbs = Nitrogen needed / (N percentage / 100)
    const nitrogenPercentage = npk[0] / 100;
    const fertilizerNeeded = nitrogenPercentage > 0 ? nitrogenPerApplication / nitrogenPercentage : 0;

    // Calculate bags needed
    const bagWeightNum = parseFloat(bagWeight) || 25;
    const bagsNeeded = fertilizerNeeded / bagWeightNum;

    // Annual totals
    const annualFertilizer = fertilizerNeeded * grassConfig.applicationsPerYear;
    const annualBags = bagsNeeded * grassConfig.applicationsPerYear;

    // Application rate (lbs per 1000 sqft)
    const applicationRate = (fertilizerNeeded / sizeInSqFt) * 1000;

    // Convert to kg for metric users
    const fertilizerKg = fertilizerNeeded * 0.453592;
    const applicationRateKgPer100sqm = applicationRate * 0.453592 * 0.929;

    return {
      sizeInSqFt: sizeInSqFt.toFixed(0),
      nitrogenPerApplication: nitrogenPerApplication.toFixed(2),
      fertilizerNeeded: fertilizerNeeded.toFixed(1),
      fertilizerKg: fertilizerKg.toFixed(1),
      bagsNeeded: bagsNeeded.toFixed(1),
      annualFertilizer: annualFertilizer.toFixed(1),
      annualBags: annualBags.toFixed(1),
      applicationRate: applicationRate.toFixed(2),
      applicationRateKg: applicationRateKgPer100sqm.toFixed(2),
      applicationsPerYear: grassConfig.applicationsPerYear,
    };
  }, [lawnSize, sizeUnit, grassConfig, npk, bagWeight]);

  const getSchedule = () => {
    const schedules: Record<string, string[]> = {
      'Spring': ['Early April', 'Late May'],
      'Summer': ['June', 'July', 'August'],
      'Fall': ['September', 'October'],
      'Late Spring': ['May', 'Early June'],
      'Early Spring': ['March', 'Early April'],
    };

    return grassConfig.bestSeasons.flatMap(season => schedules[season] || [season]);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg"><Leaf className="w-5 h-5 text-green-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lawnFertilizer.lawnFertilizerCalculator', 'Lawn Fertilizer Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lawnFertilizer.calculateExactFertilizerNeedsFor', 'Calculate exact fertilizer needs for your lawn')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Lawn Size Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lawnFertilizer.lawnSize', 'Lawn Size')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={lawnSize}
              onChange={(e) => setLawnSize(e.target.value)}
              placeholder={t('tools.lawnFertilizer.enterLawnSize', 'Enter lawn size')}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              value={sizeUnit}
              onChange={(e) => setSizeUnit(e.target.value as LawnSizeUnit)}
              className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="sqft">{t('tools.lawnFertilizer.sqFt', 'sq ft')}</option>
              <option value="sqm">{t('tools.lawnFertilizer.sqM', 'sq m')}</option>
              <option value="acre">acres</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            {[1000, 2500, 5000, 10000].map((size) => (
              <button
                key={size}
                onClick={() => { setLawnSize(size.toString()); setSizeUnit('sqft'); }}
                className={`flex-1 py-1.5 text-sm rounded-lg ${parseInt(lawnSize) === size && sizeUnit === 'sqft' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {size.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Grass Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lawnFertilizer.grassType', 'Grass Type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(grassTypes) as GrassType[]).map((g) => (
              <button
                key={g}
                onClick={() => setGrassType(g)}
                className={`py-2 px-3 rounded-lg text-sm ${grassType === g ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {grassTypes[g].name}
              </button>
            ))}
          </div>
        </div>

        {/* Grass Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{grassConfig.name}</h4>
            <span className="text-green-500 font-bold">{grassConfig.nitrogenNeed} lbs N/yr</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.lawnFertilizer.applications', 'Applications:')}</span> {grassConfig.applicationsPerYear}/year
            </div>
            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <span className="font-medium">{t('tools.lawnFertilizer.bestSeasons', 'Best Seasons:')}</span> {grassConfig.bestSeasons.join(', ')}
            </div>
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {grassConfig.description}
          </p>
        </div>

        {/* Fertilizer Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lawnFertilizer.fertilizerTypeNpk', 'Fertilizer Type (NPK)')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(fertilizerTypes) as FertilizerType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFertilizerType(f)}
                className={`py-2 px-3 rounded-lg text-sm ${fertilizerType === f ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {fertilizerTypes[f].name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom NPK Input */}
        {fertilizerType === 'custom' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.lawnFertilizer.customNpkValues', 'Custom NPK Values')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lawnFertilizer.nNitrogen', 'N (Nitrogen)')}</label>
                <input
                  type="number"
                  value={customNPK.n}
                  onChange={(e) => setCustomNPK({ ...customNPK, n: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lawnFertilizer.pPhosphorus', 'P (Phosphorus)')}</label>
                <input
                  type="number"
                  value={customNPK.p}
                  onChange={(e) => setCustomNPK({ ...customNPK, p: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lawnFertilizer.kPotassium', 'K (Potassium)')}</label>
                <input
                  type="number"
                  value={customNPK.k}
                  onChange={(e) => setCustomNPK({ ...customNPK, k: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fertilizer Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{fertConfig.name}</h4>
            <span className="text-green-500 font-bold">{npk[0]}-{npk[1]}-{npk[2]}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{fertConfig.description}</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <span className="font-medium">{t('tools.lawnFertilizer.bestFor', 'Best for:')}</span> {fertConfig.bestFor}
          </p>
        </div>

        {/* Bag Weight */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.lawnFertilizer.fertilizerBagWeightLbs', 'Fertilizer Bag Weight (lbs)')}
          </label>
          <div className="flex gap-2">
            {[10, 25, 40, 50].map((weight) => (
              <button
                key={weight}
                onClick={() => setBagWeight(weight.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(bagWeight) === weight ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {weight} lbs
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lawnFertilizer.perApplication', 'Per Application')}</span>
            </div>
            <div className="text-3xl font-bold text-green-500">{calculations.fertilizerNeeded} lbs</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.fertilizerKg} kg • {calculations.bagsNeeded} bags
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lawnFertilizer.applicationRate', 'Application Rate')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.applicationRate}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.lawnFertilizer.lbsPer1000Sq', 'lbs per 1,000 sq ft')}
            </div>
          </div>
        </div>

        {/* Annual Summary */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lawnFertilizer.annualFertilizerNeeds', 'Annual fertilizer needs')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.annualFertilizer} lbs ({calculations.annualBags} bags)
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {calculations.applicationsPerYear} applications per year
          </div>
        </div>

        {/* Spreader Settings Guide */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-green-500" />
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.lawnFertilizer.spreaderSettingsGuide', 'Spreader Settings Guide')}
            </label>
          </div>
          <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <table className="w-full text-sm">
              <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-3 py-2 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lawnFertilizer.spreader', 'Spreader')}</th>
                  <th className={`px-3 py-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lawnFertilizer.drop', 'Drop')}</th>
                  <th className={`px-3 py-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.lawnFertilizer.broadcast', 'Broadcast')}</th>
                </tr>
              </thead>
              <tbody>
                {spreaderSettings.map((setting, idx) => (
                  <tr key={setting.type} className={idx % 2 === 0 ? (isDark ? 'bg-gray-900' : 'bg-white') : (isDark ? 'bg-gray-800/50' : 'bg-gray-50')}>
                    <td className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{setting.type}</td>
                    <td className={`px-3 py-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{setting.granular}</td>
                    <td className={`px-3 py-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{setting.broadcast}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            * Settings are approximate. Always refer to your fertilizer bag and spreader manual.
          </p>
        </div>

        {/* Application Schedule */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-500" />
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.lawnFertilizer.recommendedApplicationSchedule', 'Recommended Application Schedule')}
            </label>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
            <div className="flex flex-wrap gap-2">
              {getSchedule().map((time, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-green-800/50 text-green-300' : 'bg-green-100 text-green-700'}`}
                >
                  {time}
                </span>
              ))}
            </div>
            <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Based on {grassConfig.name} requirements in most climates. Adjust based on your local weather and grass condition.
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.lawnFertilizer.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Water lawn 24-48 hours before fertilizing</li>
                <li>- Apply fertilizer when grass is dry</li>
                <li>- Water lightly after application</li>
                <li>- Never apply more than 1 lb of nitrogen per 1,000 sq ft at once</li>
                <li>- Avoid fertilizing during drought or extreme heat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawnFertilizerTool;
