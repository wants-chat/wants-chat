import { Blueprint } from './blueprint.interface';

/**
 * Security Guard Blueprint
 */
export const securityguardBlueprint: Blueprint = {
  appType: 'securityguard',
  description: 'Security guard service with officers, assignments, patrols, and incident reports',

  coreEntities: ['officer', 'assignment', 'patrol', 'incident', 'client', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Officers', path: '/officers', icon: 'Shield' },
        { label: 'Assignments', path: '/assignments', icon: 'Calendar' },
        { label: 'Patrols', path: '/patrols', icon: 'Map' },
        { label: 'Incidents', path: '/incidents', icon: 'AlertTriangle' },
        { label: 'Clients', path: '/clients', icon: 'Building' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'todays-assignments', component: 'appointment-list', entity: 'assignment', position: 'main' },
    ]},
    { path: '/officers', name: 'Officers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'officer-grid', component: 'staff-grid', entity: 'officer', position: 'main' },
    ]},
    { path: '/assignments', name: 'Assignments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'assignment-calendar', component: 'appointment-calendar', entity: 'assignment', position: 'main' },
    ]},
    { path: '/patrols', name: 'Patrols', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patrol-table', component: 'data-table', entity: 'patrol', position: 'main' },
    ]},
    { path: '/incidents', name: 'Incidents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'incident-table', component: 'data-table', entity: 'incident', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/officers', entity: 'officer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/officers', entity: 'officer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/assignments', entity: 'assignment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/assignments', entity: 'assignment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/patrols', entity: 'patrol', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/patrols', entity: 'patrol', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/incidents', entity: 'incident', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/incidents', entity: 'incident', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    officer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'badge_number', type: 'string' },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'training_completed', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'availability', type: 'json' },
        { name: 'uniform_size', type: 'string' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'assignment' },
        { type: 'hasMany', target: 'patrol' },
      ],
    },
    assignment: {
      defaultFields: [
        { name: 'assignment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'post_type', type: 'enum' },
        { name: 'location', type: 'json' },
        { name: 'duties', type: 'json' },
        { name: 'equipment_issued', type: 'json' },
        { name: 'check_in_time', type: 'datetime' },
        { name: 'check_out_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'officer' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    patrol: {
      defaultFields: [
        { name: 'patrol_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'route', type: 'json' },
        { name: 'checkpoints', type: 'json' },
        { name: 'observations', type: 'text' },
        { name: 'issues_found', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'officer' },
        { type: 'belongsTo', target: 'assignment' },
      ],
    },
    incident: {
      defaultFields: [
        { name: 'incident_number', type: 'string', required: true },
        { name: 'incident_date', type: 'date', required: true },
        { name: 'incident_time', type: 'datetime', required: true },
        { name: 'incident_type', type: 'enum', required: true },
        { name: 'severity', type: 'enum' },
        { name: 'location', type: 'json' },
        { name: 'description', type: 'text', required: true },
        { name: 'persons_involved', type: 'json' },
        { name: 'witnesses', type: 'json' },
        { name: 'actions_taken', type: 'text' },
        { name: 'police_notified', type: 'boolean' },
        { name: 'police_report_number', type: 'string' },
        { name: 'photos', type: 'json' },
        { name: 'follow_up_required', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'officer' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'site_details', type: 'json' },
        { name: 'contract_start', type: 'date' },
        { name: 'contract_end', type: 'date' },
        { name: 'service_requirements', type: 'json' },
        { name: 'billing_rate', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'assignment' },
        { type: 'hasMany', target: 'incident' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'billing_period', type: 'json' },
        { name: 'line_items', type: 'json' },
        { name: 'regular_hours', type: 'decimal' },
        { name: 'overtime_hours', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default securityguardBlueprint;
