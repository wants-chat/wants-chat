/**
 * Recruitment Component Generators Index
 *
 * Exports all recruitment/HR related component generators for:
 * - Job management (ActiveJobsRecruitment, JobFiltersRecruitment, JobTimeline)
 * - Candidate management (CandidateFilters, PlacementPipeline, InterviewSchedule)
 * - Client management (ClientProfileRecruitment)
 * - Statistics and analytics (RecruitmentStats, RecruitmentKPICards, RecruitmentMetricsChart)
 */

// Jobs Components
export {
  generateActiveJobsRecruitment,
  generateJobFiltersRecruitment,
  generateJobTimeline,
  type JobsRecruitmentOptions,
} from './jobs.generator';

// Candidates Components
export {
  generateCandidateFilters,
  generatePlacementPipeline,
  generateInterviewSchedule,
  type CandidatesRecruitmentOptions,
} from './candidates.generator';

// Client Components
export {
  generateClientProfileRecruitment,
  type ClientRecruitmentOptions,
} from './client.generator';

// Stats Components
export {
  generateRecruitmentStats,
  generateRecruitmentKPICards,
  generateRecruitmentMetricsChart,
  type RecruitmentStatsOptions,
} from './stats.generator';
