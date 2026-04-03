import { Blueprint } from './blueprint.interface';

/**
 * Patent Law Firm Blueprint
 */
export const patentlawBlueprint: Blueprint = {
  appType: 'patentlaw',
  description: 'Patent/IP law firm app with patents, trademarks, clients, and prosecution tracking',

  coreEntities: ['patent', 'trademark', 'client', 'attorney', 'matter', 'deadline'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Patents', path: '/patents', icon: 'FileText' },
        { label: 'Trademarks', path: '/trademarks', icon: 'Award' },
        { label: 'Clients', path: '/clients', icon: 'Briefcase' },
        { label: 'Attorneys', path: '/attorneys', icon: 'Users' },
        { label: 'Matters', path: '/matters', icon: 'Folder' },
        { label: 'Deadlines', path: '/deadlines', icon: 'Clock' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-deadlines', component: 'appointment-list', entity: 'deadline', position: 'main' },
    ]},
    { path: '/patents', name: 'Patents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patent-table', component: 'data-table', entity: 'patent', position: 'main' },
    ]},
    { path: '/trademarks', name: 'Trademarks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trademark-table', component: 'data-table', entity: 'trademark', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/attorneys', name: 'Attorneys', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'attorney-grid', component: 'staff-grid', entity: 'attorney', position: 'main' },
    ]},
    { path: '/matters', name: 'Matters', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'matter-board', component: 'kanban-board', entity: 'matter', position: 'main' },
    ]},
    { path: '/deadlines', name: 'Deadlines', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'deadline-calendar', component: 'appointment-calendar', entity: 'deadline', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/patents', entity: 'patent', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/patents', entity: 'patent', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/trademarks', entity: 'trademark', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/trademarks', entity: 'trademark', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/attorneys', entity: 'attorney', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/matters', entity: 'matter', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/deadlines', entity: 'deadline', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patent: {
      defaultFields: [
        { name: 'application_number', type: 'string', required: true },
        { name: 'patent_number', type: 'string' },
        { name: 'title', type: 'string', required: true },
        { name: 'patent_type', type: 'enum', required: true },
        { name: 'filing_date', type: 'date' },
        { name: 'priority_date', type: 'date' },
        { name: 'issue_date', type: 'date' },
        { name: 'expiration_date', type: 'date' },
        { name: 'inventors', type: 'json' },
        { name: 'assignee', type: 'string' },
        { name: 'classification', type: 'json' },
        { name: 'abstract', type: 'text' },
        { name: 'claims_count', type: 'integer' },
        { name: 'prosecution_history', type: 'json' },
        { name: 'maintenance_fees', type: 'json' },
        { name: 'foreign_filings', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'attorney' },
        { type: 'hasMany', target: 'deadline' },
      ],
    },
    trademark: {
      defaultFields: [
        { name: 'serial_number', type: 'string', required: true },
        { name: 'registration_number', type: 'string' },
        { name: 'mark_name', type: 'string', required: true },
        { name: 'mark_type', type: 'enum', required: true },
        { name: 'mark_description', type: 'text' },
        { name: 'filing_date', type: 'date' },
        { name: 'registration_date', type: 'date' },
        { name: 'renewal_date', type: 'date' },
        { name: 'classes', type: 'json' },
        { name: 'goods_services', type: 'text' },
        { name: 'owner', type: 'string' },
        { name: 'logo_url', type: 'image' },
        { name: 'prosecution_history', type: 'json' },
        { name: 'use_evidence', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'attorney' },
        { type: 'hasMany', target: 'deadline' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'industry', type: 'string' },
        { name: 'client_type', type: 'enum' },
        { name: 'billing_contact', type: 'json' },
        { name: 'billing_rate', type: 'decimal' },
        { name: 'retainer_balance', type: 'decimal' },
        { name: 'patent_count', type: 'integer' },
        { name: 'trademark_count', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'patent' },
        { type: 'hasMany', target: 'trademark' },
        { type: 'hasMany', target: 'matter' },
      ],
    },
    attorney: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'bar_number', type: 'string' },
        { name: 'patent_bar_number', type: 'string' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specializations', type: 'json' },
        { name: 'technical_background', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'years_experience', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'patent' },
        { type: 'hasMany', target: 'trademark' },
        { type: 'hasMany', target: 'matter' },
      ],
    },
    matter: {
      defaultFields: [
        { name: 'matter_number', type: 'string', required: true },
        { name: 'matter_name', type: 'string', required: true },
        { name: 'matter_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'open_date', type: 'date' },
        { name: 'close_date', type: 'date' },
        { name: 'billing_type', type: 'enum' },
        { name: 'budget', type: 'decimal' },
        { name: 'billed_amount', type: 'decimal' },
        { name: 'time_entries', type: 'json' },
        { name: 'documents', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'attorney' },
        { type: 'hasMany', target: 'deadline' },
      ],
    },
    deadline: {
      defaultFields: [
        { name: 'deadline_name', type: 'string', required: true },
        { name: 'deadline_type', type: 'enum', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'reminder_date', type: 'date' },
        { name: 'description', type: 'text' },
        { name: 'priority', type: 'enum' },
        { name: 'is_statutory', type: 'boolean' },
        { name: 'extendable', type: 'boolean' },
        { name: 'assigned_to', type: 'json' },
        { name: 'completed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patent' },
        { type: 'belongsTo', target: 'trademark' },
        { type: 'belongsTo', target: 'matter' },
      ],
    },
  },
};

export default patentlawBlueprint;
