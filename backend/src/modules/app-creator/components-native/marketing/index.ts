/**
 * Marketing Component Generators (React Native)
 *
 * This module exports generators for marketing-related components:
 * - Affiliate marketing (leaderboard, stats, link generator, payouts, commissions)
 * - Campaign management (filters, header, list, performance, stats, story)
 * - Client management (filters, header, list, projects, stats)
 * - Referral programs (stats, reward tiers, filters)
 * - Subscriber/SaaS metrics (chart, profile, churn, MRR, plan distribution)
 */

// Affiliate generators
export {
  generateAffiliateLeaderboard,
  generateAffiliateStats,
  generateLinkGenerator,
  generatePayoutBalance,
  generateCommissionSummary,
  type AffiliateLeaderboardOptions,
  type AffiliateStatsOptions,
  type LinkGeneratorOptions,
  type PayoutBalanceOptions,
  type CommissionSummaryOptions,
} from './affiliate.generator';

// Campaign generators
export {
  generateCampaignFilters,
  generateCampaignFiltersMarketing,
  generateCampaignHeader,
  generateCampaignListActive,
  generateCampaignPerformance,
  generateCampaignStats,
  generateCampaignStory,
  type CampaignFiltersOptions,
  type CampaignFiltersMarketingOptions,
  type CampaignHeaderOptions,
  type CampaignListActiveOptions,
  type CampaignPerformanceOptions,
  type CampaignStatsOptions,
  type CampaignStoryOptions,
} from './campaign.generator';

// Client generators
export {
  generateClientFilters,
  generateClientHeader,
  generateClientList,
  generateClientProjects,
  generateClientStats,
  type ClientFiltersOptions,
  type ClientHeaderOptions,
  type ClientListOptions,
  type ClientProjectsOptions,
  type ClientStatsOptions,
} from './client.generator';

// Referral generators
export {
  generateCampaignStatsReferral,
  generateRewardTiers,
  generateReferralFilters,
  type CampaignStatsReferralOptions,
  type RewardTiersOptions,
  type ReferralFiltersOptions,
} from './referral.generator';

// Subscriber generators
export {
  generateSubscriberChart,
  generateSubscriberProfile,
  generateChurnMetrics,
  generateMrrStats,
  generatePlanDistribution,
  type SubscriberChartOptions,
  type SubscriberProfileOptions,
  type ChurnMetricsOptions,
  type MrrStatsOptions,
  type PlanDistributionOptions,
} from './subscriber.generator';
