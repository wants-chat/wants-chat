import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, Calendar, Target, Sparkles, BarChart3, Clock, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface FollowerGrowthToolProps {
  uiConfig?: UIConfig;
}

type GrowthType = 'organic' | 'aggressive' | 'viral' | 'custom';

export const FollowerGrowthTool: React.FC<FollowerGrowthToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentFollowers, setCurrentFollowers] = useState('5000');
  const [targetFollowers, setTargetFollowers] = useState('100000');
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState('10');
  const [growthType, setGrowthType] = useState<GrowthType>('organic');
  const [timeframeMonths, setTimeframeMonths] = useState('12');
  const [postsPerWeek, setPostsPerWeek] = useState('5');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.followers !== undefined || params.currentFollowers !== undefined) {
        setCurrentFollowers(String(params.followers || params.currentFollowers));
        setIsPrefilled(true);
      }
      if (params.targetFollowers !== undefined) {
        setTargetFollowers(String(params.targetFollowers));
        setIsPrefilled(true);
      }
      if (params.growthRate !== undefined) {
        setMonthlyGrowthRate(String(params.growthRate));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setCurrentFollowers(String(params.numbers[0]));
        if (params.numbers.length > 1) setTargetFollowers(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Preset growth rates
  const growthPresets: Record<GrowthType, number> = {
    organic: 5,      // 5% monthly - sustainable organic growth
    aggressive: 15,  // 15% monthly - active marketing
    viral: 50,       // 50% monthly - viral content
    custom: parseFloat(monthlyGrowthRate) || 10,
  };

  const calculations = useMemo(() => {
    const current = parseFloat(currentFollowers) || 0;
    const target = parseFloat(targetFollowers) || 0;
    const rate = (growthType === 'custom' ? parseFloat(monthlyGrowthRate) : growthPresets[growthType]) / 100;
    const months = parseFloat(timeframeMonths) || 12;
    const posts = parseFloat(postsPerWeek) || 0;

    // Calculate projected followers after timeframe
    const projectedFollowers = current * Math.pow(1 + rate, months);

    // Calculate months needed to reach target
    const monthsToTarget = rate > 0 ? Math.log(target / current) / Math.log(1 + rate) : Infinity;

    // Generate monthly projection
    const monthlyProjection: { month: number; followers: number; gained: number }[] = [];
    let prevFollowers = current;
    for (let i = 1; i <= Math.min(months, 24); i++) {
      const followers = current * Math.pow(1 + rate, i);
      monthlyProjection.push({
        month: i,
        followers: Math.round(followers),
        gained: Math.round(followers - prevFollowers),
      });
      prevFollowers = followers;
    }

    // Calculate daily/weekly averages
    const totalGain = projectedFollowers - current;
    const dailyGain = totalGain / (months * 30);
    const weeklyGain = totalGain / (months * 4);

    // Engagement needed (rough estimate)
    const estimatedEngagementNeeded = posts > 0 ? Math.round(dailyGain * 100 / posts) : 0;

    // Milestones
    const milestones = [1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000]
      .filter(m => m > current && m <= Math.max(projectedFollowers, target))
      .map(m => ({
        milestone: m,
        monthsToReach: rate > 0 ? Math.ceil(Math.log(m / current) / Math.log(1 + rate)) : Infinity,
      }));

    // Year projections
    const year1 = current * Math.pow(1 + rate, 12);
    const year2 = current * Math.pow(1 + rate, 24);
    const year3 = current * Math.pow(1 + rate, 36);

    return {
      projectedFollowers,
      monthsToTarget: Math.ceil(monthsToTarget),
      monthlyProjection,
      dailyGain,
      weeklyGain,
      totalGain,
      estimatedEngagementNeeded,
      milestones,
      year1,
      year2,
      year3,
      currentRate: rate * 100,
      isReachable: monthsToTarget <= months,
    };
  }, [currentFollowers, targetFollowers, monthlyGrowthRate, growthType, timeframeMonths, postsPerWeek]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toLocaleString();
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.followerGrowth.followerGrowthProjector', 'Follower Growth Projector')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.followerGrowth.projectYourFollowerGrowthOver', 'Project your follower growth over time')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.followerGrowth.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Growth Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Zap className="w-4 h-4 inline mr-1" />
            {t('tools.followerGrowth.growthStrategy', 'Growth Strategy')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { value: 'organic', label: 'Organic', rate: '5%/mo' },
              { value: 'aggressive', label: 'Aggressive', rate: '15%/mo' },
              { value: 'viral', label: 'Viral', rate: '50%/mo' },
              { value: 'custom', label: 'Custom', rate: 'Set rate' },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setGrowthType(g.value as GrowthType)}
                className={`p-3 rounded-lg text-center transition-colors ${growthType === g.value ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <div className="font-medium text-sm">{g.label}</div>
                <div className="text-xs opacity-75">{g.rate}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" />
              {t('tools.followerGrowth.currentFollowers', 'Current Followers')}
            </label>
            <input
              type="number"
              value={currentFollowers}
              onChange={(e) => setCurrentFollowers(e.target.value)}
              placeholder="5000"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Target className="w-4 h-4 inline mr-1" />
              {t('tools.followerGrowth.targetFollowers', 'Target Followers')}
            </label>
            <input
              type="number"
              value={targetFollowers}
              onChange={(e) => setTargetFollowers(e.target.value)}
              placeholder="100000"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          {growthType === 'custom' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <TrendingUp className="w-4 h-4 inline mr-1" />
                {t('tools.followerGrowth.monthlyGrowthRate', 'Monthly Growth Rate (%)')}
              </label>
              <input
                type="number"
                step="0.5"
                value={monthlyGrowthRate}
                onChange={(e) => setMonthlyGrowthRate(e.target.value)}
                placeholder="10"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.followerGrowth.timeframeMonths', 'Timeframe (months)')}
            </label>
            <input
              type="number"
              value={timeframeMonths}
              onChange={(e) => setTimeframeMonths(e.target.value)}
              placeholder="12"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <BarChart3 className="w-4 h-4 inline mr-1" />
              {t('tools.followerGrowth.postsPerWeek', 'Posts per Week')}
            </label>
            <input
              type="number"
              value={postsPerWeek}
              onChange={(e) => setPostsPerWeek(e.target.value)}
              placeholder="5"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
        </div>

        {/* Main Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-6 rounded-xl text-center ${isDark ? t('tools.followerGrowth.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Projected in {timeframeMonths} months
            </div>
            <div className="text-4xl font-bold text-[#0D9488] my-2">
              {formatNumber(calculations.projectedFollowers)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              +{formatNumber(calculations.totalGain)} followers
            </div>
          </div>
          <div className={`p-6 rounded-xl text-center ${calculations.isReachable ? (isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200') : (isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200')} border`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Time to reach {formatNumber(parseFloat(targetFollowers))}
            </div>
            <div className={`text-4xl font-bold my-2 ${calculations.isReachable ? 'text-green-500' : 'text-yellow-500'}`}>
              {calculations.monthsToTarget === Infinity ? 'N/A' : `${calculations.monthsToTarget} mo`}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {calculations.isReachable ? t('tools.followerGrowth.targetIsReachable', 'Target is reachable!') : t('tools.followerGrowth.extendTimeframeOrIncreaseRate', 'Extend timeframe or increase rate')}
            </div>
          </div>
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.followerGrowth.dailyGain', 'Daily Gain')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              +{Math.round(calculations.dailyGain)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.followerGrowth.weeklyGain', 'Weekly Gain')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              +{formatNumber(calculations.weeklyGain)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.followerGrowth.growthRate', 'Growth Rate')}</div>
            <div className="text-xl font-bold text-[#0D9488]">
              {calculations.currentRate.toFixed(1)}%/mo
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.followerGrowth.totalGrowth', 'Total Growth')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {((calculations.projectedFollowers / (parseFloat(currentFollowers) || 1) - 1) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-4 h-4 inline mr-2" />
            {t('tools.followerGrowth.monthlyGrowthProjection', 'Monthly Growth Projection')}
          </h4>
          <div className="h-32 flex items-end gap-1">
            {calculations.monthlyProjection.slice(0, 12).map((month, idx) => {
              const maxFollowers = calculations.monthlyProjection[Math.min(11, calculations.monthlyProjection.length - 1)]?.followers || 1;
              const height = (month.followers / maxFollowers) * 100;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-[#0D9488] rounded-t transition-all hover:bg-[#0D9488]/80"
                  style={{ height: `${height}%` }}
                  title={`Month ${month.month}: ${formatNumber(month.followers)} (+${formatNumber(month.gained)})`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.followerGrowth.month1', 'Month 1')}</span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.followerGrowth.month12', 'Month 12')}</span>
          </div>
        </div>

        {/* Milestones */}
        {calculations.milestones.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Target className="w-4 h-4 inline mr-2" />
              {t('tools.followerGrowth.upcomingMilestones', 'Upcoming Milestones')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {calculations.milestones.slice(0, 4).map((milestone, idx) => (
                <div key={idx} className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="text-lg font-bold text-[#0D9488]">{formatNumber(milestone.milestone)}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {milestone.monthsToReach} months
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Long-term Projections */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calendar className="w-4 h-4 inline mr-2" />
            {t('tools.followerGrowth.longTermProjection', 'Long-term Projection')}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.followerGrowth.year1', 'Year 1')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(calculations.year1)}</div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.followerGrowth.year2', 'Year 2')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(calculations.year2)}</div>
            </div>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.followerGrowth.year3', 'Year 3')}</div>
              <div className="text-xl font-bold text-[#0D9488]">{formatNumber(calculations.year3)}</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.followerGrowth.growthTips', 'Growth Tips')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>* Consistency is key - post regularly at optimal times</li>
            <li>* Engage with your community and respond to comments</li>
            <li>* Collaborate with creators in your niche</li>
            <li>* Use platform features (Reels, Stories, Lives)</li>
            <li>* Analyze what content performs best and double down</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FollowerGrowthTool;
