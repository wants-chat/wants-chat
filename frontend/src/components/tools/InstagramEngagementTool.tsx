import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Instagram, Heart, MessageCircle, Users, TrendingUp, Sparkles, Share2, Bookmark } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface InstagramEngagementToolProps {
  uiConfig?: UIConfig;
}

type EngagementType = 'basic' | 'advanced';

export const InstagramEngagementTool: React.FC<InstagramEngagementToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [engagementType, setEngagementType] = useState<EngagementType>('basic');
  const [followers, setFollowers] = useState('10000');
  const [likes, setLikes] = useState('500');
  const [comments, setComments] = useState('50');
  const [shares, setShares] = useState('20');
  const [saves, setSaves] = useState('30');
  const [reach, setReach] = useState('5000');
  const [impressions, setImpressions] = useState('8000');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.followers !== undefined) {
        setFollowers(String(params.followers));
        setIsPrefilled(true);
      }
      if (params.likes !== undefined) {
        setLikes(String(params.likes));
        setIsPrefilled(true);
      }
      if (params.comments !== undefined) {
        setComments(String(params.comments));
        setIsPrefilled(true);
      }
      if (params.shares !== undefined) {
        setShares(String(params.shares));
        setIsPrefilled(true);
      }
      if (params.saves !== undefined) {
        setSaves(String(params.saves));
        setIsPrefilled(true);
      }
      if (params.reach !== undefined) {
        setReach(String(params.reach));
        setIsPrefilled(true);
      }
      if (params.impressions !== undefined) {
        setImpressions(String(params.impressions));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setFollowers(String(params.numbers[0]));
        if (params.numbers.length > 1) setLikes(String(params.numbers[1]));
        if (params.numbers.length > 2) setComments(String(params.numbers[2]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const followersNum = parseFloat(followers) || 0;
    const likesNum = parseFloat(likes) || 0;
    const commentsNum = parseFloat(comments) || 0;
    const sharesNum = parseFloat(shares) || 0;
    const savesNum = parseFloat(saves) || 0;
    const reachNum = parseFloat(reach) || 0;
    const impressionsNum = parseFloat(impressions) || 0;

    // Basic Engagement Rate (Likes + Comments / Followers)
    const basicEngagement = followersNum > 0
      ? ((likesNum + commentsNum) / followersNum) * 100
      : 0;

    // Advanced Engagement Rate (All interactions / Followers)
    const advancedEngagement = followersNum > 0
      ? ((likesNum + commentsNum + sharesNum + savesNum) / followersNum) * 100
      : 0;

    // Reach Rate
    const reachRate = followersNum > 0
      ? (reachNum / followersNum) * 100
      : 0;

    // Engagement by Reach (ERR)
    const engagementByReach = reachNum > 0
      ? ((likesNum + commentsNum + sharesNum + savesNum) / reachNum) * 100
      : 0;

    // Engagement by Impressions
    const engagementByImpressions = impressionsNum > 0
      ? ((likesNum + commentsNum + sharesNum + savesNum) / impressionsNum) * 100
      : 0;

    // Virality Rate
    const viralityRate = reachNum > 0
      ? (sharesNum / reachNum) * 100
      : 0;

    // Save Rate
    const saveRate = reachNum > 0
      ? (savesNum / reachNum) * 100
      : 0;

    // Comment Rate
    const commentRate = followersNum > 0
      ? (commentsNum / followersNum) * 100
      : 0;

    // Rating based on engagement
    let rating: string;
    let ratingColor: string;
    const rate = engagementType === 'basic' ? basicEngagement : advancedEngagement;

    if (rate >= 6) {
      rating = 'Excellent';
      ratingColor = 'text-green-500';
    } else if (rate >= 3) {
      rating = 'Good';
      ratingColor = 'text-teal-500';
    } else if (rate >= 1) {
      rating = 'Average';
      ratingColor = 'text-yellow-500';
    } else {
      rating = 'Low';
      ratingColor = 'text-red-500';
    }

    return {
      basicEngagement,
      advancedEngagement,
      reachRate,
      engagementByReach,
      engagementByImpressions,
      viralityRate,
      saveRate,
      commentRate,
      totalInteractions: likesNum + commentsNum + sharesNum + savesNum,
      rating,
      ratingColor,
    };
  }, [followers, likes, comments, shares, saves, reach, impressions, engagementType]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const benchmarks = [
    { range: '< 1%', status: 'Low engagement - needs improvement' },
    { range: '1% - 3%', status: 'Average - typical for large accounts' },
    { range: '3% - 6%', status: 'Good - above average performance' },
    { range: '> 6%', status: 'Excellent - highly engaged audience' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-pink-900/20' : 'bg-gradient-to-r from-white to-pink-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <Instagram className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.instagramEngagement.instagramEngagementCalculator', 'Instagram Engagement Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.instagramEngagement.calculateYourEngagementRateAnd', 'Calculate your engagement rate and metrics')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.instagramEngagement.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Calculation Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setEngagementType('basic')}
            className={`flex-1 py-2 rounded-lg transition-colors ${engagementType === 'basic' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.instagramEngagement.basicLikesComments', 'Basic (Likes + Comments)')}
          </button>
          <button
            onClick={() => setEngagementType('advanced')}
            className={`flex-1 py-2 rounded-lg transition-colors ${engagementType === 'advanced' ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('tools.instagramEngagement.advancedAllMetrics', 'Advanced (All Metrics)')}
          </button>
        </div>

        {/* Basic Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" />
              {t('tools.instagramEngagement.followers', 'Followers')}
            </label>
            <input
              type="number"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="10000"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Heart className="w-4 h-4 inline mr-1" />
              {t('tools.instagramEngagement.averageLikes', 'Average Likes')}
            </label>
            <input
              type="number"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              placeholder="500"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <MessageCircle className="w-4 h-4 inline mr-1" />
              {t('tools.instagramEngagement.averageComments', 'Average Comments')}
            </label>
            <input
              type="number"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="50"
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>
          {engagementType === 'advanced' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Share2 className="w-4 h-4 inline mr-1" />
                  {t('tools.instagramEngagement.averageShares', 'Average Shares')}
                </label>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="20"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Bookmark className="w-4 h-4 inline mr-1" />
                  {t('tools.instagramEngagement.averageSaves', 'Average Saves')}
                </label>
                <input
                  type="number"
                  value={saves}
                  onChange={(e) => setSaves(e.target.value)}
                  placeholder="30"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  {t('tools.instagramEngagement.averageReach', 'Average Reach')}
                </label>
                <input
                  type="number"
                  value={reach}
                  onChange={(e) => setReach(e.target.value)}
                  placeholder="5000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.instagramEngagement.impressions', 'Impressions')}
                </label>
                <input
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  placeholder="8000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
                />
              </div>
            </>
          )}
        </div>

        {/* Main Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? t('tools.instagramEngagement.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.instagramEngagement.engagementRate', 'Engagement Rate')}</div>
          <div className="text-5xl font-bold text-[#0D9488] my-2">
            {(engagementType === 'basic' ? calculations.basicEngagement : calculations.advancedEngagement).toFixed(2)}%
          </div>
          <div className={`text-sm font-medium ${calculations.ratingColor}`}>
            {calculations.rating}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {formatNumber(calculations.totalInteractions)} total interactions
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.instagramEngagement.likeRate', 'Like Rate')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {((parseFloat(likes) / (parseFloat(followers) || 1)) * 100).toFixed(2)}%
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.instagramEngagement.commentRate', 'Comment Rate')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.commentRate.toFixed(3)}%
            </div>
          </div>
          {engagementType === 'advanced' && (
            <>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.instagramEngagement.reachRate', 'Reach Rate')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.reachRate.toFixed(1)}%
                </div>
              </div>
              <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.instagramEngagement.saveRate', 'Save Rate')}</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {calculations.saveRate.toFixed(2)}%
                </div>
              </div>
            </>
          )}
        </div>

        {/* Benchmarks */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.instagramEngagement.industryBenchmarks', 'Industry Benchmarks')}</h4>
          <div className="space-y-2">
            {benchmarks.map((benchmark, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{benchmark.range}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{benchmark.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.instagramEngagement.tipsToImproveEngagement', 'Tips to Improve Engagement')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>* Post during peak activity hours for your audience</li>
            <li>* Use relevant hashtags and location tags</li>
            <li>* Engage with comments within the first hour</li>
            <li>* Create carousel posts for higher engagement</li>
            <li>* Use strong calls-to-action in captions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InstagramEngagementTool;
