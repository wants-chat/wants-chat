/**
 * React Native Job Board Component Generators Index
 *
 * Provides generators for React Native job board components:
 * - Job Search with filters
 * - Job List and Job Filters
 * - Job Detail and Apply Card
 * - Company Card and Company Grid
 * - Application Form, List, and Candidate Profile
 */

// Job Search components
export {
  generateJobSearch,
  generateJobList,
  generateJobFilters,
  type JobSearchOptions,
} from './job-search.generator';

// Job Detail components
export {
  generateJobDetail,
  generateApplyCard,
  type JobDetailOptions,
} from './job-detail.generator';

// Company components
export {
  generateCompanyCard,
  generateCompanyGrid,
  type CompanyCardOptions,
} from './company-card.generator';

// Application components
export {
  generateApplicationForm,
  generateApplicationList,
  generateCandidateProfile,
  type ApplicationOptions,
} from './application.generator';
