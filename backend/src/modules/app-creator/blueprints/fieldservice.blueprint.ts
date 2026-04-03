import { Blueprint } from './blueprint.interface';

/**
 * Field Service Blueprint
 */
export const fieldserviceBlueprint: Blueprint = {
  appType: 'fieldservice',
  description: 'Field service management app with work orders, technicians, scheduling, and dispatch',

  coreEntities: ['work_order', 'technician', 'customer', 'asset', 'schedule', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Work Orders', path: '/workorders', icon: 'ClipboardList' },
        { label: 'Technicians', path: '/technicians', icon: 'Users' },
        { label: 'Customers', path: '/customers', icon: 'Building' },
        { label: 'Assets', path: '/assets', icon: 'Settings' },
        { label: 'Schedule', path: '/schedule', icon: 'Calendar' },
        { label: 'Invoices', path: '/invoices', icon: 'FileText' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'dispatch-board', component: 'kanban-board', entity: 'work_order', position: 'main' },
    ]},
    { path: '/workorders', name: 'Work Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'work_order', position: 'main' },
      { id: 'workorder-board', component: 'kanban-board', entity: 'work_order', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/assets', name: 'Assets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'asset-table', component: 'data-table', entity: 'asset', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'schedule-calendar', component: 'appointment-calendar', entity: 'schedule', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/request-service', name: 'Request Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'service-form', component: 'booking-wizard', entity: 'work_order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/workorders', entity: 'work_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/workorders', entity: 'work_order', operation: 'create' },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/customers', entity: 'customer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/assets', entity: 'asset', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/assets', entity: 'asset', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/schedule', entity: 'schedule', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    work_order: {
      defaultFields: [
        { name: 'work_order_number', type: 'string', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'work_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'reported_issue', type: 'text' },
        { name: 'scheduled_date', type: 'date' },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'estimated_duration', type: 'integer' },
        { name: 'actual_duration', type: 'integer' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'resolution', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'signature_url', type: 'string' },
        { name: 'completed_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
        { type: 'belongsTo', target: 'asset' },
        { type: 'hasOne', target: 'invoice' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'employee_id', type: 'string' },
        { name: 'skills', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'service_area', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'work_order' },
        { type: 'hasMany', target: 'schedule' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'customer_number', type: 'string', required: true },
        { name: 'customer_type', type: 'enum' },
        { name: 'company_name', type: 'string' },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'service_address', type: 'json', required: true },
        { name: 'billing_address', type: 'json' },
        { name: 'preferred_technician', type: 'string' },
        { name: 'service_contract', type: 'boolean' },
        { name: 'payment_terms', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'work_order' },
        { type: 'hasMany', target: 'asset' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    asset: {
      defaultFields: [
        { name: 'asset_tag', type: 'string', required: true },
        { name: 'asset_name', type: 'string', required: true },
        { name: 'asset_type', type: 'enum', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'install_date', type: 'date' },
        { name: 'warranty_expiry', type: 'date' },
        { name: 'location', type: 'string' },
        { name: 'specifications', type: 'json' },
        { name: 'maintenance_schedule', type: 'json' },
        { name: 'last_service_date', type: 'date' },
        { name: 'condition', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'work_order' },
      ],
    },
    schedule: {
      defaultFields: [
        { name: 'schedule_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'schedule_type', type: 'enum' },
        { name: 'customer_name', type: 'string' },
        { name: 'address', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'technician' },
        { type: 'belongsTo', target: 'work_order' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'labor_charges', type: 'decimal' },
        { name: 'parts_charges', type: 'decimal' },
        { name: 'trip_charge', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'work_order' },
      ],
    },
  },
};

export default fieldserviceBlueprint;
