import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, DollarSign, TrendingUp, Sparkles, Star, Target, Zap, Globe, Loader2, Copy, Check, Download, FileText, BarChart2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { api } from '../../lib/api';

interface InfluencerRateToolProps {
  uiConfig?: UIConfig;
}

type Platform = 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin';
type ContentType = 'post' | 'story' | 'reel' | 'video' | 'thread';
type CampaignType = 'awareness' | 'engagement' | 'conversion' | 'ugc' | 'affiliate';

interface AIAnalysis {
  suggestedRate: { low: number; mid: number; high: number };
  marketInsights: string[];
  negotiationTips: string[];
  rateCardContent: string;
  competitorComparison: string;
  strengthsWeaknesses: { strengths: string[]; weaknesses: string[] };
}

export const InfluencerRateTool: React.FC<InfluencerRateToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [platform, setPlatform] = useState<Platform>('instagram');
  const [followers, setFollowers] = useState('50000');
  const [engagementRate, setEngagementRate] = useState('4');
  const [contentType, setContentType] = useState<ContentType>('post');
  const [niche, setNiche] = useState('lifestyle');
  const [campaignType, setCampaignType] = useState<CampaignType>('awareness');
  const [location, setLocation] = useState('United States');
  const [audienceAge, setAudienceAge] = useState('18-34');
  const [avgViews, setAvgViews] = useState('');
  const [avgLikes, setAvgLikes] = useState('');
  const [previousBrands, setPreviousBrands] = useState('');

  // Add-ons
  const [exclusivity, setExclusivity] = useState(false);
  const [usageRights, setUsageRights] = useState(false);
  const [whitelisting, setWhitelisting] = useState(false);
  const [revisions, setRevisions] = useState('2');

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'ratecard' | 'insights'>('calculator');

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.followers !== undefined) {
        setFollowers(String(params.followers));
        setIsPrefilled(true);
      }
      if (params.engagementRate !== undefined) {
        setEngagementRate(String(params.engagementRate));
        setIsPrefilled(true);
      }
      if (params.platform !== undefined) {
        setPlatform(params.platform as Platform);
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setFollowers(String(params.numbers[0]));
        if (params.numbers.length > 1) setEngagementRate(String(params.numbers[1]));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Base rates per 1000 followers by platform
  const platformRates: Record<Platform, { base: number; story: number; video: number }> = {
    instagram: { base: 10, story: 5, video: 15 },
    youtube: { base: 20, story: 10, video: 25 },
    tiktok: { base: 8, story: 4, video: 12 },
    twitter: { base: 5, story: 3, video: 8 },
    linkedin: { base: 15, story: 8, video: 20 },
  };

  // Niche multipliers
  const nicheMultipliers: Record<string, number> = {
    lifestyle: 1.0,
    fashion: 1.2,
    beauty: 1.3,
    tech: 1.5,
    finance: 2.0,
    health: 1.4,
    travel: 1.1,
    food: 1.0,
    gaming: 0.9,
    parenting: 1.2,
    business: 1.8,
    fitness: 1.3,
    luxury: 2.5,
    automotive: 1.6,
    education: 1.3,
    entertainment: 1.1,
  };

  // Campaign type multipliers
  const campaignMultipliers: Record<CampaignType, number> = {
    awareness: 1.0,
    engagement: 1.1,
    conversion: 1.4,
    ugc: 0.8,
    affiliate: 0.6,
  };

  const calculations = useMemo(() => {
    const followersNum = parseFloat(followers) || 0;
    const engagement = parseFloat(engagementRate) || 0;

    const rates = platformRates[platform];
    let baseRate = rates.base;

    if (contentType === 'story') baseRate = rates.story;
    if (contentType === 'video' || contentType === 'reel') baseRate = rates.video;

    let basePrice = (followersNum / 1000) * baseRate;

    // Engagement multiplier
    const engagementMultiplier = engagement > 5
      ? 1.5
      : engagement > 3
        ? 1 + ((engagement - 3) * 0.15)
        : engagement > 1
          ? 1
          : 0.7;

    basePrice *= engagementMultiplier;

    // Niche multiplier
    const nicheMultiplier = nicheMultipliers[niche] || 1.0;
    basePrice *= nicheMultiplier;

    // Campaign type multiplier
    const campaignMultiplier = campaignMultipliers[campaignType] || 1.0;
    basePrice *= campaignMultiplier;

    // Tier adjustments
    let tierMultiplier = 1.0;
    let tier = 'Nano';

    if (followersNum >= 1000000) {
      tier = 'Mega';
      tierMultiplier = 0.7;
    } else if (followersNum >= 500000) {
      tier = 'Macro';
      tierMultiplier = 0.8;
    } else if (followersNum >= 100000) {
      tier = 'Mid-tier';
      tierMultiplier = 0.9;
    } else if (followersNum >= 10000) {
      tier = 'Micro';
      tierMultiplier = 1.0;
    } else if (followersNum >= 1000) {
      tier = 'Nano';
      tierMultiplier = 1.2;
    }

    basePrice *= tierMultiplier;

    // Add-ons
    let addOns = 0;
    if (exclusivity) addOns += basePrice * 0.5;
    if (usageRights) addOns += basePrice * 0.3;
    if (whitelisting) addOns += basePrice * 0.4;

    // Extra revisions
    const extraRevisions = Math.max(0, (parseInt(revisions) || 2) - 2);
    addOns += extraRevisions * (basePrice * 0.1);

    const totalPrice = basePrice + addOns;

    const lowPrice = totalPrice * 0.7;
    const highPrice = totalPrice * 1.5;

    // Package rates
    const storyPackage = (followersNum / 1000) * rates.story * engagementMultiplier * nicheMultiplier * tierMultiplier;
    const postPackage = (followersNum / 1000) * rates.base * engagementMultiplier * nicheMultiplier * tierMultiplier;
    const videoPackage = (followersNum / 1000) * rates.video * engagementMultiplier * nicheMultiplier * tierMultiplier;

    // Monthly retainer (4 posts/month)
    const monthlyRetainer = postPackage * 4 * 0.85;

    // Campaign packages
    const starterPackage = storyPackage * 3 + postPackage;
    const standardPackage = storyPackage * 5 + postPackage * 2 + videoPackage;
    const premiumPackage = storyPackage * 10 + postPackage * 4 + videoPackage * 2;

    return {
      basePrice,
      totalPrice,
      lowPrice,
      highPrice,
      tier,
      engagementMultiplier,
      nicheMultiplier,
      campaignMultiplier,
      addOns,
      storyPackage,
      postPackage,
      videoPackage,
      monthlyRetainer,
      starterPackage,
      standardPackage,
      premiumPackage,
      pricePerFollower: followersNum > 0 ? totalPrice / followersNum : 0,
      cpm: followersNum > 0 ? (totalPrice / followersNum) * 1000 : 0,
    };
  }, [platform, followers, engagementRate, contentType, niche, campaignType, exclusivity, usageRights, whitelisting, revisions]);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `You are an expert influencer marketing consultant. Analyze this influencer profile and provide detailed rate recommendations.

Profile Details:
- Platform: ${platform}
- Followers: ${parseInt(followers).toLocaleString()}
- Engagement Rate: ${engagementRate}%
- Niche: ${niche}
- Location: ${location}
- Audience Age: ${audienceAge}
- Average Views: ${avgViews || 'Not provided'}
- Average Likes: ${avgLikes || 'Not provided'}
- Previous Brand Work: ${previousBrands || 'Not specified'}
- Campaign Type: ${campaignType}
- Content Type: ${contentType}
- Add-ons: ${[exclusivity && 'Exclusivity', usageRights && 'Usage Rights', whitelisting && 'Whitelisting'].filter(Boolean).join(', ') || 'None'}

My calculated base rate: $${calculations.totalPrice.toFixed(0)}

Provide a JSON response with this exact structure:
{
  "suggestedRate": {
    "low": number,
    "mid": number,
    "high": number
  },
  "marketInsights": ["insight1", "insight2", "insight3", "insight4"],
  "negotiationTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "rateCardContent": "A professional rate card description (2-3 paragraphs) that this influencer can use in their media kit",
  "competitorComparison": "How this influencer's rates compare to similar creators in their niche",
  "strengthsWeaknesses": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["area to improve 1", "area to improve 2"]
  }
}

Consider current 2024-2025 market rates, platform-specific trends, and niche demand. Be specific and actionable.`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are an expert influencer marketing consultant with deep knowledge of creator economy rates and trends. Always respond with valid JSON only.',
        temperature: 0.7,
        maxTokens: 2000,
      });

      if (response.success === false) {
        throw new Error(response.error || 'Failed to analyze rates');
      }

      let content = '';
      if (response.data?.text) content = response.data.text;
      else if (response.text) content = response.text;
      else if (response.data?.content) content = response.data.content;
      else if (response.content) content = response.content;
      else if (typeof response.data === 'string') content = response.data;
      else if (typeof response === 'string') content = response;

      if (!content) throw new Error('No analysis received');

      // Clean JSON
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) cleanedContent = cleanedContent.slice(7);
      else if (cleanedContent.startsWith('```')) cleanedContent = cleanedContent.slice(3);
      if (cleanedContent.endsWith('```')) cleanedContent = cleanedContent.slice(0, -3);
      cleanedContent = cleanedContent.trim();

      const result = JSON.parse(cleanedContent) as AIAnalysis;
      setAiAnalysis(result);
      setActiveTab('insights');
    } catch (err) {
      console.error('AI analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyRateCard = async () => {
    const rateCard = generateRateCardText();
    await navigator.clipboard.writeText(rateCard);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateRateCardText = () => {
    const followersNum = parseInt(followers);
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       INFLUENCER RATE CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PROFILE OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}
Followers: ${followersNum.toLocaleString()}
Engagement Rate: ${engagementRate}%
Niche: ${niche.charAt(0).toUpperCase() + niche.slice(1)}
Tier: ${calculations.tier} Influencer
Location: ${location}
Audience: ${audienceAge}

💰 CONTENT RATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Story/Short:     $${calculations.storyPackage.toFixed(0)}
Feed Post:       $${calculations.postPackage.toFixed(0)}
Video/Reel:      $${calculations.videoPackage.toFixed(0)}

📦 CAMPAIGN PACKAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Starter Package:  $${calculations.starterPackage.toFixed(0)}
(3 Stories + 1 Post)

Standard Package: $${calculations.standardPackage.toFixed(0)}
(5 Stories + 2 Posts + 1 Video)

Premium Package:  $${calculations.premiumPackage.toFixed(0)}
(10 Stories + 4 Posts + 2 Videos)

🔄 ONGOING PARTNERSHIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monthly Retainer: $${calculations.monthlyRetainer.toFixed(0)}/month
(4 posts/month, 15% discount)

✨ ADD-ONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Exclusivity:      +50%
Usage Rights:     +30%
Whitelisting:     +40%
Rush Delivery:    +25%
Extra Revisions:  +10% each

${aiAnalysis?.rateCardContent || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Generated by Wants.chat
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
    return '$' + num.toFixed(0);
  };

  const platforms = [
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  ];

  const contentTypes: Record<Platform, { value: string; label: string }[]> = {
    instagram: [
      { value: 'post', label: 'Feed Post' },
      { value: 'story', label: 'Story' },
      { value: 'reel', label: 'Reel' },
    ],
    youtube: [
      { value: 'video', label: 'Dedicated Video' },
      { value: 'post', label: 'Integration' },
      { value: 'story', label: 'Short' },
    ],
    tiktok: [
      { value: 'video', label: 'Video' },
      { value: 'story', label: 'Story' },
    ],
    twitter: [
      { value: 'post', label: 'Tweet' },
      { value: 'thread', label: 'Thread' },
    ],
    linkedin: [
      { value: 'post', label: 'Post' },
      { value: 'video', label: 'Video' },
    ],
  };

  const niches = [
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'tech', label: 'Technology' },
    { value: 'finance', label: 'Finance/Investing' },
    { value: 'health', label: 'Health/Wellness' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'parenting', label: 'Parenting' },
    { value: 'business', label: 'Business/B2B' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
  ];

  const campaignTypes = [
    { value: 'awareness', label: 'Brand Awareness', desc: 'Introduce brand to audience' },
    { value: 'engagement', label: 'Engagement', desc: 'Drive likes, comments, shares' },
    { value: 'conversion', label: 'Conversion/Sales', desc: 'Drive purchases or signups' },
    { value: 'ugc', label: 'UGC Only', desc: 'Content for brand use only' },
    { value: 'affiliate', label: 'Affiliate', desc: 'Commission-based partnership' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0D9488]/10 rounded-lg">
              <Star className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.influencerRate.influencerRateCalculator', 'Influencer Rate Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.influencerRate.professionalSponsorshipPricing', 'Professional sponsorship pricing')}</p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1 text-xs text-[#0D9488]">
              <Sparkles className="w-3 h-3" />
              <span>{t('tools.influencerRate.preFilled', 'Pre-filled')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {[
          { id: 'calculator', label: 'Calculator', icon: DollarSign },
          { id: 'ratecard', label: 'Rate Card', icon: FileText },
          { id: 'insights', label: 'AI Insights', icon: BarChart2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#0D9488] border-b-2 border-[#0D9488]'
                : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {activeTab === 'calculator' && (
          <>
            {/* Platform Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Globe className="w-4 h-4 inline mr-1" />
                {t('tools.influencerRate.platform', 'Platform')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setPlatform(p.value as Platform);
                      setContentType(contentTypes[p.value as Platform][0].value as ContentType);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${platform === p.value ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  {t('tools.influencerRate.followers', 'Followers')}
                </label>
                <input
                  type="number"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  placeholder="50000"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Zap className="w-4 h-4 inline mr-1" />
                  {t('tools.influencerRate.engagement', 'Engagement %')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={engagementRate}
                  onChange={(e) => setEngagementRate(e.target.value)}
                  placeholder="4"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.influencerRate.avgViews', 'Avg Views')}
                </label>
                <input
                  type="number"
                  value={avgViews}
                  onChange={(e) => setAvgViews(e.target.value)}
                  placeholder={t('tools.influencerRate.optional', 'Optional')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.influencerRate.avgLikes', 'Avg Likes')}
                </label>
                <input
                  type="number"
                  value={avgLikes}
                  onChange={(e) => setAvgLikes(e.target.value)}
                  placeholder={t('tools.influencerRate.optional2', 'Optional')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            {/* Content & Campaign */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.influencerRate.contentType', 'Content Type')}
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {contentTypes[platform].map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Target className="w-4 h-4 inline mr-1" />
                  {t('tools.influencerRate.niche', 'Niche')}
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                >
                  {niches.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.influencerRate.location', 'Location')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('tools.influencerRate.unitedStates', 'United States')}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.influencerRate.audienceAge', 'Audience Age')}
                </label>
                <select
                  value={audienceAge}
                  onChange={(e) => setAudienceAge(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="13-17">13-17 (Gen Alpha)</option>
                  <option value="18-24">18-24 (Gen Z)</option>
                  <option value="18-34">18-34 (Millennials)</option>
                  <option value="25-44">25-44 (Millennials/Gen X)</option>
                  <option value="35-54">35-54 (Gen X)</option>
                  <option value="45+">45+ (Boomers)</option>
                </select>
              </div>
            </div>

            {/* Campaign Type */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.influencerRate.campaignType', 'Campaign Type')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {campaignTypes.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setCampaignType(ct.value as CampaignType)}
                    className={`p-3 rounded-lg text-left transition-colors ${campaignType === ct.value ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <div className="text-sm font-medium">{ct.label}</div>
                    <div className={`text-xs ${campaignType === ct.value ? 'text-white/70' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>{ct.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Previous Brands */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.influencerRate.previousBrandCollaborationsOptional', 'Previous Brand Collaborations (optional)')}
              </label>
              <input
                type="text"
                value={previousBrands}
                onChange={(e) => setPreviousBrands(e.target.value)}
                placeholder={t('tools.influencerRate.eGNikeSephoraSamsung', 'e.g., Nike, Sephora, Samsung')}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Add-ons */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.influencerRate.addOnsExtras', 'Add-ons & Extras')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exclusivity}
                    onChange={(e) => setExclusivity(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.influencerRate.exclusivity50NoCompetingBrand', 'Exclusivity (+50%) - No competing brand posts')}
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usageRights}
                    onChange={(e) => setUsageRights(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.influencerRate.usageRights30BrandCan', 'Usage Rights (+30%) - Brand can repurpose content')}
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whitelisting}
                    onChange={(e) => setWhitelisting(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.influencerRate.whitelisting40BrandRunsAds', 'Whitelisting (+40%) - Brand runs ads from your account')}
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.influencerRate.revisionsIncluded', 'Revisions included:')}
                  </span>
                  <select
                    value={revisions}
                    onChange={(e) => setRevisions(e.target.value)}
                    className={`px-3 py-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} {n > 2 ? `(+${(n - 2) * 10}%)` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Main Result */}
            <div className={`p-6 rounded-xl text-center ${isDark ? t('tools.influencerRate.bg0d948810Border0d9488', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                  {calculations.tier} Influencer
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {nicheMultipliers[niche]}x niche • {campaignMultipliers[campaignType]}x campaign
                </span>
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.influencerRate.recommendedRate', 'Recommended Rate')}</div>
              <div className="text-5xl font-bold text-[#0D9488] my-2">
                {formatCurrency(calculations.totalPrice)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Range: {formatCurrency(calculations.lowPrice)} - {formatCurrency(calculations.highPrice)}
              </div>
              <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                CPM: ${calculations.cpm.toFixed(2)} | {calculations.addOns > 0 && `Includes ${formatCurrency(calculations.addOns)} in add-ons`}
              </div>
            </div>

            {/* Package Rates */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.influencerRate.starterPackage', 'Starter Package')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.starterPackage)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>3 Stories + 1 Post</div>
              </div>
              <div className={`p-4 rounded-lg border-2 border-[#0D9488] ${isDark ? t('tools.influencerRate.bg0d948810', 'bg-[#0D9488]/10') : 'bg-teal-50'}`}>
                <div className="text-xs uppercase tracking-wide text-[#0D9488]">{t('tools.influencerRate.standardPackage', 'Standard Package')}</div>
                <div className="text-2xl font-bold text-[#0D9488]">
                  {formatCurrency(calculations.standardPackage)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>5 Stories + 2 Posts + 1 Video</div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.influencerRate.premiumPackage', 'Premium Package')}</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(calculations.premiumPackage)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>10 Stories + 4 Posts + 2 Videos</div>
              </div>
            </div>

            {/* AI Analysis Button */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={generateAIAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('tools.influencerRate.analyzingMarketRates', 'Analyzing Market Rates...')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {t('tools.influencerRate.getAiMarketAnalysis', 'Get AI Market Analysis')}
                </>
              )}
            </button>
          </>
        )}

        {activeTab === 'ratecard' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.influencerRate.yourProfessionalRateCard', 'Your Professional Rate Card')}</h4>
              <button
                onClick={copyRateCard}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : t('tools.influencerRate.bg0d9488TextWhiteHover', 'bg-[#0D9488] text-white hover:bg-[#0D9488]/90')}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.influencerRate.copied', 'Copied!') : t('tools.influencerRate.copyRateCard', 'Copy Rate Card')}
              </button>
            </div>
            <pre className={`p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap font-mono ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
              {generateRateCardText()}
            </pre>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {!aiAnalysis ? (
              <div className="text-center py-12">
                <BarChart2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.influencerRate.clickGetAiMarketAnalysis', 'Click "Get AI Market Analysis" in the Calculator tab to generate insights')}
                </p>
              </div>
            ) : (
              <>
                {/* AI Suggested Rate */}
                <div className={`p-6 rounded-xl ${isDark ? t('tools.influencerRate.bg0d948810Border0d94882', 'bg-[#0D9488]/10 border-[#0D9488]/30') : 'bg-teal-50 border-teal-200'} border`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.influencerRate.aiSuggestedMarketRate', 'AI-Suggested Market Rate')}</h4>
                  <div className="flex justify-between items-end">
                    <div className="text-center">
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.influencerRate.low', 'Low')}</div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${aiAnalysis.suggestedRate.low.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#0D9488]">{t('tools.influencerRate.recommended', 'Recommended')}</div>
                      <div className="text-4xl font-bold text-[#0D9488]">
                        ${aiAnalysis.suggestedRate.mid.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.influencerRate.premium', 'Premium')}</div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${aiAnalysis.suggestedRate.high.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitor Comparison */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.influencerRate.marketComparison', 'Market Comparison')}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {aiAnalysis.competitorComparison}
                  </p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                    <h4 className="font-medium mb-2 text-green-600">{t('tools.influencerRate.strengths', 'Strengths')}</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.strengthsWeaknesses.strengths.map((s, i) => (
                        <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="text-green-500">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
                    <h4 className="font-medium mb-2 text-yellow-600">{t('tools.influencerRate.areasToImprove', 'Areas to Improve')}</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.strengthsWeaknesses.weaknesses.map((w, i) => (
                        <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="text-yellow-500">→</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Market Insights */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    {t('tools.influencerRate.marketInsights', 'Market Insights')}
                  </h4>
                  <ul className="space-y-2">
                    {aiAnalysis.marketInsights.map((insight, i) => (
                      <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-[#0D9488]">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Negotiation Tips */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.influencerRate.negotiationStrategy', 'Negotiation Strategy')}</h4>
                  <ul className="space-y-2">
                    {aiAnalysis.negotiationTips.map((tip, i) => (
                      <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-[#0D9488] font-bold">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tier Guide */}
        {activeTab === 'calculator' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp className="w-4 h-4 inline mr-2" />
              {t('tools.influencerRate.influencerTiers', 'Influencer Tiers')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { tier: 'Nano', range: '1K-10K' },
                { tier: 'Micro', range: '10K-100K' },
                { tier: 'Mid-tier', range: '100K-500K' },
                { tier: 'Macro', range: '500K-1M' },
                { tier: 'Mega', range: '1M+' },
              ].map((t) => (
                <div
                  key={t.tier}
                  className={`p-2 rounded text-center ${calculations.tier === t.tier ? 'bg-[#0D9488] text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  <div className="font-medium text-sm">{t.tier}</div>
                  <div className="text-xs opacity-75">{t.range}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerRateTool;
