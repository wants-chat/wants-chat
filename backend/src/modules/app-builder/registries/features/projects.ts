/**
 * Projects Feature Definition
 *
 * Project management with milestones, timelines,
 * and progress tracking.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const PROJECTS_FEATURE: FeatureDefinition = {
  id: 'projects',
  name: 'Projects',
  category: 'business',
  description: 'Project management with milestones and progress tracking',
  icon: 'folder-kanban',

  includedInAppTypes: [
    'project-management',
    'agency',
    'consulting',
    'construction',
    'software-development',
    'creative-agency',
    'marketing',
    'research',
    'engineering',
  ],

  activationKeywords: [
    'projects',
    'project management',
    'milestones',
    'project tracking',
    'timeline',
    'gantt',
    'basecamp',
    'monday',
    'project planning',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'projects-list',
      route: '/projects',
      section: 'frontend',
      title: 'Projects',
      authRequired: true,
      templateId: 'projects-list',
      components: [
        'projects-grid',
        'project-card',
        'status-filter',
        'create-project-button',
      ],
      layout: 'default',
    },
    {
      id: 'project-detail',
      route: '/projects/:id',
      section: 'frontend',
      title: 'Project',
      authRequired: true,
      templateId: 'project-detail',
      components: [
        'project-header',
        'project-overview',
        'milestones-timeline',
        'project-tasks',
        'team-members',
      ],
      layout: 'default',
    },
    {
      id: 'project-timeline',
      route: '/projects/:id/timeline',
      section: 'frontend',
      title: 'Timeline',
      authRequired: true,
      templateId: 'project-timeline',
      components: [
        'gantt-chart',
        'milestone-markers',
        'dependency-lines',
      ],
      layout: 'default',
    },
    {
      id: 'project-files',
      route: '/projects/:id/files',
      section: 'frontend',
      title: 'Project Files',
      authRequired: true,
      templateId: 'project-files',
      components: [
        'files-list',
        'upload-button',
        'folder-tree',
      ],
      layout: 'default',
    },
  ],

  components: [
    // List
    'projects-grid',
    'project-card',
    'status-filter',
    'create-project-button',

    // Detail
    'project-header',
    'project-overview',
    'project-tasks',
    'team-members',
    'project-progress',

    // Timeline
    'milestones-timeline',
    'gantt-chart',
    'milestone-markers',
    'dependency-lines',
    'milestone-form',

    // Files
    'files-list',
    'upload-button',
    'folder-tree',

    // Form
    'project-form',
    'date-range-picker',
    'budget-input',
    'client-picker',
  ],

  entities: [
    {
      name: 'projects',
      displayName: 'Projects',
      description: 'Projects',
      isCore: true,
    },
    {
      name: 'milestones',
      displayName: 'Milestones',
      description: 'Project milestones',
      isCore: true,
    },
    {
      name: 'project_members',
      displayName: 'Project Members',
      description: 'Project team',
      isCore: false,
    },
    {
      name: 'project_files',
      displayName: 'Project Files',
      description: 'Project documents',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/projects',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'List projects',
    },
    {
      method: 'GET',
      path: '/projects/:id',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'Get project',
    },
    {
      method: 'POST',
      path: '/projects',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'Create project',
    },
    {
      method: 'PUT',
      path: '/projects/:id',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'Update project',
    },
    {
      method: 'DELETE',
      path: '/projects/:id',
      auth: true,
      handler: 'crud',
      entity: 'projects',
      description: 'Delete project',
    },
    {
      method: 'GET',
      path: '/projects/:id/milestones',
      auth: true,
      handler: 'crud',
      entity: 'milestones',
      description: 'List milestones',
    },
    {
      method: 'POST',
      path: '/projects/:id/milestones',
      auth: true,
      handler: 'crud',
      entity: 'milestones',
      description: 'Create milestone',
    },
    {
      method: 'PUT',
      path: '/milestones/:id',
      auth: true,
      handler: 'crud',
      entity: 'milestones',
      description: 'Update milestone',
    },
    {
      method: 'GET',
      path: '/projects/:id/members',
      auth: true,
      handler: 'crud',
      entity: 'project_members',
      description: 'List members',
    },
    {
      method: 'POST',
      path: '/projects/:id/members',
      auth: true,
      handler: 'crud',
      entity: 'project_members',
      description: 'Add member',
    },
    {
      method: 'POST',
      path: '/projects/:id/archive',
      auth: true,
      handler: 'custom',
      entity: 'projects',
      description: 'Archive project',
    },
  ],

  config: [
    {
      key: 'defaultStatus',
      label: 'Default Status',
      type: 'string',
      default: 'planning',
      description: 'Default project status',
    },
    {
      key: 'enableBudget',
      label: 'Enable Budget Tracking',
      type: 'boolean',
      default: true,
      description: 'Track project budgets',
    },
    {
      key: 'enableTimeline',
      label: 'Enable Timeline View',
      type: 'boolean',
      default: true,
      description: 'Show Gantt/timeline',
    },
    {
      key: 'archiveAfterDays',
      label: 'Auto-archive (days after completion)',
      type: 'number',
      default: 30,
      description: 'Archive completed projects',
    },
  ],
};
