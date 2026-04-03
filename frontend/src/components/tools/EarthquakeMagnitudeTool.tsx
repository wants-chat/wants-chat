import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, Info, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MagnitudeCategory {
  name: string;
  minMagnitude: number;
  maxMagnitude: number;
  effects: string;
  damage: string;
  frequency: string;
  color: string;
  examples: { name: string; year: number; magnitude: number }[];
}

const magnitudeCategories: MagnitudeCategory[] = [
  {
    name: 'Micro',
    minMagnitude: 0,
    maxMagnitude: 1.9,
    effects: 'Not felt by people. Recorded by seismographs only.',
    damage: 'None',
    frequency: 'About 8,000+ per day',
    color: '#10b981',
    examples: [],
  },
  {
    name: 'Minor',
    minMagnitude: 2.0,
    maxMagnitude: 3.9,
    effects: 'Often felt, but rarely causes damage. Shaking of indoor objects may be noticed.',
    damage: 'None to minimal',
    frequency: 'About 49,000 per year',
    color: '#22c55e',
    examples: [],
  },
  {
    name: 'Light',
    minMagnitude: 4.0,
    maxMagnitude: 4.9,
    effects: 'Noticeable shaking of indoor objects. Rattling noises. Felt by most people in the affected area.',
    damage: 'Minimal - some objects may fall',
    frequency: 'About 6,200 per year',
    color: '#eab308',
    examples: [
      { name: 'Los Angeles, CA', year: 2022, magnitude: 4.2 },
    ],
  },
  {
    name: 'Moderate',
    minMagnitude: 5.0,
    maxMagnitude: 5.9,
    effects: 'Felt by everyone. Can cause damage to poorly constructed buildings. Slight damage to well-designed structures.',
    damage: 'Minor to moderate - cracks in walls, broken windows',
    frequency: 'About 800 per year',
    color: '#f97316',
    examples: [
      { name: 'Napa, California', year: 2014, magnitude: 5.1 },
      { name: 'Oklahoma City', year: 2016, magnitude: 5.8 },
    ],
  },
  {
    name: 'Strong',
    minMagnitude: 6.0,
    maxMagnitude: 6.9,
    effects: 'May cause considerable damage in populous areas. Buildings may shift off foundations.',
    damage: 'Moderate to severe - building collapses possible',
    frequency: 'About 100-150 per year',
    color: '#ef4444',
    examples: [
      { name: 'Christchurch, New Zealand', year: 2011, magnitude: 6.3 },
      { name: 'L\'Aquila, Italy', year: 2009, magnitude: 6.3 },
    ],
  },
  {
    name: 'Major',
    minMagnitude: 7.0,
    maxMagnitude: 7.9,
    effects: 'Can cause serious damage over large areas. Ground cracks, landslides, and tsunamis possible.',
    damage: 'Severe - widespread destruction',
    frequency: 'About 10-20 per year',
    color: '#dc2626',
    examples: [
      { name: 'Haiti', year: 2010, magnitude: 7.0 },
      { name: 'Nepal', year: 2015, magnitude: 7.8 },
      { name: 'Mexico City', year: 2017, magnitude: 7.1 },
    ],
  },
  {
    name: 'Great',
    minMagnitude: 8.0,
    maxMagnitude: 10.0,
    effects: 'Devastating in areas several hundred kilometers across. Can cause tsunamis, permanent ground changes.',
    damage: 'Total destruction near epicenter',
    frequency: 'About 1 per year',
    color: '#7f1d1d',
    examples: [
      { name: 'Sumatra, Indonesia (Tsunami)', year: 2004, magnitude: 9.1 },
      { name: 'Tohoku, Japan (Fukushima)', year: 2011, magnitude: 9.1 },
      { name: 'Chile', year: 2010, magnitude: 8.8 },
    ],
  },
];

const safetyTips = [
  { title: 'Drop, Cover, Hold On', description: 'Drop to your hands and knees, take cover under sturdy furniture, and hold on until shaking stops.' },
  { title: 'Stay Indoors', description: 'If inside, stay there. Move away from windows, outside doors, and walls.' },
  { title: 'If Outdoors', description: 'Move to a clear area away from buildings, trees, streetlights, and utility wires.' },
  { title: 'If Driving', description: 'Pull over safely, stop, and stay inside your vehicle until shaking stops.' },
  { title: 'After Shaking Stops', description: 'Check for injuries and damage. Be prepared for aftershocks. Avoid damaged areas.' },
  { title: 'Emergency Kit', description: 'Keep supplies ready: water, food, flashlight, first aid kit, and battery-powered radio.' },
];

