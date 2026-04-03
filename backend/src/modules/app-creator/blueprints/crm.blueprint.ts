import { Blueprint } from './blueprint.interface';

/**
 * CRM Blueprint
 *
 * Defines the structure for a CRM application:
 * - Contact management
 * - Company/organization tracking
 * - Deal pipeline
 * - Task management
 * - Notes and activities
 */
export const crmBlueprint: Blueprint = {
  appType: 'crm',
  description: 'CRM with contacts, companies, deals, and task management',

  coreEntities: ['contact', 'company', 'deal', 'task', 'note', 'activity'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Dashboard
    {
      path: '/',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
              { label: 'Contacts', path: '/contacts', icon: 'Users' },
              { label: 'Companies', path: '/companies', icon: 'Building' },
              { label: 'Deals', path: '/deals', icon: 'Handshake' },
              { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['contacts', 'deals', 'revenue', 'tasks'],
          },
        },
        {
          id: 'pipeline',
          component: 'pipeline-overview',
          entity: 'deal',
          position: 'main',
          props: {
            title: 'Deal Pipeline',
          },
        },
        {
          id: 'recent-activity',
          component: 'activity-feed',
          entity: 'activity',
          position: 'main',
          props: {
            title: 'Recent Activity',
            limit: 5,
          },
        },
      ],
    },
    // Contacts
    {
      path: '/contacts',
      name: 'Contacts',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'contacts-table',
          component: 'data-table',
          entity: 'contact',
          position: 'main',
          props: {
            title: 'Contacts',
            showCreate: true,
            showEdit: true,
            showDelete: true,
            columns: ['name', 'email', 'phone', 'company', 'status', 'created_at'],
          },
        },
      ],
    },
    {
      path: '/contacts/:id',
      name: 'Contact Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'contact-profile',
          component: 'contact-profile',
          entity: 'contact',
          position: 'main',
        },
        {
          id: 'contact-deals',
          component: 'data-list',
          entity: 'deal',
          position: 'main',
          props: {
            title: 'Deals',
          },
        },
        {
          id: 'contact-notes',
          component: 'notes-list',
          entity: 'note',
          position: 'main',
          props: {
            title: 'Notes',
          },
        },
      ],
    },
    // Companies
    {
      path: '/companies',
      name: 'Companies',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'companies-table',
          component: 'data-table',
          entity: 'company',
          position: 'main',
          props: {
            title: 'Companies',
            showCreate: true,
            columns: ['name', 'industry', 'website', 'contacts_count', 'deals_value'],
          },
        },
      ],
    },
    {
      path: '/companies/:id',
      name: 'Company Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'company-profile',
          component: 'company-profile',
          entity: 'company',
          position: 'main',
        },
        {
          id: 'company-contacts',
          component: 'data-list',
          entity: 'contact',
          position: 'main',
        },
      ],
    },
    // Deals
    {
      path: '/deals',
      name: 'Deals',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'deals-pipeline',
          component: 'kanban-board',
          entity: 'deal',
          position: 'main',
          props: {
            title: 'Deal Pipeline',
            stages: ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
          },
        },
      ],
    },
    // Tasks
    {
      path: '/tasks',
      name: 'Tasks',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'tasks-list',
          component: 'task-list',
          entity: 'task',
          position: 'main',
          props: {
            title: 'Tasks',
            showCreate: true,
            groupBy: 'due_date',
          },
        },
      ],
    },
  ],

  endpoints: [
    // Contacts
    { method: 'GET', path: '/contacts', entity: 'contact', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/contacts/:id', entity: 'contact', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/contacts', entity: 'contact', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/contacts/:id', entity: 'contact', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/contacts/:id', entity: 'contact', operation: 'delete', requiresAuth: true },

    // Companies
    { method: 'GET', path: '/companies', entity: 'company', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/companies/:id', entity: 'company', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/companies', entity: 'company', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/companies/:id', entity: 'company', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/companies/:id/contacts', entity: 'contact', operation: 'list', requiresAuth: true },

    // Deals
    { method: 'GET', path: '/deals', entity: 'deal', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/deals/:id', entity: 'deal', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/deals', entity: 'deal', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/deals/:id', entity: 'deal', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/deals/:id/stage', entity: 'deal', operation: 'update', requiresAuth: true },

    // Tasks
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tasks', entity: 'task', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/tasks/:id', entity: 'task', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/tasks/:id/complete', entity: 'task', operation: 'update', requiresAuth: true },

    // Notes
    { method: 'GET', path: '/contacts/:id/notes', entity: 'note', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/notes', entity: 'note', operation: 'create', requiresAuth: true },

    // Activities
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    contact: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'title', type: 'string' },
        { name: 'status', type: 'enum' },
        { name: 'source', type: 'enum' },
        { name: 'avatar_url', type: 'image' },
        { name: 'address', type: 'json' },
        { name: 'tags', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'company' },
        { type: 'hasMany', target: 'deal' },
        { type: 'hasMany', target: 'note' },
        { type: 'hasMany', target: 'task' },
      ],
    },
    company: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'industry', type: 'string' },
        { name: 'website', type: 'url' },
        { name: 'phone', type: 'phone' },
        { name: 'email', type: 'email' },
        { name: 'size', type: 'enum' },
        { name: 'logo_url', type: 'image' },
        { name: 'address', type: 'json' },
        { name: 'description', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'contact' },
        { type: 'hasMany', target: 'deal' },
      ],
    },
    deal: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'value', type: 'decimal', required: true },
        { name: 'currency', type: 'string' },
        { name: 'stage', type: 'enum', required: true },
        { name: 'probability', type: 'integer' },
        { name: 'expected_close_date', type: 'date' },
        { name: 'description', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'contact' },
        { type: 'belongsTo', target: 'company' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'datetime' },
        { name: 'priority', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'completed_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'contact' },
        { type: 'belongsTo', target: 'deal' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    note: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'type', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'contact' },
        { type: 'belongsTo', target: 'deal' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    activity: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'metadata', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'contact' },
        { type: 'belongsTo', target: 'deal' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default crmBlueprint;
