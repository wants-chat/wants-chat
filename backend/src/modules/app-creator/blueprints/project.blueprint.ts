import { Blueprint } from './blueprint.interface';

/**
 * Project Management Blueprint
 *
 * Defines the structure for a project management application:
 * - Projects and workspaces
 * - Task boards (Kanban)
 * - Team collaboration
 * - Milestones and deadlines
 */
export const projectBlueprint: Blueprint = {
  appType: 'project',
  description: 'Project management with tasks, teams, and milestones',

  coreEntities: ['project', 'task', 'milestone', 'team', 'member', 'comment'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Projects List
    {
      path: '/',
      name: 'Projects',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Projects', path: '/', icon: 'Folder' },
              { label: 'My Tasks', path: '/my-tasks', icon: 'CheckSquare' },
              { label: 'Teams', path: '/teams', icon: 'Users' },
              { label: 'Calendar', path: '/calendar', icon: 'Calendar' },
            ],
          },
        },
        {
          id: 'projects-grid',
          component: 'project-grid',
          entity: 'project',
          position: 'main',
          props: {
            title: 'Your Projects',
            showCreate: true,
          },
        },
      ],
    },
    // Project Detail - Board View
    {
      path: '/projects/:id',
      name: 'Project Board',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'project-header',
          component: 'project-header',
          entity: 'project',
          position: 'main',
        },
        {
          id: 'task-board',
          component: 'kanban-board',
          entity: 'task',
          position: 'main',
          props: {
            stages: ['backlog', 'todo', 'in_progress', 'review', 'done'],
          },
        },
      ],
    },
    // My Tasks
    {
      path: '/my-tasks',
      name: 'My Tasks',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'my-tasks',
          component: 'task-list',
          entity: 'task',
          position: 'main',
          props: {
            title: 'My Tasks',
            userScoped: true,
            groupBy: 'project',
          },
        },
      ],
    },
    // Teams
    {
      path: '/teams',
      name: 'Teams',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'teams-list',
          component: 'team-list',
          entity: 'team',
          position: 'main',
          props: {
            title: 'Teams',
            showCreate: true,
          },
        },
      ],
    },
    // Calendar
    {
      path: '/calendar',
      name: 'Calendar',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'calendar-view',
          component: 'calendar-view',
          entity: 'task',
          position: 'main',
          props: {
            title: 'Calendar',
          },
        },
      ],
    },
    // Task Detail
    {
      path: '/tasks/:id',
      name: 'Task Detail',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'task-detail',
          component: 'task-detail',
          entity: 'task',
          position: 'main',
        },
        {
          id: 'comments',
          component: 'comment-section',
          entity: 'comment',
          position: 'main',
        },
      ],
    },
  ],

  endpoints: [
    // Projects
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/projects/:id', entity: 'project', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/projects/:id', entity: 'project', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/projects/:id', entity: 'project', operation: 'delete', requiresAuth: true },
    { method: 'GET', path: '/projects/:id/tasks', entity: 'task', operation: 'list', requiresAuth: true },

    // Tasks
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tasks/:id', entity: 'task', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/tasks', entity: 'task', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/tasks/:id', entity: 'task', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/tasks/:id', entity: 'task', operation: 'delete', requiresAuth: true },
    { method: 'PATCH', path: '/tasks/:id/status', entity: 'task', operation: 'update', requiresAuth: true },

    // Milestones
    { method: 'GET', path: '/projects/:id/milestones', entity: 'milestone', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/milestones', entity: 'milestone', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/milestones/:id', entity: 'milestone', operation: 'update', requiresAuth: true },

    // Teams
    { method: 'GET', path: '/teams', entity: 'team', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/teams', entity: 'team', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/teams/:id/members', entity: 'member', operation: 'list', requiresAuth: true },

    // Comments
    { method: 'GET', path: '/tasks/:id/comments', entity: 'comment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/comments', entity: 'comment', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'color', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'is_public', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'team' },
        { type: 'hasMany', target: 'task' },
        { type: 'hasMany', target: 'milestone' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'due_date', type: 'datetime' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'position', type: 'integer' },
        { name: 'tags', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'milestone' },
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'comment' },
      ],
    },
    milestone: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'date', required: true },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'hasMany', target: 'task' },
      ],
    },
    team: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'avatar_url', type: 'image' },
      ],
      relationships: [
        { type: 'hasMany', target: 'member' },
        { type: 'hasMany', target: 'project' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'role', type: 'enum', required: true },
        { name: 'joined_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'team' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    comment: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'attachments', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'task' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default projectBlueprint;
