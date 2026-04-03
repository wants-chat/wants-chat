import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MousePointer, Eye, Target, Sparkles, TrendingUp, Calculator, BarChart3, Info, Percent } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CTRCalculatorToolProps {
  uiConfig?: UIConfig;
}

type CalculationMode = 'ctr' | 'clicks' | 'impressions';

export const CTRCalculatorTool: React.FC<CTRCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [calculationMode, setCalculationMode] = useState<CalculationMode>('ctr');
  const [clicks, setClicks] = useState('250');
  const [impressions, setImpressions] = useState('10000');
  const [ctr, setCtr] = useState('2.5');
  const [targetClicks, setTargetClicks] = useState('500');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.clicks !== undefined) {
        setClicks(String(params.clicks));
        setIsPrefilled(true);
      }
      if (params.impressions !== undefined) {
        setImpressions(String(params.impressions));
        setIsPrefilled(true);
      }
      if (params.ctr !== undefined) {
        setCtr(String(params.ctr));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setClicks(String(params.numbers[0]));
        if (params.numbers.length > 1) setImpressions(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const clicksNum = parseFloat(clicks) || 0;
    const impressionsNum = parseFloat(impressions) || 0;
    const ctrNum = parseFloat(ctr) || 0;
    const targetClicksNum = parseFloat(targetClicks) || 0;

    let calculatedCTR = 0;
    let calculatedClicks = 0;
    let calculatedImpressions = 0;

    switch (calculationMode) {
      case 'ctr':
        calculatedCTR = impressionsNum > 0 ? (clicksNum / impressionsNum) * 100 : 0;
        calculatedClicks = clicksNum;
        calculatedImpressions = impressionsNum;
        break;
      case 'clicks':
        calculatedClicks = impressionsNum * (ctrNum / 100);
        calculatedCTR = ctrNum;
        calculatedImpressions = impressionsNum;
        break;
      case 'impressions':
        calculatedImpressions = ctrNum > 0 ? (targetClicksNum / (ctrNum / 100)) : 0;
        calculatedCTR = ctrNum;
        calculatedClicks = targetClicksNum;
        break;
    }

    // CTR Improvement scenarios
    const currentCTR = calculationMode === 'ctr' ? calculatedCTR : ctrNum;
    const impressionsBase = calculationMode === 'impressions' ? calculatedImpressions : impressionsNum;

    const ctrScenarios = [
      { improvement: 0, ctr: currentCTR, clicks: impressionsBase * (currentCTR / 100) },
      { improvement: 10, ctr: currentCTR * 1.1, clicks: impressionsBase * (currentCTR * 1.1 / 100) },
      { improvement: 25, ctr: currentCTR * 1.25, clicks: impressionsBase * (currentCTR * 1.25 / 100) },
      { improvement: 50, ctr: currentCTR * 1.5, clicks: impressionsBase * (currentCTR * 1.5 / 100) },
    ];

    // Impressions needed for click goals
    const impressionsFor100Clicks = currentCTR > 0 ? 100 / (currentCTR / 100) : 0;
    const impressionsFor500Clicks = currentCTR > 0 ? 500 / (currentCTR / 100) : 0;
    const impressionsFor1000Clicks = currentCTR > 0 ? 1000 / (currentCTR / 100) : 0;

    // CTR rating
    let rating: string;
    let ratingColor: string;

    if (currentCTR >= 5) {
      rating = 'Excellent';
      ratingColor = 'text-green-500';
    } else if (currentCTR >= 3) {
      rating = 'Very Good';
      ratingColor = 'text-teal-500';
    } else if (currentCTR >= 2) {
      rating = 'Good';
      ratingColor = 'text-blue-500';
    } else if (currentCTR >= 1) {
      rating = 'Average';
      ratingColor = 'text-yellow-500';
    } else {
      rating = 'Below Average';
      ratingColor = 'text-red-500';
    }

    return {
      calculatedCTR,
      calculatedClicks,
      calculatedImpressions,
      ctrScenarios,
      impressionsFor100Clicks,
      impressionsFor500Clicks,
      impressionsFor1000Clicks,
      rating,
      ratingColor,
      currentCTR,
    };
  }, [calculationMode, clicks, impressions, ctr, targetClicks]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toLocaleString();
  };

  const platformBenchmarks = [
    { platform: 'Google Search', ctr: '3.17%' },
    { platform: 'Google Display', ctr: '0.46%' },
    { platform: 'Facebook', ctr: '0.90%' },
    { platform: 'Instagram', ctr: '0.88%' },
    { platform: 'LinkedIn', ctr: '0.44%' },
    { platform: 'Twitter/X', ctr: '1.55%' },
    { platform: 'Email', ctr: '2.50%' },
    { platform: 'YouTube', ctr: '0.65%' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Percent className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cTRCalculator.ctrCalculator', 'CTR Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cTRCalculator.calculateClickThroughRate', 'Calculate Click-Through Rate')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.cTRCalculator.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Calculation Mode */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.cTRCalculator.whatDoYouWantTo', 'What do you want to calculate?')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCalculationMode('ctr')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'ctr' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cTRCalculator.ctr', 'CTR')}</div>
              <div className="text-xs opacity-75">{t('tools.cTRCalculator.fromClicksImpressions', 'From clicks & impressions')}</div>
            </button>
            <button
              onClick={() => setCalculationMode('clicks')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'clicks' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cTRCalculator.clicks', 'Clicks')}</div>
              <div className="text-xs opacity-75">{t('tools.cTRCalculator.fromImpressionsCtr', 'From impressions & CTR')}</div>
            </button>
            <button
              onClick={() => setCalculationMode('impressions')}
              className={`p-3 rounded-lg text-center transition-colors ${calculationMode === 'impressions' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <div className="font-medium">{t('tools.cTRCalculator.impressions', 'Impressions')}</div>
              <div className="text-xs opacity-75">{t('tools.cTRCalculator.forTargetClicksCtr', 'For target clicks & CTR')}</div>
            </button>
          </div>
        </div>

        {/* Dynamic Inputs */}
        <div className="grid grid-cols-2 gap-4">
          {calculationMode === 'ctr' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <MousePointer className="w-4 h-4 inline mr-1" />
                  {t('tools.cTRCalculator.clicks3', 'Clicks')}
                </label>
                <input
                  type="number"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  placeholder="250"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Eye className="w-4 h-4 inline mr-1" />
                  {t('tools.cTRCalculator.impressions3', 'Impressions')}
                </label>
                <input
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  placeholder="10000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {calculationMode === 'clicks' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Eye className="w-4 h-4 inline mr-1" />
                  {t('tools.cTRCalculator.impressions4', 'Impressions')}
                </label>
                <input
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  placeholder="10000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  {t('tools.cTRCalculator.ctr3', 'CTR (%)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={ctr}
                  onChange={(e) => setCtr(e.target.value)}
                  placeholder="2.5"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}

          {calculationMode === 'impressions' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <MousePointer className="w-4 h-4 inline mr-1" />
                  {t('tools.cTRCalculator.targetClicks', 'Target Clicks')}
                </label>
                <input
                  type="number"
                  value={targetClicks}
                  onChange={(e) => setTargetClicks(e.target.value)}
                  placeholder="500"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  {t('tools.cTRCalculator.expectedCtr', 'Expected CTR (%)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={ctr}
                  onChange={(e) => setCtr(e.target.value)}
                  placeholder="2.5"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? t('tools.cTRCalculator.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculationMode === 'ctr' ? 'Your CTR' : calculationMode === 'clicks' ? t('tools.cTRCalculator.expectedClicks', 'Expected Clicks') : t('tools.cTRCalculator.requiredImpressions', 'Required Impressions')}
          </div>
          <div className="text-5xl font-bold text-[#0D9488] my-2">
            {calculationMode === 'ctr'
              ? calculations.calculatedCTR.toFixed(2) + '%'
              : calculationMode === 'clicks'
                ? formatNumber(calculations.calculatedClicks)
                : formatNumber(calculations.calculatedImpressions)}
          </div>
          {calculationMode === 'ctr' && (
            <div className={`text-sm font-medium ${calculations.ratingColor}`}>
              {calculations.rating}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cTRCalculator.impressions2', 'Impressions')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatNumber(calculations.calculatedImpressions)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cTRCalculator.clicks2', 'Clicks')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatNumber(calculations.calculatedClicks)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cTRCalculator.ctr2', 'CTR')}</div>
            <div className="text-xl font-bold text-[#0D9488]">
              {calculations.calculatedCTR.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* CTR Improvement Scenarios */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4" />
            {t('tools.cTRCalculator.ctrImprovementImpact', 'CTR Improvement Impact')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {calculations.ctrScenarios.map((scenario, idx) => (
              <div key={idx} className={`p-3 rounded text-center ${idx === 0 ? 'bg-[#0D9488]/20 border border-[#0D9488]/30' : isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {scenario.improvement === 0 ? 'Current' : `+${scenario.improvement}%`}
                </div>
                <div className={`font-bold ${idx === 0 ? 'text-[#0D9488]' : isDark ? 'text-white' : 'text-gray-900'}`}>
                  {scenario.ctr.toFixed(2)}% CTR
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatNumber(scenario.clicks)} clicks
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impressions Needed */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Eye className="w-4 h-4" />
            {t('tools.cTRCalculator.impressionsNeededForClickGoals', 'Impressions Needed for Click Goals')}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>100 Clicks</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(calculations.impressionsFor100Clicks)}</div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>500 Clicks</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(calculations.impressionsFor500Clicks)}</div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>1,000 Clicks</div>
              <div className="font-bold text-[#0D9488]">{formatNumber(calculations.impressionsFor1000Clicks)}</div>
            </div>
          </div>
        </div>

        {/* Platform Benchmarks */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-4 h-4" />
            {t('tools.cTRCalculator.averageCtrByPlatform', 'Average CTR by Platform')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platformBenchmarks.map((benchmark, idx) => (
              <div key={idx} className={`p-2 rounded text-center ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{benchmark.platform}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{benchmark.ctr}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cTRCalculator.improveYourCtr', 'Improve Your CTR')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>* Write compelling headlines and ad copy</li>
            <li>* Use strong calls-to-action</li>
            <li>* Test different ad formats and visuals</li>
            <li>* Target relevant audiences</li>
            <li>* Optimize for mobile devices</li>
          </ul>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cTRCalculator.whatIsCtr', 'What is CTR?')}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                CTR (Click-Through Rate) measures how often people click on your ad or link after seeing it.
                It's a key indicator of ad relevance and effectiveness.
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>{t('tools.cTRCalculator.formula', 'Formula:')}</strong> CTR = (Clicks / Impressions) x 100
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTRCalculatorTool;
