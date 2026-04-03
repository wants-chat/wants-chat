/**
 * Nonprofit Component Generators (React Native)
 *
 * Components for church management, donations, campaigns, and funeral services.
 */

// Church Components
export {
  generateChurchStats,
  generateSermonList,
  generateSermonNotes,
  generateSermonPlayer,
  generatePrayerList,
  type ChurchOptions,
} from './church.generator';

// Donation Components
export {
  generateDonationStats,
  generateDonationChart,
  generateDonationFiltersNonprofit,
  generateDonationSummary,
  generateDonorProfile,
  generateMemberDonations,
  type DonationOptions,
} from './donation.generator';

// Campaign Components
export {
  generateCampaignListNonprofit,
  generateCampaignProgressNonprofit,
  generateFundingProgress,
  type CampaignOptions,
} from './campaign.generator';

// Funeral Components
export {
  generateFuneralStats,
  generateArrangementList,
  generateArrangementListUpcoming,
  generateObituaryListRecent,
  type FuneralOptions,
} from './funeral.generator';
