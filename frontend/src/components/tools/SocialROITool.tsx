import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, Target, Sparkles, BarChart3, PieChart, ArrowUpRight, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SocialROIToolProps {
  uiConfig?: UIConfig;
}

export const SocialROITool: React.FC<SocialROIToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Investment Inputs
  const [adSpend, setAdSpend] = useState('1000');
  const [toolsCost, setToolsCost] = useState('100');
  const [contentCost, setContentCost] = useState('500');
  const [laborHours, setLaborHours] = useState('40');
  const [hourlyRate, setHourlyRate] = useState('25');

  // Revenue/Results Inputs
  const [revenue, setRevenue] = useState('5000');
  const [leads, setLeads] = useState('50');
  const [leadValue, setLeadValue] = useState('100');
  const [newFollowers, setNewFollowers] = useState('500');
  const [followerValue, setFollowerValue] = useState('1');
  const [websiteVisits, setWebsiteVisits] = useState('2000');
  const [conversionRate, setConversionRate] = useState('3');
  const [avgOrderValue, setAvgOrderValue] = useState('75');

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.adSpend !== undefined) {
        setAdSpend(String(params.adSpend));
        setIsPrefilled(true);
      }
      if (params.revenue !== undefined) {
        setRevenue(String(params.revenue));
        setIsPrefilled(true);
      }
      if (params.leads !== undefined) {
        setLeads(String(params.leads));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setAdSpend(String(params.numbers[0]));
        if (params.numbers.length > 1) setRevenue(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    // Parse inputs
    const adSpendNum = parseFloat(adSpend) || 0;
    const toolsCostNum = parseFloat(toolsCost) || 0;
    const contentCostNum = parseFloat(contentCost) || 0;
    const laborHoursNum = parseFloat(laborHours) || 0;
    const hourlyRateNum = parseFloat(hourlyRate) || 0;
    const revenueNum = parseFloat(revenue) || 0;
    const leadsNum = parseFloat(leads) || 0;
    const leadValueNum = parseFloat(leadValue) || 0;
    const newFollowersNum = parseFloat(newFollowers) || 0;
    const followerValueNum = parseFloat(followerValue) || 0;
    const websiteVisitsNum = parseFloat(websiteVisits) || 0;
    const conversionRateNum = parseFloat(conversionRate) || 0;
    const avgOrderValueNum = parseFloat(avgOrderValue) || 0;

    // Total Investment
    const laborCost = laborHoursNum * hourlyRateNum;
    const totalInvestment = adSpendNum + toolsCostNum + contentCostNum + laborCost;

    // Total Value Generated
    const directRevenue = revenueNum;
    const leadsValue = leadsNum * leadValueNum;
    const followerAssetValue = newFollowersNum * followerValueNum;
    const projectedSalesFromTraffic = (websiteVisitsNum * (conversionRateNum / 100)) * avgOrderValueNum;
    const totalValue = directRevenue + leadsValue + followerAssetValue;

    // ROI Calculation
    const roi = totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0;

    // Net Profit
    const netProfit = totalValue - totalInvestment;

    // Additional Metrics
    const costPerLead = leadsNum > 0 ? totalInvestment / leadsNum : 0;
    const costPerFollower = newFollowersNum > 0 ? totalInvestment / newFollowersNum : 0;
    const costPerVisit = websiteVisitsNum > 0 ? totalInvestment / websiteVisitsNum : 0;
    const returnMultiple = totalInvestment > 0 ? totalValue / totalInvestment : 0;

    // Investment Breakdown
    const investmentBreakdown = [
      { label: 'Ad Spend', value: adSpendNum, percent: totalInvestment > 0 ? (adSpendNum / totalInvestment) * 100 : 0 },
      { label: 'Labor', value: laborCost, percent: totalInvestment > 0 ? (laborCost / totalInvestment) * 100 : 0 },
      { label: 'Content', value: contentCostNum, percent: totalInvestment > 0 ? (contentCostNum / totalInvestment) * 100 : 0 },
      { label: 'Tools', value: toolsCostNum, percent: totalInvestment > 0 ? (toolsCostNum / totalInvestment) * 100 : 0 },
    ].filter(item => item.value > 0);

    // Value Breakdown
    const valueBreakdown = [
      { label: 'Direct Revenue', value: directRevenue, percent: totalValue > 0 ? (directRevenue / totalValue) * 100 : 0 },
      { label: 'Lead Value', value: leadsValue, percent: totalValue > 0 ? (leadsValue / totalValue) * 100 : 0 },
      { label: 'Follower Value', value: followerAssetValue, percent: totalValue > 0 ? (followerAssetValue / totalValue) * 100 : 0 },
    ].filter(item => item.value > 0);

    // ROI Rating
    let roiRating: string;
    let roiColor: string;
    if (roi >= 500) {
      roiRating = 'Exceptional';
      roiColor = 'text-green-500';
    } else if (roi >= 200) {
      roiRating = 'Excellent';
      roiColor = 'text-teal-500';
    } else if (roi >= 100) {
      roiRating = 'Good';
      roiColor = 'text-blue-500';
    } else if (roi >= 0) {
      roiRating = 'Break Even';
      roiColor = 'text-yellow-500';
    } else {
      roiRating = 'Negative';
      roiColor = 'text-red-500';
    }

    return {
      totalInvestment,
      totalValue,
      roi,
      netProfit,
      costPerLead,
      costPerFollower,
      costPerVisit,
      returnMultiple,
      investmentBreakdown,
      valueBreakdown,
      laborCost,
      roiRating,
      roiColor,
      projectedSalesFromTraffic,
    };
  }, [adSpend, toolsCost, contentCost, laborHours, hourlyRate, revenue, leads, leadValue, newFollowers, followerValue, websiteVisits, conversionRate, avgOrderValue]);

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
    return '$' + num.toFixed(2);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.socialROI.socialMediaRoiCalculator', 'Social Media ROI Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.socialROI.calculateReturnOnSocialMedia', 'Calculate return on social media investment')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.socialROI.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Investment Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-4 h-4 text-red-500" />
            {t('tools.socialROI.investmentCosts', 'Investment (Costs)')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.socialROI.adSpend', 'Ad Spend ($)')}
              </label>
              <input
                type="number"
                value={adSpend}
                onChange={(e) => setAdSpend(e.target.value)}
                placeholder="1000"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.socialROI.toolsSoftware', 'Tools/Software ($)')}
              </label>
              <input
                type="number"
                value={toolsCost}
                onChange={(e) => setToolsCost(e.target.value)}
                placeholder="100"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.socialROI.contentCreation', 'Content Creation ($)')}
              </label>
              <input
                type="number"
                value={contentCost}
                onChange={(e) => setContentCost(e.target.value)}
                placeholder="500"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.socialROI.laborCost', 'Labor Cost')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={laborHours}
                  onChange={(e) => setLaborHours(e.target.value)}
                  placeholder="40"
                  className={`w-1/2 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="25"
                  className={`w-1/2 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.socialROI.hoursSpentHourlyRate', 'Hours Spent • Hourly Rate ($)')}
              </div>
            </div>
          </div>
        </div>

        {/* Returns Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            {t('tools.socialROI.returnsValueGenerated', 'Returns (Value Generated)')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.socialROI.directRevenue', 'Direct Revenue ($)')}
              </label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="5000"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.socialROI.leadValue', 'Lead Value')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={leads}
                  onChange={(e) => setLeads(e.target.value)}
                  placeholder="50"
                  className={`w-1/2 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="number"
                  value={leadValue}
                  onChange={(e) => setLeadValue(e.target.value)}
                  placeholder="100"
                  className={`w-1/2 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.socialROI.leadsGeneratedValuePerLead', 'Leads Generated • Value per Lead ($)')}
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.socialROI.followerValue', 'Follower Value')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newFollowers}
                  onChange={(e) => setNewFollowers(e.target.value)}
                  placeholder="500"
                  className={`w-1/2 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="number"
                  step="0.1"
                  value={followerValue}
                  onChange={(e) => setFollowerValue(e.target.value)}
                  placeholder="1"
                  className={`w-1/2 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.socialROI.newFollowersValuePerFollower', 'New Followers • Value per Follower ($)')}
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.socialROI.websiteTrafficConversion', 'Website Traffic & Conversion')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={websiteVisits}
                  onChange={(e) => setWebsiteVisits(e.target.value)}
                  placeholder={t('tools.socialROI.visits', 'Visits')}
                  className={`w-1/3 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="number"
                  step="0.1"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  placeholder={t('tools.socialROI.conv', 'Conv %')}
                  className={`w-1/3 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
                <input
                  type="number"
                  value={avgOrderValue}
                  onChange={(e) => setAvgOrderValue(e.target.value)}
                  placeholder={t('tools.socialROI.avg', 'Avg $')}
                  className={`w-1/3 px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.socialROI.visitsConvRateAvgOrder', 'Visits • Conv. Rate % • Avg Order Value')}
              </div>
            </div>
          </div>
        </div>

        {/* Main ROI Result */}
        <div className={`p-6 rounded-xl text-center ${calculations.roi >= 0 ? (isDark ? t('tools.socialROI.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200') : (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.socialROI.returnOnInvestment', 'Return on Investment')}</div>
          <div className={`text-5xl font-bold my-2 ${calculations.roiColor}`}>
            {calculations.roi.toFixed(1)}%
          </div>
          <div className={`text-sm font-medium ${calculations.roiColor}`}>
            {calculations.roiRating}
          </div>
          <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.returnMultiple.toFixed(2)}x return on investment
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.socialROI.totalInvestment', 'Total Investment')}</div>
            <div className={`text-xl font-bold text-red-500`}>
              {formatCurrency(calculations.totalInvestment)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.socialROI.totalValue', 'Total Value')}</div>
            <div className="text-xl font-bold text-green-500">
              {formatCurrency(calculations.totalValue)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.socialROI.netProfit', 'Net Profit')}</div>
            <div className={`text-xl font-bold ${calculations.netProfit >= 0 ? t('tools.socialROI.text0d9488', 'text-[#0D9488]') : 'text-red-500'}`}>
              {formatCurrency(calculations.netProfit)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.socialROI.costPerLead', 'Cost per Lead')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.costPerLead)}
            </div>
          </div>
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Investment Breakdown */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <PieChart className="w-4 h-4" />
              {t('tools.socialROI.investmentBreakdown', 'Investment Breakdown')}
            </h4>
            <div className="space-y-2">
              {calculations.investmentBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-300 overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Breakdown */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 className="w-4 h-4" />
              {t('tools.socialROI.valueBreakdown', 'Value Breakdown')}
            </h4>
            <div className="space-y-2">
              {calculations.valueBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-300 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.socialROI.costPerFollower', 'Cost per Follower')}</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.costPerFollower)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.socialROI.costPerVisit', 'Cost per Visit')}</div>
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(calculations.costPerVisit)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.socialROI.projSalesFromTraffic', 'Proj. Sales from Traffic')}</div>
            <div className="text-lg font-bold text-[#0D9488]">
              {formatCurrency(calculations.projectedSalesFromTraffic)}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.socialROI.improveYourRoi', 'Improve Your ROI')}</h4>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>* Focus spend on highest-performing platforms</li>
            <li>* A/B test ad creatives to reduce cost per result</li>
            <li>* Improve landing pages to increase conversion rate</li>
            <li>* Nurture leads to increase lifetime value</li>
            <li>* Automate where possible to reduce labor costs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SocialROITool;