interface EarthquakeMagnitudeToolProps {
  uiConfig?: UIConfig;
}

export const EarthquakeMagnitudeTool: React.FC<EarthquakeMagnitudeToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [magnitude, setMagnitude] = useState<number>(5.0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setMagnitude(Number(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setMagnitude(Number(numMatch[0]));
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);
  const [compareMagnitude1, setCompareMagnitude1] = useState<number>(5.0);
  const [compareMagnitude2, setCompareMagnitude2] = useState<number>(6.0);
  const [showSafetyTips, setShowSafetyTips] = useState<boolean>(false);

  const getCategory = (mag: number): MagnitudeCategory => {
    for (const category of magnitudeCategories) {
      if (mag >= category.minMagnitude && mag <= category.maxMagnitude) {
        return category;
      }
    }
    return magnitudeCategories[magnitudeCategories.length - 1];
  };

  const currentCategory = useMemo(() => getCategory(magnitude), [magnitude]);

  // Each whole number increase represents 31.6x more energy released
  const calculateEnergyRatio = (mag1: number, mag2: number): number => {
    const diff = Math.abs(mag2 - mag1);
    return Math.pow(31.6, diff);
  };

  const energyComparison = useMemo(() => {
    const ratio = calculateEnergyRatio(compareMagnitude1, compareMagnitude2);
    const larger = Math.max(compareMagnitude1, compareMagnitude2);
    const smaller = Math.min(compareMagnitude1, compareMagnitude2);
    return { ratio, larger, smaller };
  }, [compareMagnitude1, compareMagnitude2]);

  // Energy released in joules (approximate, based on M = 2/3 * log10(E) - 3.2)
  const calculateEnergyJoules = (mag: number): number => {
    return Math.pow(10, 1.5 * mag + 4.8);
  };

  const formatEnergy = (joules: number): string => {
    if (joules >= 1e18) return `${(joules / 1e18).toFixed(1)} EJ (Exajoules)`;
    if (joules >= 1e15) return `${(joules / 1e15).toFixed(1)} PJ (Petajoules)`;
    if (joules >= 1e12) return `${(joules / 1e12).toFixed(1)} TJ (Terajoules)`;
    if (joules >= 1e9) return `${(joules / 1e9).toFixed(1)} GJ (Gigajoules)`;
    if (joules >= 1e6) return `${(joules / 1e6).toFixed(1)} MJ (Megajoules)`;
    return `${joules.toFixed(0)} J (Joules)`;
  };

  const getEnergyComparison = (joules: number): string => {
    const tntTons = joules / 4.184e9;
    if (tntTons >= 1e6) return `${(tntTons / 1e6).toFixed(1)} megatons of TNT`;
    if (tntTons >= 1e3) return `${(tntTons / 1e3).toFixed(1)} kilotons of TNT`;
    if (tntTons >= 1) return `${tntTons.toFixed(1)} tons of TNT`;
    return `${(tntTons * 1000).toFixed(1)} kg of TNT`;
  };

  const currentEnergy = useMemo(() => calculateEnergyJoules(magnitude), [magnitude]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.earthquakeMagnitude.earthquakeMagnitudeGuide', 'Earthquake Magnitude Guide')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.earthquakeMagnitude.learnAboutTheRichterScale', 'Learn about the Richter scale and earthquake effects')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.earthquakeMagnitude.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Magnitude Input */}
          <div className="mb-8">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.earthquakeMagnitude.enterMagnitude010', 'Enter Magnitude (0 - 10)')}
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={magnitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0 && val <= 10) {
                    setMagnitude(val);
                  }
                }}
                className={`w-24 px-3 py-2 rounded-lg border text-center font-bold text-xl ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          </div>

          {/* Interactive Magnitude Scale Visualization */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.earthquakeMagnitude.magnitudeScale', 'Magnitude Scale')}
            </h3>
            <div className="relative h-12 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex">
                {magnitudeCategories.map((cat, idx) => {
                  const width = ((cat.maxMagnitude - cat.minMagnitude + 0.1) / 10.1) * 100;
                  return (
                    <div
                      key={idx}
                      className="h-full flex items-center justify-center text-white text-xs font-medium transition-opacity"
                      style={{
                        backgroundColor: cat.color,
                        width: `${width}%`,
                        opacity: magnitude >= cat.minMagnitude && magnitude <= cat.maxMagnitude ? 1 : 0.4,
                      }}
                    >
                      {cat.name}
                    </div>
                  );
                })}
              </div>
              {/* Indicator */}
              <div
                className="absolute top-0 w-1 h-full bg-white shadow-lg transition-all duration-200"
                style={{ left: `${(magnitude / 10) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10</span>
            </div>
          </div>

          {/* Category Result */}
          <div
            className="p-6 rounded-lg mb-6"
            style={{ backgroundColor: `${currentCategory.color}20`, borderLeft: `4px solid ${currentCategory.color}` }}
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" style={{ color: currentCategory.color }} />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold" style={{ color: currentCategory.color }}>
                    {magnitude.toFixed(1)}
                  </span>
                  <span className="text-xl font-semibold" style={{ color: currentCategory.color }}>
                    - {currentCategory.name} Earthquake
                  </span>
                </div>
                <div className="space-y-2">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>{t('tools.earthquakeMagnitude.effects', 'Effects:')}</strong> {currentCategory.effects}
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>{t('tools.earthquakeMagnitude.typicalDamage', 'Typical Damage:')}</strong> {currentCategory.damage}
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>{t('tools.earthquakeMagnitude.frequency', 'Frequency:')}</strong> {currentCategory.frequency}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Energy Released */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
            <div className="flex items-start gap-3">
              <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  {t('tools.earthquakeMagnitude.energyReleased', 'Energy Released')}
                </p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatEnergy(currentEnergy)}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Equivalent to approximately {getEnergyComparison(currentEnergy)}
                </p>
              </div>
            </div>
          </div>

          {/* Historical Examples */}
          {currentCategory.examples.length > 0 && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                Historical Examples of {currentCategory.name} Earthquakes
              </p>
              <div className="space-y-2">
                {currentCategory.examples.map((example, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-2 rounded ${
                      isDarkMode ? 'bg-gray-600' : 'bg-white'
                    }`}
                  >
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                      {example.name} ({example.year})
                    </span>
                    <span
                      className="font-semibold px-2 py-1 rounded"
                      style={{ backgroundColor: `${currentCategory.color}30`, color: currentCategory.color }}
                    >
                      M{example.magnitude}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Tool */}
          <Card className={`mb-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.earthquakeMagnitude.magnitudeComparison', 'Magnitude Comparison')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>M</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={compareMagnitude1}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 10) {
                        setCompareMagnitude1(val);
                      }
                    }}
                    className={`w-20 px-3 py-2 rounded-lg border text-center ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
                <ArrowRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <div className="flex items-center gap-2">
                  <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>M</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={compareMagnitude2}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 10) {
                        setCompareMagnitude2(val);
                      }
                    }}
                    className={`w-20 px-3 py-2 rounded-lg border text-center ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  A magnitude <strong>{energyComparison.larger.toFixed(1)}</strong> earthquake releases approximately{' '}
                  <span className="text-[#0D9488] font-bold text-lg">{energyComparison.ratio.toFixed(1)}x</span>{' '}
                  more energy than a magnitude <strong>{energyComparison.smaller.toFixed(1)}</strong> earthquake.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Safety Tips Toggle */}
          <button
            onClick={() => setShowSafetyTips(!showSafetyTips)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors mb-4`}
          >
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.earthquakeMagnitude.earthquakeSafetyTips', 'Earthquake Safety Tips')}
              </span>
            </div>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {showSafetyTips ? '-' : '+'}
            </span>
          </button>

          {showSafetyTips && (
            <div className="grid md:grid-cols-2 gap-4">
              {safetyTips.map((tip, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {tip.title}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reference: All Categories */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.earthquakeMagnitude.earthquakeClassificationReference', 'Earthquake Classification Reference')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    <th className="text-left py-2 pr-4">{t('tools.earthquakeMagnitude.category', 'Category')}</th>
                    <th className="text-left py-2 pr-4">{t('tools.earthquakeMagnitude.magnitude', 'Magnitude')}</th>
                    <th className="text-left py-2">{t('tools.earthquakeMagnitude.frequency2', 'Frequency')}</th>
                  </tr>
                </thead>
                <tbody>
                  {magnitudeCategories.map((cat, idx) => (
                    <tr key={idx} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      <td className="py-2 pr-4">
                        <span
                          className="px-2 py-1 rounded text-white text-xs font-medium"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.name}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {cat.minMagnitude.toFixed(1)} - {cat.maxMagnitude.toFixed(1)}
                      </td>
                      <td className="py-2">{cat.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeMagnitudeTool;
