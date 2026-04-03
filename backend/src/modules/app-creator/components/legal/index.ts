/**
 * Legal/Lawfirm Component Generators Index
 *
 * Exports all legal and law firm related component generators.
 */

// Case generators
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

// Attorney generators
export {
  generateAttorneyProfile,
  type AttorneyOptions,
} from './attorney.generator';

// Client generators
export {
  generateClientProfileLawfirm,
  generateClientProfileLegal,
  type ClientOptions,
} from './client.generator';

// Deadline generators
export {
  generateDeadlineListLawfirm,
  type DeadlineOptions,
} from './deadline.generator';

// Lawfirm stats generators
export {
  generateLawfirmStats,
  type LawfirmOptions,
} from './lawfirm.generator';
