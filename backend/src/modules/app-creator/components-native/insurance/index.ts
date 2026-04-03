/**
 * Insurance Components (React Native)
 *
 * This module exports all insurance component generators for React Native apps.
 * Includes claims management, customer profiles, policies, quotes, and dashboard stats.
 */

// Claims components
export {
  generateClaimsList,
  generateClaimsStats,
  generateClaimForm,
  generateClaimTimeline,
  type ClaimsOptions,
} from './claims.generator';

// Customer components
export {
  generateCustomerProfile,
  generateDocumentList,
  type CustomerOptions,
} from './customer.generator';

// Policy components
export {
  generatePolicyList,
  generatePolicyDetail,
  generatePolicyFilters,
  generatePolicyForm,
  type PolicyOptions,
} from './policy.generator';

// Quote components
export {
  generateQuoteList,
  generateQuoteWizard,
  type QuoteOptions,
} from './quote.generator';

// Stats components
export {
  generateInsuranceStats,
  type InsuranceStatsOptions,
} from './stats.generator';
