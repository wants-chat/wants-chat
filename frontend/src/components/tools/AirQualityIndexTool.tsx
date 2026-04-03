import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wind, AlertTriangle, Info, Heart, Activity, Shield, Users, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useConfirmDialog } from '../ui/ConfirmDialog';

type AqiCategory = 'good' | 'moderate' | 'unhealthySensitive' | 'unhealthy' | 'veryUnhealthy' | 'hazardous';

interface AqiResult {
  value: number;
  category: AqiCategory;
  categoryText: string;
  color: string;
  bgColor: string;
  description: string;
  healthImplications: string;
  cautionaryStatement: string;
  riskGroups: string[];
  activitiesToAvoid: string[];
  recommendedActivities: string[];
}

interface PollutantInfo {
  name: string;
  fullName: string;
  description: string;
  sources: string[];
  healthEffects: string[];
}

const pollutants: PollutantInfo[] = [
  {
    name: 'PM2.5',
    fullName: 'Fine Particulate Matter',
    description: 'Tiny particles less than 2.5 micrometers in diameter that can penetrate deep into lungs.',
    sources: ['Vehicle emissions', 'Power plants', 'Wildfires', 'Industrial processes'],
    healthEffects: ['Respiratory issues', 'Heart problems', 'Reduced lung function', 'Premature death']
  },
  {
    name: 'PM10',
    fullName: 'Coarse Particulate Matter',
    description: 'Particles between 2.5 and 10 micrometers, including dust, pollen, and mold.',
    sources: ['Construction sites', 'Unpaved roads', 'Agriculture', 'Mining operations'],
    healthEffects: ['Aggravated asthma', 'Respiratory symptoms', 'Eye irritation', 'Decreased lung function']
  },
  {
    name: 'O3',
    fullName: 'Ground-level Ozone',
    description: 'Created when pollutants react with sunlight. Not directly emitted but formed in the atmosphere.',
    sources: ['Vehicle exhaust', 'Industrial emissions', 'Chemical solvents', 'Gasoline vapors'],
    healthEffects: ['Chest pain', 'Coughing', 'Throat irritation', 'Airway inflammation']
  },
  {
    name: 'NO2',
    fullName: 'Nitrogen Dioxide',
    description: 'Reddish-brown gas with a pungent odor, primarily from burning fuel.',
    sources: ['Motor vehicles', 'Power plants', 'Industrial boilers', 'Off-road equipment'],
    healthEffects: ['Respiratory infections', 'Asthma attacks', 'Reduced lung function', 'Airway inflammation']
  },
  {
    name: 'SO2',
    fullName: 'Sulfur Dioxide',
    description: 'Colorless gas with a sharp odor, produced from burning fossil fuels.',
    sources: ['Power plants', 'Industrial facilities', 'Ships', 'Heavy equipment'],
    healthEffects: ['Breathing difficulties', 'Aggravated asthma', 'Reduced lung function', 'Eye irritation']
  },
  {
    name: 'CO',
    fullName: 'Carbon Monoxide',
    description: 'Colorless, odorless gas produced from incomplete combustion.',
    sources: ['Vehicle exhaust', 'Gas stoves', 'Tobacco smoke', 'Generators'],
    healthEffects: ['Reduced oxygen delivery', 'Headaches', 'Dizziness', 'Heart problems']
  }
];

