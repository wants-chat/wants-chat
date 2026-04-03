import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Youtube, DollarSign, Eye, TrendingUp, Sparkles, BarChart3, Target, Globe } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface YoutubeEarningsToolProps {
  uiConfig?: UIConfig;
}

type CalculationType = 'views' | 'monthly';

export const YoutubeEarningsTool: React.FC<YoutubeEarningsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [calculationType, setCalculationType] = useState<CalculationType>('views');
  const [views, setViews] = useState('100000');
  const [cpm, setCpm] = useState('4');
  const [monthlyViews, setMonthlyViews] = useState('500000');
  const [subscribers, setSubscribers] = useState('10000');
  const [videosPerMonth, setVideosPerMonth] = useState('8');
  const [avgViewDuration, setAvgViewDuration] = useState('50');
  const [niche, setNiche] = useState('general');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.views !== undefined) {
        setViews(String(params.views));
        setIsPrefilled(true);
      }
      if (params.cpm !== undefined) {
        setCpm(String(params.cpm));
        setIsPrefilled(true);
      }
      if (params.subscribers !== undefined) {
        setSubscribers(String(params.subscribers));
        setIsPrefilled(true);
      }
      if (params.monthlyViews !== undefined) {
        setMonthlyViews(String(params.monthlyViews));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setViews(String(params.numbers[0]));
        if (params.numbers.length > 1) setCpm(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const nicheCPMRanges: Record<string, { min: number; max: number; avg: number }> = {
    general: { min: 2, max: 5, avg: 3.5 },
    gaming: { min: 2, max: 6, avg: 4 },
    tech: { min: 4, max: 12, avg: 8 },
    finance: { min: 8, max: 25, avg: 15 },
    education: { min: 4, max: 10, avg: 7 },
    entertainment: { min: 2, max: 6, avg: 4 },
    beauty: { min: 3, max: 8, avg: 5.5 },
    health: { min: 5, max: 15, avg: 10 },
    cooking: { min: 3, max: 8, avg: 5 },
    travel: { min: 3, max: 10, avg: 6 },
  };

  const calculations = useMemo(() => {
    const viewsNum = parseFloat(views) || 0;
    const cpmNum = parseFloat(cpm) || 0;
    const monthlyViewsNum = parseFloat(monthlyViews) || 0;
    const subscribersNum = parseFloat(subscribers) || 0;
    const videosNum = parseFloat(videosPerMonth) || 0;
    const avgDuration = parseFloat(avgViewDuration) || 50;

    // CPM is cost per 1000 views, RPM is typically 45-55% of CPM after YouTube's cut
    const rpmRate = 0.55; // YouTube takes ~45%
    const rpm = cpmNum * rpmRate;

    // Per video earnings
    const earningsPerVideo = (viewsNum / 1000) * rpm;

    // Adjusted for view duration (higher retention = higher ad revenue)
    const durationMultiplier = avgDuration >= 50 ? 1 + ((avgDuration - 50) / 100) : avgDuration / 50;
    const adjustedEarnings = earningsPerVideo * durationMultiplier;

    // Monthly earnings
    const monthlyEarnings = calculationType === 'views'
      ? adjustedEarnings * videosNum
      : (monthlyViewsNum / 1000) * rpm * durationMultiplier;

    // Annual projection
    const annualEarnings = monthlyEarnings * 12;

    // Earnings per 1000 subscribers
    const earningsPer1kSubs = subscribersNum > 0
      ? (monthlyEarnings / subscribersNum) * 1000
      : 0;

    // Low and high estimates (based on CPM variance)
    const lowMultiplier = 0.6;
    const highMultiplier = 1.5;

    const nicheData = nicheCPMRanges[niche] || nicheCPMRanges.general;

    return {
      earningsPerVideo: adjustedEarnings,
      monthlyEarnings,
      annualEarnings,
      rpm,
      earningsPer1kSubs,
      lowEstimate: monthlyEarnings * lowMultiplier,
      highEstimate: monthlyEarnings * highMultiplier,
      youtubeShare: earningsPerVideo - adjustedEarnings * rpmRate,
      nicheData,
      viewsNeededFor1k: rpm > 0 ? Math.ceil((1000 / rpm) * 1000) : 0,
      viewsNeededFor10k: rpm > 0 ? Math.ceil((10000 / rpm) * 1000) : 0,
    };
  }, [views, cpm, monthlyViews, subscribers, videosPerMonth, avgViewDuration, calculationType, niche]);

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(2) + 'K';
    return '$' + num.toFixed(2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const niches = [
    { value: 'general', label: 'General' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'tech', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'travel', label: 'Travel' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Youtube className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.youTubeEarnings.youtubeEarningsCalculator', 'YouTube Earnings Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.youTubeEarnings.estimateYourYoutubeAdRevenue', 'Estimate your YouTube ad revenue')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.youTubeEarnings.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Calculation Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setCalculationType('views')}
            className={`flex-1 py-2 rounded-lg transition-colors ${calculationType === 'views' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.youTubeEarnings.perVideoViews', 'Per Video Views')}
          </button>
          <button
            onClick={() => setCalculationType('monthly')}
            className={`flex-1 py-2 rounded-lg transition-colors ${calculationType === 'monthly' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.youTubeEarnings.monthlyViews', 'Monthly Views')}
          </button>
        </div>

        {/* Niche Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Globe className="w-4 h-4 inline mr-1" />
            {t('tools.youTubeEarnings.contentNiche', 'Content Niche')}
          </label>
          <select
            value={niche}
            onChange={(e) => {
              setNiche(e.target.value);
              setCpm(nicheCPMRanges[e.target.value]?.avg.toString() || '4');
            }}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
          >
            {niches.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Typical CPM: ${calculations.nicheData.min} - ${calculations.nicheData.max}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          {calculationType === 'views' ? (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Eye className="w-4 h-4 inline mr-1" />
                {t('tools.youTubeEarnings.viewsPerVideo', 'Views per Video')}
              </label>
              <input
                type="number"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                placeholder="100000"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Eye className="w-4 h-4 inline mr-1" />
                {t('tools.youTubeEarnings.monthlyViews2', 'Monthly Views')}
              </label>
              <input
                type="number"
                value={monthlyViews}
                onChange={(e) => setMonthlyViews(e.target.value)}
                placeholder="500000"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.youTubeEarnings.cpm1000Views', 'CPM ($/1000 views)')}
            </label>
            <input
              type="number"
              step="0.5"
              value={cpm}
              onChange={(e) => setCpm(e.target.value)}
              placeholder="4"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <BarChart3 className="w-4 h-4 inline mr-1" />
              {t('tools.youTubeEarnings.videosPerMonth', 'Videos per Month')}
            </label>
            <input
              type="number"
              value={videosPerMonth}
              onChange={(e) => setVideosPerMonth(e.target.value)}
              placeholder="8"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Target className="w-4 h-4 inline mr-1" />
              {t('tools.youTubeEarnings.avgWatchTime', 'Avg Watch Time (%)')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={avgViewDuration}
              onChange={(e) => setAvgViewDuration(e.target.value)}
              placeholder="50"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? t('tools.youTubeEarnings.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.youTubeEarnings.estimatedMonthlyEarnings', 'Estimated Monthly Earnings')}</div>
          <div className="text-5xl font-bold text-[#0D9488] my-2">
            {formatCurrency(calculations.monthlyEarnings)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Range: {formatCurrency(calculations.lowEstimate)} - {formatCurrency(calculations.highEstimate)}
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.youTubeEarnings.perVideo', 'Per Video')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.earningsPerVideo)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.youTubeEarnings.annualEst', 'Annual Est.')}</div>
            <div className="text-xl font-bold text-[#0D9488]">
              {formatCurrency(calculations.annualEarnings)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.youTubeEarnings.yourRpm', 'Your RPM')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${calculations.rpm.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.youTubeEarnings.viewsFor1kMo', 'Views for $1K/mo')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatNumber(calculations.viewsNeededFor1k)}
            </div>
          </div>
        </div>

        {/* Revenue Split */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 inline mr-2" />
            {t('tools.youTubeEarnings.revenueBreakdown', 'Revenue Breakdown')}
          </h4>
          <div className="h-4 rounded-full overflow-hidden bg-gray-300 flex">
            <div className="h-full bg-[#0D9488]" style={{ width: '55%' }} />
            <div className="h-full bg-red-500" style={{ width: '45%' }} />
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#0D9488]" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.youTubeEarnings.yourShare55', 'Your Share (55%)')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.youTubeEarnings.youtube45', 'YouTube (45%)')}</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.youTubeEarnings.maximizeYourEarnings', 'Maximize Your Earnings')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>* Target higher CPM niches (finance, tech, business)</li>
            <li>* Increase watch time with engaging content</li>
            <li>* Enable mid-roll ads on videos over 8 minutes</li>
            <li>* Focus on US, UK, and Canadian audiences</li>
            <li>* Diversify with sponsorships and memberships</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default YoutubeEarningsTool;
