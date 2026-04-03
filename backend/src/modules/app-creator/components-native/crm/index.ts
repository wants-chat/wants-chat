/**
 * CRM Component Generators Index (React Native)
 *
 * Exports all CRM-related component generators for React Native apps.
 */

export {
  generateKanbanBoard,
  generatePipelineOverview,
  type KanbanBoardOptions,
  type PipelineOverviewOptions,
} from './kanban-board.generator';

export {
  generateContactProfile,
  generateCompanyProfile,
  generateDealCard,
  type ContactProfileOptions,
  type CompanyProfileOptions,
  type DealCardOptions,
} from './contact-profile.generator';

export {
  generateTaskList,
  generateNotesList,
  type TaskListOptions,
  type NotesListOptions,
} from './task-list.generator';
