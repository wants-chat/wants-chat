/**
 * Project Management Component Generators Index (React Native)
 */

// Project Grid and related components
export {
  generateProjectGrid,
  generateProjectHeader,
  generateMilestoneTracker,
  generateTeamMembers,
  type ProjectGridOptions,
} from './project-grid.generator';

// Work Order components
export {
  generateActiveWorkOrders,
  generateWorkOrderFilters,
  generateWorkOrderTimeline,
  generateWorkFilters,
  type WorkOrderOptions,
} from './work.generator';

// Task components
export {
  generateTaskDetail,
  generateTaskBoard,
  generateTaskListWedding,
  type TaskOptions,
} from './task.generator';

// Project Detail and Filter components
export {
  generateProjectFilters,
  generateProjectFiltersConsulting,
  generateProjectFiltersDesign,
  generateProjectTimelineConsulting,
  type ProjectFilterOptions,
} from './project-detail.generator';

// Time Tracking components
export {
  generateTimeTracker,
  generateTimeTrackerConsulting,
  type TimeTrackerOptions,
} from './time.generator';
