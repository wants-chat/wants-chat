import { Blueprint } from './blueprint.interface';

/**
 * Alarm System Blueprint
 */
export const alarmsystemBlueprint: Blueprint = {
  appType: 'alarmsystem',
  description: 'Alarm monitoring service with customers, systems, alerts, and service calls',

  coreEntities: ['customer', 'system', 'alert', 'servicecall', 'technician', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Systems', path: '/systems', icon: 'Shield' },
        { label: 'Alerts', path: '/alerts', icon: 'Bell' },
        { label: 'Service Calls', path: '/servicecalls', icon: 'Wrench' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-alerts', component: 'appointment-list', entity: 'alert', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/systems', name: 'Systems', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'system-table', component: 'data-table', entity: 'system', position: 'main' },
    ]},
    { path: '/alerts', name: 'Alerts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'alert-table', component: 'data-table', entity: 'alert', position: 'main' },
    ]},
    { path: '/servicecalls', name: 'Service Calls', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'servicecall-calendar', component: 'appointment-calendar', entity: 'servicecall', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/quote', name: 'Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'customer', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/customers', entity: 'customer', operation: 'create' },
    { method: 'GET', path: '/systems', entity: 'system', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/alerts', entity: 'alert', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/alerts', entity: 'alert', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/servicecalls', entity: 'servicecall', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/servicecalls', entity: 'servicecall', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json', required: true },
        { name: 'property_type', type: 'enum' },
        { name: 'emergency_contacts', type: 'json' },
        { name: 'passcode', type: 'string' },
        { name: 'verbal_password', type: 'string' },
        { name: 'permit_number', type: 'string' },
        { name: 'contract_start', type: 'date' },
        { name: 'monthly_rate', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'system' },
        { type: 'hasMany', target: 'alert' },
      ],
    },
    system: {
      defaultFields: [
        { name: 'system_id', type: 'string', required: true },
        { name: 'system_type', type: 'enum', required: true },
        { name: 'panel_model', type: 'string' },
        { name: 'installation_date', type: 'date' },
        { name: 'zones', type: 'json' },
        { name: 'sensors', type: 'json' },
        { name: 'cameras', type: 'json' },
        { name: 'connection_type', type: 'enum' },
        { name: 'monitoring_center', type: 'string' },
        { name: 'last_test_date', type: 'date' },
        { name: 'firmware_version', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'alert' },
      ],
    },
    alert: {
      defaultFields: [
        { name: 'alert_id', type: 'string', required: true },
        { name: 'alert_date', type: 'date', required: true },
        { name: 'alert_time', type: 'datetime', required: true },
        { name: 'alert_type', type: 'enum', required: true },
        { name: 'zone', type: 'string' },
        { name: 'priority', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'customer_contacted', type: 'boolean' },
        { name: 'authorities_dispatched', type: 'boolean' },
        { name: 'resolution', type: 'text' },
        { name: 'resolved_by', type: 'string' },
        { name: 'resolved_time', type: 'datetime' },
        { name: 'false_alarm', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'system' },
      ],
    },
    servicecall: {
      defaultFields: [
        { name: 'service_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'issue_description', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'customer_signature', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'system' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'service_area', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'servicecall' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'invoice_type', type: 'enum' },
        { name: 'line_items', type: 'json' },
        { name: 'monitoring_fee', type: 'decimal' },
        { name: 'service_charges', type: 'decimal' },
        { name: 'equipment_charges', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default alarmsystemBlueprint;
