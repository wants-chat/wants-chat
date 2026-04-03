/**
 * Tasks Feature Definition
 *
 * Task management with lists, boards, assignments,
 * due dates, and progress tracking.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const TASKS_FEATURE: FeatureDefinition = {
  id: 'tasks',
  name: 'Tasks',
  category: 'business',
  description: 'Task management with lists, boards, and assignments',
  icon: 'check-square',

  includedInAppTypes: [
    'project-management',
    'team-collaboration',
    'productivity',
    'todo-app',
    'personal-organizer',
    'agile',
    'startup',
    'agency',
    'freelance',
  ],

  activationKeywords: [
    'tasks',
    'task management',
    'todo',
    'to-do',
    'kanban',
    'task board',
    'asana',
    'todoist',
    'trello',
    'checklist',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'tasks-list',
      route: '/tasks',
      section: 'frontend',
      title: 'Tasks',
      authRequired: true,
      templateId: 'tasks-list',
      components: [
        'task-list',
        'task-item',
        'quick-add',
        'filter-bar',
        'view-switcher',
      ],
      layout: 'default',
    },
    {
      id: 'task-board',
      route: '/tasks/board',
      section: 'frontend',
      title: 'Task Board',
      authRequired: true,
      templateId: 'task-board',
      components: [
        'kanban-board',
        'kanban-column',
        'task-card',
        'add-column',
      ],
      layout: 'default',
    },
    {
      id: 'task-detail',
      route: '/tasks/:id',
      section: 'frontend',
      title: 'Task',
      authRequired: true,
      templateId: 'task-detail',
      components: [
        'task-header',
        'task-description',
        'subtasks-list',
        'attachments',
        'comments',
        'activity-log',
      ],
      layout: 'default',
    },
    {
      id: 'my-tasks',
      route: '/my-tasks',
      section: 'frontend',
      title: 'My Tasks',
      authRequired: true,
      templateId: 'my-tasks',
      components: [
        'my-tasks-list',
        'due-today',
        'overdue-tasks',
        'completed-tasks',
      ],
      layout: 'default',
    },
  ],

  components: [
    // List view
    'task-list',
    'task-item',
    'quick-add',
    'filter-bar',
    'view-switcher',

    // Board view
    'kanban-board',
    'kanban-column',
    'task-card',
    'add-column',
    'drag-handle',

    // Detail
    'task-header',
    'task-description',
    'subtasks-list',
    'attachments',
    'comments',
    'activity-log',

    // My tasks
    'my-tasks-list',
    'due-today',
    'overdue-tasks',
    'completed-tasks',

    // Form
    'task-form',
    'assignee-picker',
    'due-date-picker',
    'priority-picker',
    'labels-picker',
  ],

  entities: [
    {
      name: 'tasks',
      displayName: 'Tasks',
      description: 'Task items',
      isCore: true,
    },
    {
      name: 'task_lists',
      displayName: 'Task Lists',
      description: 'Task lists/columns',
      isCore: true,
    },
    {
      name: 'subtasks',
      displayName: 'Subtasks',
      description: 'Subtasks',
      isCore: false,
    },
    {
      name: 'task_labels',
      displayName: 'Labels',
      description: 'Task labels',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/tasks',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'List tasks',
    },
    {
      method: 'GET',
      path: '/tasks/:id',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'Get task',
    },
    {
      method: 'POST',
      path: '/tasks',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'Create task',
    },
    {
      method: 'PUT',
      path: '/tasks/:id',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'Update task',
    },
    {
      method: 'DELETE',
      path: '/tasks/:id',
      auth: true,
      handler: 'crud',
      entity: 'tasks',
      description: 'Delete task',
    },
    {
      method: 'POST',
      path: '/tasks/:id/complete',
      auth: true,
      handler: 'custom',
      entity: 'tasks',
      description: 'Complete task',
    },
    {
      method: 'POST',
      path: '/tasks/:id/move',
      auth: true,
      handler: 'custom',
      entity: 'tasks',
      description: 'Move task',
    },
    {
      method: 'GET',
      path: '/task-lists',
      auth: true,
      handler: 'crud',
      entity: 'task_lists',
      description: 'List task lists',
    },
    {
      method: 'POST',
      path: '/task-lists',
      auth: true,
      handler: 'crud',
      entity: 'task_lists',
      description: 'Create list',
    },
    {
      method: 'GET',
      path: '/tasks/:id/subtasks',
      auth: true,
      handler: 'crud',
      entity: 'subtasks',
      description: 'Get subtasks',
    },
    {
      method: 'POST',
      path: '/tasks/:id/subtasks',
      auth: true,
      handler: 'crud',
      entity: 'subtasks',
      description: 'Add subtask',
    },
  ],

  config: [
    {
      key: 'defaultView',
      label: 'Default View',
      type: 'string',
      default: 'list',
      description: 'Default view (list, board)',
    },
    {
      key: 'enableSubtasks',
      label: 'Enable Subtasks',
      type: 'boolean',
      default: true,
      description: 'Allow subtasks',
    },
    {
      key: 'enableLabels',
      label: 'Enable Labels',
      type: 'boolean',
      default: true,
      description: 'Allow task labels',
    },
    {
      key: 'defaultPriority',
      label: 'Default Priority',
      type: 'string',
      default: 'medium',
      description: 'Default task priority',
    },
  ],
};
