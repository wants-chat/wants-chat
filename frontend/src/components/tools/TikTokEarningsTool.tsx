import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music2, DollarSign, Eye, TrendingUp, Sparkles, Users, Video, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TikTokEarningsToolProps {
  uiConfig?: UIConfig;
}

type RevenueStream = 'creator_fund' | 'all';

export const TikTokEarningsTool: React.FC<TikTokEarningsToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [revenueStream, setRevenueStream] = useState<RevenueStream>('all');
  const [followers, setFollowers] = useState('100000');
  const [views, setViews] = useState('1000000');
  const [videosPerWeek, setVideosPerWeek] = useState('5');
  const [engagementRate, setEngagementRate] = useState('5');
  const [liveGiftsPerMonth, setLiveGiftsPerMonth] = useState('500');
  const [sponsorshipRate, setSponsorshipRate] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.followers !== undefined) {
        setFollowers(String(params.followers));
        setIsPrefilled(true);
      }
      if (params.views !== undefined) {
        setViews(String(params.views));
        setIsPrefilled(true);
      }
      if (params.engagementRate !== undefined) {
        setEngagementRate(String(params.engagementRate));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setFollowers(String(params.numbers[0]));
        if (params.numbers.length > 1) setViews(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const followersNum = parseFloat(followers) || 0;
    const viewsNum = parseFloat(views) || 0;
    const videosNum = parseFloat(videosPerWeek) || 0;
    const engagement = parseFloat(engagementRate) || 0;
    const gifts = parseFloat(liveGiftsPerMonth) || 0;
    const customSponsor = parseFloat(sponsorshipRate) || 0;

    // TikTok Creator Fund pays roughly $0.02 - $0.04 per 1000 views
    const creatorFundRateLow = 0.02;
    const creatorFundRateHigh = 0.04;
    const creatorFundRateAvg = 0.03;

    // Monthly views estimate
    const monthlyViews = viewsNum; // Assuming input is monthly views
    const monthlyVideos = videosNum * 4;

    // Creator Fund earnings
    const creatorFundLow = (monthlyViews / 1000) * creatorFundRateLow;
    const creatorFundHigh = (monthlyViews / 1000) * creatorFundRateHigh;
    const creatorFundAvg = (monthlyViews / 1000) * creatorFundRateAvg;

    // Sponsorship rate estimation based on followers and engagement
    // Industry standard: $10-$20 per 1000 followers for micro-influencers
    // Adjusted by engagement rate
    const engagementMultiplier = engagement > 3 ? 1 + ((engagement - 3) / 10) : 0.8;
    const baseSponsorRate = (followersNum / 1000) * 15; // $15 per 1K followers
    const estimatedSponsorRate = customSponsor || baseSponsorRate * engagementMultiplier;

    // Assuming 2-4 sponsorships per month for active creators
    const sponsorshipsPerMonth = followersNum >= 10000 ? 2 : 0;
    const sponsorshipEarnings = estimatedSponsorRate * sponsorshipsPerMonth;

    // Live gifts (TikTok takes ~50%)
    const liveEarnings = gifts * 0.5;

    // Total monthly earnings
    const totalMonthlyLow = creatorFundLow + (revenueStream === 'all' ? sponsorshipEarnings + liveEarnings : 0);
    const totalMonthlyHigh = creatorFundHigh + (revenueStream === 'all' ? sponsorshipEarnings * 1.5 + liveEarnings : 0);
    const totalMonthlyAvg = creatorFundAvg + (revenueStream === 'all' ? sponsorshipEarnings + liveEarnings : 0);

    // Annual projections
    const annualLow = totalMonthlyLow * 12;
    const annualHigh = totalMonthlyHigh * 12;
    const annualAvg = totalMonthlyAvg * 12;

    // Earnings per video
    const earningsPerVideo = monthlyVideos > 0 ? totalMonthlyAvg / monthlyVideos : 0;

    // Earnings per 1000 followers
    const earningsPer1kFollowers = followersNum > 0 ? (totalMonthlyAvg / followersNum) * 1000 : 0;

    // Views needed for milestones
    const viewsFor100 = Math.ceil((100 / creatorFundRateAvg) * 1000);
    const viewsFor1000 = Math.ceil((1000 / creatorFundRateAvg) * 1000);

    return {
      creatorFundLow,
      creatorFundHigh,
      creatorFundAvg,
      sponsorshipEarnings,
      estimatedSponsorRate,
      liveEarnings,
      totalMonthlyLow,
      totalMonthlyHigh,
      totalMonthlyAvg,
      annualLow,
      annualHigh,
      annualAvg,
      earningsPerVideo,
      earningsPer1kFollowers,
      monthlyVideos,
      viewsFor100,
      viewsFor1000,
      sponsorshipsPerMonth,
    };
  }, [followers, views, videosPerWeek, engagementRate, liveGiftsPerMonth, sponsorshipRate, revenueStream]);

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

  const eligibilityRequirements = [
    { requirement: '10,000+ followers', met: parseFloat(followers) >= 10000 },
    { requirement: '100,000+ video views (last 30 days)', met: parseFloat(views) >= 100000 },
    { requirement: 'Account age 18+', met: true },
    { requirement: 'Based in eligible country', met: true },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Music2 className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tikTokEarnings.tiktokEarningsCalculator', 'TikTok Earnings Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tikTokEarnings.estimateCreatorFundSponsorshipEarnings', 'Estimate Creator Fund & sponsorship earnings')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.tikTokEarnings.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Revenue Stream Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setRevenueStream('creator_fund')}
            className={`flex-1 py-2 rounded-lg transition-colors ${revenueStream === 'creator_fund' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.tikTokEarnings.creatorFundOnly', 'Creator Fund Only')}
          </button>
          <button
            onClick={() => setRevenueStream('all')}
            className={`flex-1 py-2 rounded-lg transition-colors ${revenueStream === 'all' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.tikTokEarnings.allRevenueStreams', 'All Revenue Streams')}
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" />
              {t('tools.tikTokEarnings.followers', 'Followers')}
            </label>
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="100000"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Eye className="w-4 h-4 inline mr-1" />
              {t('tools.tikTokEarnings.monthlyViews', 'Monthly Views')}
            </label>
            <input
              type="number"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              placeholder="1000000"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Video className="w-4 h-4 inline mr-1" />
              {t('tools.tikTokEarnings.videosPerWeek', 'Videos per Week')}
            </label>
            <input
              type="number"
              value={videosPerWeek}
              onChange={(e) => setVideosPerWeek(e.target.value)}
              placeholder="5"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Zap className="w-4 h-4 inline mr-1" />
              {t('tools.tikTokEarnings.engagementRate', 'Engagement Rate (%)')}
            </label>
            <input
              type="number"
              step="0.1"
              value={engagementRate}
              onChange={(e) => setEngagementRate(e.target.value)}
              placeholder="5"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>
          {revenueStream === 'all' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.tikTokEarnings.liveGiftsMonth', 'Live Gifts/Month ($)')}
                </label>
                <input
                  type="number"
                  value={liveGiftsPerMonth}
                  onChange={(e) => setLiveGiftsPerMonth(e.target.value)}
                  placeholder="500"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {t('tools.tikTokEarnings.customSponsorRate', 'Custom Sponsor Rate ($)')}
                </label>
                <input
                  type="number"
                  value={sponsorshipRate}
                  onChange={(e) => setSponsorshipRate(e.target.value)}
                  placeholder={calculations.estimatedSponsorRate.toFixed(0)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </>
          )}
        </div>

        {/* Eligibility Check */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tikTokEarnings.creatorFundEligibility', 'Creator Fund Eligibility')}</h4>
          <div className="grid grid-cols-2 gap-2">
            {eligibilityRequirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-400'}`}>
                  {req.met && <span className="text-white text-xs">&#10003;</span>}
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{req.requirement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? t('tools.tikTokEarnings.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.estimatedMonthlyEarnings', 'Estimated Monthly Earnings')}</div>
          <div className="text-5xl font-bold text-[#0D9488] my-2">
            {formatCurrency(calculations.totalMonthlyAvg)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Range: {formatCurrency(calculations.totalMonthlyLow)} - {formatCurrency(calculations.totalMonthlyHigh)}
          </div>
        </div>

        {/* Revenue Breakdown */}
        {revenueStream === 'all' && (
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.creatorFund', 'Creator Fund')}</div>
              <div className="text-xl font-bold text-[#0D9488]">
                {formatCurrency(calculations.creatorFundAvg)}
              </div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.sponsorships', 'Sponsorships')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(calculations.sponsorshipEarnings)}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ~{calculations.sponsorshipsPerMonth}/month
              </div>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.liveGifts', 'Live Gifts')}</div>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(calculations.liveEarnings)}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.tikTokEarnings.after50Cut', 'After 50% cut')}
              </div>
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.perVideo', 'Per Video')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.earningsPerVideo)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.annualEst', 'Annual Est.')}</div>
            <div className="text-xl font-bold text-[#0D9488]">
              {formatCurrency(calculations.annualAvg)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.sponsorRate', 'Sponsor Rate')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.estimatedSponsorRate)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.per1kFollowers', 'Per 1K Followers')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.earningsPer1kFollowers)}
            </div>
          </div>
        </div>

        {/* Creator Fund Rate Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="w-4 h-4 inline mr-2" />
            {t('tools.tikTokEarnings.creatorFundRates', 'Creator Fund Rates')}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.ratePer1000Views', 'Rate per 1,000 views')}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>$0.02 - $0.04</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.viewsNeededFor100', 'Views needed for $100')}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatNumber(calculations.viewsFor100)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tikTokEarnings.viewsNeededFor1000', 'Views needed for $1,000')}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formatNumber(calculations.viewsFor1000)}</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tikTokEarnings.maximizeTiktokEarnings', 'Maximize TikTok Earnings')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>* Post 1-3 times daily during peak hours</li>
            <li>* Focus on watch time and completion rate</li>
            <li>* Engage with trends early</li>
            <li>* Build brand partnerships beyond Creator Fund</li>
            <li>* Go live regularly for gift revenue</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TikTokEarningsTool;