const getAqiResult = (value: number): AqiResult => {
  if (value <= 50) {
    return {
      value,
      category: 'good',
      categoryText: 'Good',
      color: '#10b981',
      bgColor: '#10b98115',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      healthImplications: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
      cautionaryStatement: 'None',
      riskGroups: [],
      activitiesToAvoid: [],
      recommendedActivities: ['Outdoor exercise', 'Open windows for fresh air', 'Spend time outdoors', 'All normal activities']
    };
  } else if (value <= 100) {
    return {
      value,
      category: 'moderate',
      categoryText: 'Moderate',
      color: '#eab308',
      bgColor: '#eab30815',
      description: 'Air quality is acceptable. However, there may be a risk for some people.',
      healthImplications: 'Some pollutants may be a moderate health concern for a very small number of people.',
      cautionaryStatement: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
      riskGroups: ['People with respiratory disease', 'Unusually sensitive individuals'],
      activitiesToAvoid: ['Extended high-intensity outdoor exercise (for sensitive groups)'],
      recommendedActivities: ['Normal outdoor activities for most', 'Monitor symptoms if sensitive', 'Light outdoor exercise']
    };
  } else if (value <= 150) {
    return {
      value,
      category: 'unhealthySensitive',
      categoryText: 'Unhealthy for Sensitive Groups',
      color: '#f97316',
      bgColor: '#f9731615',
      description: 'Members of sensitive groups may experience health effects.',
      healthImplications: 'Members of sensitive groups may experience health effects. General public less likely to be affected.',
      cautionaryStatement: 'Active children and adults, and people with respiratory disease, should limit prolonged outdoor exertion.',
      riskGroups: ['Children', 'Older adults', 'People with heart disease', 'People with lung disease', 'Active outdoors'],
      activitiesToAvoid: ['Prolonged outdoor exertion', 'Heavy outdoor exercise', 'Extended time near busy roads'],
      recommendedActivities: ['Short outdoor activities', 'Indoor exercise', 'Keep medication handy if needed']
    };
  } else if (value <= 200) {
    return {
      value,
      category: 'unhealthy',
      categoryText: 'Unhealthy',
      color: '#ef4444',
      bgColor: '#ef444415',
      description: 'Everyone may begin to experience health effects.',
      healthImplications: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
      cautionaryStatement: 'Active children and adults, and people with respiratory disease, should avoid prolonged outdoor exertion; everyone else should limit prolonged outdoor exertion.',
      riskGroups: ['Everyone, especially sensitive groups', 'Children', 'Older adults', 'People with respiratory/heart conditions'],
      activitiesToAvoid: ['All prolonged outdoor exertion', 'Strenuous outdoor activities', 'Opening windows', 'Outdoor sports'],
      recommendedActivities: ['Stay indoors with air filtration', 'Indoor activities only', 'Use air purifiers', 'Wear N95 mask if going outside']
    };
  } else if (value <= 300) {
    return {
      value,
      category: 'veryUnhealthy',
      categoryText: 'Very Unhealthy',
      color: '#a855f7',
      bgColor: '#a855f715',
      description: 'Health warnings of emergency conditions.',
      healthImplications: 'Health alert: everyone may experience more serious health effects.',
      cautionaryStatement: 'Active children and adults, and people with respiratory disease, should avoid all outdoor exertion; everyone else should limit outdoor exertion.',
      riskGroups: ['Everyone is at risk', 'Sensitive groups at high risk', 'Outdoor workers', 'Athletes'],
      activitiesToAvoid: ['All outdoor exertion', 'Opening windows or doors', 'Any outdoor activities', 'Outdoor work if possible'],
      recommendedActivities: ['Stay indoors', 'Run HEPA air purifiers', 'Seal windows and doors', 'Avoid physical exertion', 'Wear N95 mask if must go outside']
    };
  } else {
    return {
      value,
      category: 'hazardous',
      categoryText: 'Hazardous',
      color: '#7f1d1d',
      bgColor: '#7f1d1d15',
      description: 'Health alert: everyone may experience serious health effects.',
      healthImplications: 'Health warning of emergency conditions: The entire population is more likely to be affected.',
      cautionaryStatement: 'Everyone should avoid all outdoor exertion.',
      riskGroups: ['Entire population', 'Everyone is at serious risk'],
      activitiesToAvoid: ['All outdoor activities', 'Any outdoor exposure', 'Opening windows', 'All outdoor work', 'Travel unless necessary'],
      recommendedActivities: ['Stay indoors with filtration', 'Avoid any physical exertion', 'Consider evacuation if air quality persists', 'Seek medical attention if experiencing symptoms', 'Wear N95 mask for any outdoor exposure']
    };
  }
};

interface AirQualityIndexToolProps {
  uiConfig?: UIConfig;
}

