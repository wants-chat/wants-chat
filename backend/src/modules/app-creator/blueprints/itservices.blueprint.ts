import { Blueprint } from './blueprint.interface';

/**
 * IT Services Blueprint
 */
export const itservicesBlueprint: Blueprint = {
  appType: 'itservices',
  description: 'IT services/MSP app with tickets, assets, contracts, and monitoring',

  coreEntities: ['ticket', 'asset', 'contract', 'client', 'technician', 'alert'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
        { label: 'Assets', path: '/assets', icon: 'Server' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
        { label: 'Clients', path: '/clients', icon: 'Building' },
        { label: 'Technicians', path: '/technicians', icon: 'Wrench' },
        { label: 'Alerts', path: '/alerts', icon: 'Bell' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'open-tickets', component: 'data-table', entity: 'ticket', position: 'main' },
    ]},
    { path: '/tickets', name: 'Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-board', component: 'kanban-board', entity: 'ticket', position: 'main' },
    ]},
    { path: '/assets', name: 'Assets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'asset-table', component: 'data-table', entity: 'asset', position: 'main' },
    ]},
    { path: '/contracts', name: 'Contracts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'contract-table', component: 'data-table', entity: 'contract', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/alerts', name: 'Alerts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'alert-table', component: 'data-table', entity: 'alert', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'ticket', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/assets', entity: 'asset', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/assets', entity: 'asset', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/contracts', entity: 'contract', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/contracts', entity: 'contract', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/alerts', entity: 'alert', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'subject', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'reported_by', type: 'string' },
        { name: 'contact_email', type: 'email' },
        { name: 'contact_phone', type: 'phone' },
        { name: 'resolution', type: 'text' },
        { name: 'time_spent', type: 'decimal' },
        { name: 'remote_session', type: 'boolean' },
        { name: 'on_site', type: 'boolean' },
        { name: 'due_date', type: 'date' },
        { name: 'closed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'asset' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    asset: {
      defaultFields: [
        { name: 'asset_name', type: 'string', required: true },
        { name: 'asset_type', type: 'enum', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'ip_address', type: 'string' },
        { name: 'mac_address', type: 'string' },
        { name: 'operating_system', type: 'string' },
        { name: 'specifications', type: 'json' },
        { name: 'purchase_date', type: 'date' },
        { name: 'warranty_expiry', type: 'date' },
        { name: 'location', type: 'string' },
        { name: 'assigned_user', type: 'string' },
        { name: 'last_seen', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'ticket' },
      ],
    },
    contract: {
      defaultFields: [
        { name: 'contract_number', type: 'string', required: true },
        { name: 'contract_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'monthly_fee', type: 'decimal' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'included_hours', type: 'decimal' },
        { name: 'sla_response', type: 'string' },
        { name: 'sla_resolution', type: 'string' },
        { name: 'services_included', type: 'json' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
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
        { name: 'industry', type: 'string' },
        { name: 'employee_count', type: 'integer' },
        { name: 'primary_contact', type: 'json' },
        { name: 'technical_contact', type: 'json' },
        { name: 'billing_contact', type: 'json' },
        { name: 'portal_access', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'asset' },
        { type: 'hasMany', target: 'ticket' },
        { type: 'hasMany', target: 'contract' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specialties', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'remote_tools', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'ticket' },
      ],
    },
    alert: {
      defaultFields: [
        { name: 'alert_type', type: 'enum', required: true },
        { name: 'severity', type: 'enum', required: true },
        { name: 'source', type: 'string' },
        { name: 'message', type: 'text', required: true },
        { name: 'triggered_at', type: 'datetime', required: true },
        { name: 'acknowledged_at', type: 'datetime' },
        { name: 'resolved_at', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'asset' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default itservicesBlueprint;
