/**
 * Insurance Component Generators
 *
 * Provides generators for insurance-related UI components including
 * policy management, claims processing, quotes, and customer profiles.
 */

// Policy Components
export {
  generatePolicyList,
  generatePolicyDetail,
  generatePolicyFilters,
  generatePolicyForm,
  type PolicyOptions,
} from './policy.generator';

// Claims Components
export {
  generateClaimsList,
  generateClaimsStats,
  generateClaimForm,
  generateClaimTimeline,
  type ClaimsOptions,
} from './claims.generator';

// Quote Components
export {
  generateQuoteList,
  generateQuoteWizard,
  type QuoteOptions,
} from './quote.generator';

// Customer Components
export {
  generateCustomerProfile,
  generateDocumentList,
  type CustomerOptions,
} from './customer.generator';

// Stats Components
export {
  generateInsuranceStats,
  type InsuranceStatsOptions,
} from './stats.generator';
