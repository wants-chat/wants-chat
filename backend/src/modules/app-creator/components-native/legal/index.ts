/**
 * Legal Component Generators Index (React Native)
 *
 * Exports all legal-related component generators for React Native apps.
 */

export {
  generateAttorneyProfile,
  type AttorneyOptions,
} from './attorney.generator';

export {
  generateCaseFilters,
  generateCaseFiltersLawfirm,
  generateCaseHeader,
  generateCaseListActive,
  generateCaseStats,
  generateCaseTimeline,
  generateCaseTimelineLawfirm,
  type CaseOptions,
} from './case.generator';

export {
  generateClientProfileLawfirm,
  generateClientProfileLegal,
  type ClientOptions,
} from './client.generator';

export {
  generateDeadlineListLawfirm,
  type DeadlineOptions,
} from './deadline.generator';

export {
  generateLawfirmStats,
  type LawfirmOptions,
} from './lawfirm.generator';
