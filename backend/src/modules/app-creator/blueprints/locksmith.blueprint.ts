import { Blueprint } from './blueprint.interface';

/**
 * Locksmith Service Blueprint
 */
export const locksmithBlueprint: Blueprint = {
  appType: 'locksmith',
  description: 'Locksmith app with service calls, key cutting, lock installations, and emergency services',

  coreEntities: ['service_call', 'customer', 'technician', 'invoice', 'key_record', 'inventory'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Service Calls', path: '/calls', icon: 'Phone' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
        { label: 'Key Records', path: '/keys', icon: 'Key' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-calls', component: 'appointment-list', entity: 'service_call', position: 'main' },
    ]},
    { path: '/calls', name: 'Service Calls', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'call-map', component: 'tracking-map', entity: 'service_call', position: 'main' },
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
    { path: '/keys', name: 'Key Records', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'key-table', component: 'data-table', entity: 'key_record', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'data-table', entity: 'inventory', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/emergency', name: 'Emergency Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'emergency-form', component: 'booking-wizard', entity: 'service_call', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/calls', entity: 'service_call', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/calls', entity: 'service_call', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/keys', entity: 'key_record', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    service_call: {
      defaultFields: [
        { name: 'call_number', type: 'string', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'location', type: 'json', required: true },
        { name: 'requested_time', type: 'datetime' },
        { name: 'arrival_time', type: 'datetime' },
        { name: 'completion_time', type: 'datetime' },
        { name: 'lock_type', type: 'enum' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'problem_description', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_time', type: 'decimal' },
        { name: 'total_charge', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'customer_type', type: 'enum', required: true },
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'addresses', type: 'json' },
        { name: 'id_on_file', type: 'boolean' },
        { name: 'total_services', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
        { type: 'hasMany', target: 'key_record' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'license_number', type: 'string' },
        { name: 'certifications', type: 'json' },
        { name: 'specializations', type: 'json' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'current_location', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'is_on_call', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
      ],
    },
    key_record: {
      defaultFields: [
        { name: 'record_date', type: 'date', required: true },
        { name: 'key_type', type: 'enum', required: true },
        { name: 'lock_brand', type: 'string' },
        { name: 'key_code', type: 'string' },
        { name: 'bitting', type: 'string' },
        { name: 'quantity_made', type: 'integer' },
        { name: 'property_address', type: 'json' },
        { name: 'authorization', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'service_call' },
      ],
    },
    inventory: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'sku', type: 'string' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'reorder_level', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'price', type: 'decimal' },
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
        { name: 'labor_charges', type: 'decimal' },
        { name: 'parts_charges', type: 'decimal' },
        { name: 'emergency_fee', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'service_call' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default locksmithBlueprint;