export function AirQualityIndexTool({ uiConfig }: AirQualityIndexToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [aqiValue, setAqiValue] = useState<string>('');
  const [result, setResult] = useState<AqiResult | null>(null);
  const [showPollutants, setShowPollutants] = useState(false);
  const [expandedPollutant, setExpandedPollutant] = useState<string | null>(null);
  const [showHealthTips, setShowHealthTips] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setAqiValue(String(params.amount));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setAqiValue(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const analyzeAqi = () => {
    const value = parseInt(aqiValue, 10);
    if (isNaN(value) || value < 0 || value > 500) {
      setValidationMessage('Please enter a valid AQI value between 0 and 500');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    setResult(getAqiResult(value));
  };

  const reset = () => {
    setAqiValue('');
    setResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      analyzeAqi();
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.airQualityIndex.airQualityIndexTool', 'Air Quality Index Tool')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.airQualityIndex.understandAndInterpretAqiValues', 'Understand and interpret AQI values for better health decisions')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mt-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.airQualityIndex.valueLoadedFromAiResponse', 'Value loaded from AI response')}</span>
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.airQualityIndex.enterAqiValue0500', 'Enter AQI Value (0-500)')}
              </label>
              <input
                type="number"
                value={aqiValue}
                onChange={(e) => setAqiValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('tools.airQualityIndex.enterAqiValue', 'Enter AQI value...')}
                min="0"
                max="500"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={analyzeAqi}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Wind className="w-5 h-5" />
                {t('tools.airQualityIndex.analyzeAqi', 'Analyze AQI')}
              </button>
              <button
                onClick={reset}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.airQualityIndex.reset', 'Reset')}
              </button>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div
              className="p-6 rounded-lg mb-6"
              style={{ backgroundColor: result.bgColor, borderLeft: `4px solid ${result.color}` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-5xl font-bold mb-2" style={{ color: result.color }}>
                    {result.value}
                  </div>
                  <div className="text-xl font-semibold" style={{ color: result.color }}>
                    {result.categoryText}
                  </div>
                </div>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: result.color }}
                >
                  {result.category === 'good' ? (
                    <Heart className="w-10 h-10 text-white" />
                  ) : result.category === 'moderate' ? (
                    <Activity className="w-10 h-10 text-white" />
                  ) : (
                    <AlertTriangle className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.description}
              </p>
            </div>
          )}
        </div>

        {/* Detailed Information Cards */}
        {result && (
          <>
            {/* Health Implications */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Heart className="w-5 h-5 text-red-500" />
                  {t('tools.airQualityIndex.healthImplications', 'Health Implications')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {result.healthImplications}
                </p>
                {result.cautionaryStatement !== 'None' && (
                  <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        {result.cautionaryStatement}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Who is at Risk */}
            {result.riskGroups.length > 0 && (
              <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Users className="w-5 h-5 text-orange-500" />
                    {t('tools.airQualityIndex.whoIsMostAtRisk', 'Who is Most at Risk')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.riskGroups.map((group, index) => (
                      <li key={index} className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        {group}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Activities */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Activities to Avoid */}
              {result.activitiesToAvoid.length > 0 && (
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      {t('tools.airQualityIndex.activitiesToAvoid', 'Activities to Avoid')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.activitiesToAvoid.map((activity, index) => (
                        <li key={index} className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommended Activities */}
              <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Shield className="w-5 h-5 text-green-500" />
                    {t('tools.airQualityIndex.recommendedActivities', 'Recommended Activities')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendedActivities.map((activity, index) => (
                      <li key={index} className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* AQI Scale Reference */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Info className="w-5 h-5 text-[#0D9488]" />
            {t('tools.airQualityIndex.aqiScaleReference', 'AQI Scale Reference')}
          </h3>
          <div className="space-y-3">
            {[
              { range: '0-50', label: 'Good', color: '#10b981', desc: 'Air quality is satisfactory' },
              { range: '51-100', label: 'Moderate', color: '#eab308', desc: 'Acceptable for most' },
              { range: '101-150', label: 'Unhealthy for Sensitive Groups', color: '#f97316', desc: 'Sensitive groups at risk' },
              { range: '151-200', label: 'Unhealthy', color: '#ef4444', desc: 'Everyone may be affected' },
              { range: '201-300', label: 'Very Unhealthy', color: '#a855f7', desc: 'Health alert' },
              { range: '301-500', label: 'Hazardous', color: '#7f1d1d', desc: 'Emergency conditions' }
            ].map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </span>
                    <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      - {item.desc}
                    </span>
                  </div>
                </div>
                <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.range}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pollutant Breakdown */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <button
            onClick={() => setShowPollutants(!showPollutants)}
            className={`w-full flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Wind className="w-5 h-5 text-[#0D9488]" />
              {t('tools.airQualityIndex.pollutantBreakdown', 'Pollutant Breakdown')}
            </h3>
            {showPollutants ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {showPollutants && (
            <div className="mt-4 space-y-3">
              {pollutants.map((pollutant) => (
                <div
                  key={pollutant.name}
                  className={`rounded-lg border ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => setExpandedPollutant(expandedPollutant === pollutant.name ? null : pollutant.name)}
                    className={`w-full p-4 flex items-center justify-between ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-[#0D9488]">{pollutant.name}</span>
                      <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({pollutant.fullName})
                      </span>
                    </div>
                    {expandedPollutant === pollutant.name ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedPollutant === pollutant.name && (
                    <div className={`px-4 pb-4 space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className="text-sm">{pollutant.description}</p>
                      <div>
                        <h4 className="font-medium text-sm mb-1">{t('tools.airQualityIndex.commonSources', 'Common Sources:')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {pollutant.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                              }`}
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">{t('tools.airQualityIndex.healthEffects', 'Health Effects:')}</h4>
                        <ul className="text-sm space-y-1">
                          {pollutant.healthEffects.map((effect, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Tips */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <button
            onClick={() => setShowHealthTips(!showHealthTips)}
            className={`w-full flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              {t('tools.airQualityIndex.healthTipsForDifferentAqi', 'Health Tips for Different AQI Levels')}
            </h3>
            {showHealthTips ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {showHealthTips && (
            <div className="mt-4 space-y-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
                <h4 className="font-medium mb-2 text-green-600">{t('tools.airQualityIndex.good050', 'Good (0-50)')}</h4>
                <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>- Enjoy outdoor activities freely</li>
                  <li>- Great time for exercise outside</li>
                  <li>- Open windows for ventilation</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                <h4 className="font-medium mb-2 text-yellow-600">{t('tools.airQualityIndex.moderate51100', 'Moderate (51-100)')}</h4>
                <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>- Most people can continue normal activities</li>
                  <li>- Sensitive individuals should monitor symptoms</li>
                  <li>- Consider shorter outdoor sessions if sensitive</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'}`}>
                <h4 className="font-medium mb-2 text-orange-600">{t('tools.airQualityIndex.unhealthyForSensitive101150', 'Unhealthy for Sensitive (101-150)')}</h4>
                <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>- Sensitive groups should limit prolonged outdoor exertion</li>
                  <li>- Take breaks during outdoor activities</li>
                  <li>- Keep rescue medications accessible</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-red-50'}`}>
                <h4 className="font-medium mb-2 text-red-600">{t('tools.airQualityIndex.unhealthy151200', 'Unhealthy (151-200)')}</h4>
                <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>- Move activities indoors</li>
                  <li>- Use air purifiers with HEPA filters</li>
                  <li>- Keep windows and doors closed</li>
                  <li>- Avoid strenuous activities</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <h4 className="font-medium mb-2 text-purple-600">{t('tools.airQualityIndex.veryUnhealthy201300', 'Very Unhealthy (201-300)')}</h4>
                <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>- Avoid all outdoor exertion</li>
                  <li>- Run air purifiers continuously</li>
                  <li>- Wear N95 masks if outdoors</li>
                  <li>- Consider relocating temporarily if sensitive</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-red-100'}`}>
                <h4 className="font-medium mb-2 text-red-900">{t('tools.airQualityIndex.hazardous301500', 'Hazardous (301-500)')}</h4>
                <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>- Stay indoors at all times</li>
                  <li>- Create a clean air room with sealed doors/windows</li>
                  <li>- Avoid any physical exertion</li>
                  <li>- Seek medical attention if experiencing symptoms</li>
                  <li>- Consider evacuation if conditions persist</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
            <span>{validationMessage}</span>
          </div>
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
}

export default AirQualityIndexTool;
