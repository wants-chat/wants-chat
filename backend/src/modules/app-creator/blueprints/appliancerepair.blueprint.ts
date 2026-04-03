import { Blueprint } from './blueprint.interface';

/**
 * Appliance Repair Service Blueprint
 */
export const appliancerepairBlueprint: Blueprint = {
  appType: 'appliancerepair',
  description: 'Appliance repair app with service calls, diagnostics, parts, and warranties',

  coreEntities: ['service_call', 'customer', 'technician', 'appliance', 'part', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Service Calls', path: '/calls', icon: 'Phone' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
        { label: 'Appliances', path: '/appliances', icon: 'Refrigerator' },
        { label: 'Parts', path: '/parts', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-calls', component: 'appointment-list', entity: 'service_call', position: 'main' },
    ]},
    { path: '/calls', name: 'Service Calls', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'call-calendar', component: 'appointment-calendar', entity: 'service_call', position: 'main' },
      { id: 'call-table', component: 'data-table', entity: 'service_call', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/appliances', name: 'Appliances', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appliance-table', component: 'data-table', entity: 'appliance', position: 'main' },
    ]},
    { path: '/parts', name: 'Parts Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'part-table', component: 'data-table', entity: 'part', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/request', name: 'Request Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'request-form', component: 'booking-wizard', entity: 'service_call', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/calls', entity: 'service_call', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/calls', entity: 'service_call', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/appliances', entity: 'appliance', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/parts', entity: 'part', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    service_call: {
      defaultFields: [
        { name: 'call_number', type: 'string', required: true },
        { name: 'call_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'arrival_time', type: 'datetime' },
        { name: 'completion_time', type: 'datetime' },
        { name: 'call_type', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'location', type: 'json', required: true },
        { name: 'problem_description', type: 'text' },
        { name: 'diagnosis', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'photos', type: 'json' },
        { name: 'customer_signature', type: 'string' },
        { name: 'warranty_claim', type: 'boolean' },
        { name: 'total', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
        { type: 'belongsTo', target: 'appliance' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'addresses', type: 'json' },
        { name: 'preferred_contact', type: 'enum' },
        { name: 'total_services', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
        { type: 'hasMany', target: 'appliance' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'brands_certified', type: 'json' },
        { name: 'appliance_types', type: 'json' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'current_location', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
      ],
    },
    appliance: {
      defaultFields: [
        { name: 'appliance_type', type: 'enum', required: true },
        { name: 'brand', type: 'string', required: true },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'purchase_date', type: 'date' },
        { name: 'warranty_expiry', type: 'date' },
        { name: 'location_in_home', type: 'string' },
        { name: 'service_history', type: 'json' },
        { name: 'last_service_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'service_call' },
      ],
    },
    part: {
      defaultFields: [
        { name: 'part_name', type: 'string', required: true },
        { name: 'part_number', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'compatible_brands', type: 'json' },
        { name: 'compatible_models', type: 'json' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'reorder_level', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'price', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'parts_charges', type: 'decimal' },
        { name: 'labor_charges', type: 'decimal' },
        { name: 'diagnostic_fee', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'warranty_coverage', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'service_call' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default appliancerepairBlueprint;
