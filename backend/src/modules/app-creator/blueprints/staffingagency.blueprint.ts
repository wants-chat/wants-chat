import { Blueprint } from './blueprint.interface';

/**
 * Staffing Agency Blueprint
 */
export const staffingagencyBlueprint: Blueprint = {
  appType: 'staffingagency',
  description: 'Staffing agency app with candidates, clients, job orders, and placements',

  coreEntities: ['candidate', 'client', 'job_order', 'placement', 'timesheet', 'interview'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Candidates', path: '/candidates', icon: 'Users' },
        { label: 'Clients', path: '/clients', icon: 'Building' },
        { label: 'Job Orders', path: '/jobs', icon: 'Briefcase' },
        { label: 'Placements', path: '/placements', icon: 'UserCheck' },
        { label: 'Timesheets', path: '/timesheets', icon: 'Clock' },
        { label: 'Interviews', path: '/interviews', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-jobs', component: 'kanban-board', entity: 'job_order', position: 'main' },
    ]},
    { path: '/candidates', name: 'Candidates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'candidate', position: 'main' },
      { id: 'candidate-table', component: 'data-table', entity: 'candidate', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/jobs', name: 'Job Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'job_order', position: 'main' },
      { id: 'job-board', component: 'kanban-board', entity: 'job_order', position: 'main' },
    ]},
    { path: '/placements', name: 'Placements', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'placement-table', component: 'data-table', entity: 'placement', position: 'main' },
    ]},
    { path: '/timesheets', name: 'Timesheets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'timesheet-table', component: 'data-table', entity: 'timesheet', position: 'main' },
    ]},
    { path: '/interviews', name: 'Interviews', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'interview-calendar', component: 'appointment-calendar', entity: 'interview', position: 'main' },
    ]},
    { path: '/careers', name: 'Browse Jobs', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'job_order', position: 'main' },
      { id: 'job-list', component: 'data-table', entity: 'job_order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/candidates', entity: 'candidate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/candidates', entity: 'candidate', operation: 'create' },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/jobs', entity: 'job_order', operation: 'list' },
    { method: 'POST', path: '/jobs', entity: 'job_order', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/placements', entity: 'placement', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/placements', entity: 'placement', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/timesheets', entity: 'timesheet', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/timesheets', entity: 'timesheet', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/interviews', entity: 'interview', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/interviews', entity: 'interview', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    candidate: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'skills', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'resume_url', type: 'string' },
        { name: 'desired_pay_rate', type: 'decimal' },
        { name: 'job_preferences', type: 'json' },
        { name: 'availability', type: 'enum' },
        { name: 'work_authorization', type: 'enum' },
        { name: 'background_check', type: 'boolean' },
        { name: 'drug_test', type: 'boolean' },
        { name: 'recruiter', type: 'string' },
        { name: 'source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'placement' },
        { type: 'hasMany', target: 'interview' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'industry', type: 'enum' },
        { name: 'bill_rate_range', type: 'json' },
        { name: 'payment_terms', type: 'enum' },
        { name: 'contract_on_file', type: 'boolean' },
        { name: 'account_manager', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'job_order' },
        { type: 'hasMany', target: 'placement' },
      ],
    },
    job_order: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'job_title', type: 'string', required: true },
        { name: 'job_type', type: 'enum', required: true },
        { name: 'department', type: 'string' },
        { name: 'location', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'requirements', type: 'json' },
        { name: 'bill_rate', type: 'decimal' },
        { name: 'pay_rate', type: 'decimal' },
        { name: 'openings', type: 'integer' },
        { name: 'filled', type: 'integer' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'recruiter', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'placement' },
        { type: 'hasMany', target: 'interview' },
      ],
    },
    placement: {
      defaultFields: [
        { name: 'placement_number', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'pay_rate', type: 'decimal', required: true },
        { name: 'bill_rate', type: 'decimal', required: true },
        { name: 'pay_type', type: 'enum' },
        { name: 'work_schedule', type: 'json' },
        { name: 'supervisor', type: 'string' },
        { name: 'performance_notes', type: 'text' },
        { name: 'conversion_date', type: 'date' },
        { name: 'conversion_fee', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'candidate' },
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'job_order' },
        { type: 'hasMany', target: 'timesheet' },
      ],
    },
    timesheet: {
      defaultFields: [
        { name: 'week_ending', type: 'date', required: true },
        { name: 'regular_hours', type: 'decimal' },
        { name: 'overtime_hours', type: 'decimal' },
        { name: 'double_time_hours', type: 'decimal' },
        { name: 'total_hours', type: 'decimal', required: true },
        { name: 'pay_rate', type: 'decimal' },
        { name: 'bill_rate', type: 'decimal' },
        { name: 'gross_pay', type: 'decimal' },
        { name: 'gross_bill', type: 'decimal' },
        { name: 'approved_by', type: 'string' },
        { name: 'approved_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'placement' },
      ],
    },
    interview: {
      defaultFields: [
        { name: 'interview_date', type: 'date', required: true },
        { name: 'interview_time', type: 'datetime', required: true },
        { name: 'interview_type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'interviewer', type: 'string' },
        { name: 'feedback', type: 'text' },
        { name: 'rating', type: 'integer' },
        { name: 'next_steps', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'candidate' },
        { type: 'belongsTo', target: 'job_order' },
      ],
    },
  },
};

export default staffingagencyBlueprint;
