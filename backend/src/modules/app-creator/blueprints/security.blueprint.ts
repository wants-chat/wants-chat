import { Blueprint } from './blueprint.interface';

/**
 * Security Company Blueprint
 */
export const securityBlueprint: Blueprint = {
  appType: 'security',
  description: 'Security company with guard management, patrols, incidents, and client contracts',

  coreEntities: ['guard', 'client', 'site', 'patrol', 'incident', 'schedule'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Guards', path: '/guards', icon: 'Shield' },
        { label: 'Sites', path: '/sites', icon: 'Building' },
        { label: 'Patrols', path: '/patrols', icon: 'Route' },
        { label: 'Incidents', path: '/incidents', icon: 'AlertTriangle' },
        { label: 'Schedules', path: '/schedules', icon: 'Calendar' },
        { label: 'Clients', path: '/clients', icon: 'Building2' },
      ]}},
      { id: 'security-stats', component: 'security-stats', position: 'main' },
      { id: 'active-guards', component: 'guard-list-active', entity: 'guard', position: 'main' },
      { id: 'recent-incidents', component: 'incident-list-recent', entity: 'incident', position: 'main' },
    ]},
    { path: '/guards', name: 'Guards', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guard-filters', component: 'guard-filters', entity: 'guard', position: 'main' },
      { id: 'guard-table', component: 'guard-table', entity: 'guard', position: 'main' },
    ]},
    { path: '/guards/:id', name: 'Guard Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guard-profile', component: 'guard-profile', entity: 'guard', position: 'main' },
      { id: 'guard-schedule', component: 'guard-schedule', entity: 'schedule', position: 'main' },
      { id: 'guard-incidents', component: 'guard-incidents', entity: 'incident', position: 'main' },
    ]},
    { path: '/guards/new', name: 'New Guard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guard-form', component: 'guard-form', entity: 'guard', position: 'main' },
    ]},
    { path: '/sites', name: 'Sites', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'site-grid', component: 'site-grid', entity: 'site', position: 'main' },
    ]},
    { path: '/sites/:id', name: 'Site Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'site-header', component: 'site-header', entity: 'site', position: 'main' },
      { id: 'site-map', component: 'site-patrol-map', entity: 'patrol', position: 'main' },
      { id: 'site-schedule', component: 'site-schedule', entity: 'schedule', position: 'main' },
    ]},
    { path: '/patrols', name: 'Patrols', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patrol-live', component: 'patrol-live-view', entity: 'patrol', position: 'main' },
      { id: 'patrol-history', component: 'patrol-history', entity: 'patrol', position: 'main' },
    ]},
    { path: '/patrols/:id', name: 'Patrol Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patrol-detail', component: 'patrol-detail', entity: 'patrol', position: 'main' },
    ]},
    { path: '/incidents', name: 'Incidents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'incident-filters', component: 'incident-filters', entity: 'incident', position: 'main' },
      { id: 'incident-table', component: 'incident-table', entity: 'incident', position: 'main' },
    ]},
    { path: '/incidents/:id', name: 'Incident Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'incident-detail', component: 'incident-detail', entity: 'incident', position: 'main' },
    ]},
    { path: '/incidents/new', name: 'Report Incident', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'incident-form', component: 'incident-form', entity: 'incident', position: 'main' },
    ]},
    { path: '/schedules', name: 'Schedules', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'schedule-calendar', component: 'schedule-calendar-security', entity: 'schedule', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-security', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-security', entity: 'client', position: 'main' },
      { id: 'client-sites', component: 'client-sites', entity: 'site', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/guards', entity: 'guard', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/guards', entity: 'guard', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/sites', entity: 'site', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patrols', entity: 'patrol', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/patrols', entity: 'patrol', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/incidents', entity: 'incident', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/incidents', entity: 'incident', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/schedules', entity: 'schedule', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    guard: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'photo_url', type: 'image' },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'skills', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'emergency_contact', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'patrol' },
        { type: 'hasMany', target: 'incident' },
        { type: 'hasMany', target: 'schedule' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'contact_email', type: 'email', required: true },
        { name: 'contact_phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'contract_start', type: 'date' },
        { name: 'contract_end', type: 'date' },
        { name: 'monthly_fee', type: 'decimal' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'site' }],
    },
    site: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'coordinates', type: 'json' },
        { name: 'contact_name', type: 'string' },
        { name: 'contact_phone', type: 'phone' },
        { name: 'access_instructions', type: 'text' },
        { name: 'patrol_checkpoints', type: 'json' },
        { name: 'required_guards', type: 'integer' },
        { name: 'special_instructions', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'patrol' },
        { type: 'hasMany', target: 'incident' },
        { type: 'hasMany', target: 'schedule' },
      ],
    },
    patrol: {
      defaultFields: [
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
        { name: 'checkpoints', type: 'json' },
        { name: 'route', type: 'json' },
        { name: 'observations', type: 'text' },
        { name: 'photos', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'guard' },
        { type: 'belongsTo', target: 'site' },
      ],
    },
    incident: {
      defaultFields: [
        { name: 'incident_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'severity', type: 'enum', required: true },
        { name: 'occurred_at', type: 'datetime', required: true },
        { name: 'reported_at', type: 'datetime', required: true },
        { name: 'location', type: 'string' },
        { name: 'description', type: 'text', required: true },
        { name: 'action_taken', type: 'text' },
        { name: 'witnesses', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'police_report', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'guard' },
        { type: 'belongsTo', target: 'site' },
      ],
    },
    schedule: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'check_in_time', type: 'datetime' },
        { name: 'check_out_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'guard' },
        { type: 'belongsTo', target: 'site' },
      ],
    },
  },
};

export default securityBlueprint;
