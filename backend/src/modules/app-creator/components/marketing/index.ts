/**
 * Marketing Component Generators Index
 *
 * Exports all marketing-related component generators for the App Creator module.
 * These generators produce complete React components with TypeScript, dark mode support,
 * and integration with React Query for data fetching.
 */

// ============================================
// CAMPAIGN COMPONENTS
// ============================================

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

// ============================================
// AFFILIATE COMPONENTS
// ============================================

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

// ============================================
// REFERRAL COMPONENTS
// ============================================

export {
  generateCampaignStatsReferral,
  generateRewardTiers,
  generateReferralFilters,
  type CampaignStatsReferralOptions,
  type RewardTiersOptions,
  type ReferralFiltersOptions,
} from './referral.generator';

// ============================================
// SUBSCRIBER COMPONENTS
// ============================================

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

// ============================================
// CLIENT COMPONENTS (MARKETING)
// ============================================

export {
  generateClientHeaderMarketing,
  generateClientPerformanceMarketing,
  generateProjectBoardMarketing,
  generateTaskListMarketing,
  type ClientHeaderMarketingOptions,
  type ClientPerformanceMarketingOptions,
  type ProjectBoardMarketingOptions,
  type TaskListMarketingOptions,
} from './client.generator';
