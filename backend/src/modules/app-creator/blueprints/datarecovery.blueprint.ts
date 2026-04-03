import { Blueprint } from './blueprint.interface';

/**
 * Data Recovery Blueprint
 */
export const datarecoveryBlueprint: Blueprint = {
  appType: 'datarecovery',
  description: 'Data recovery service app with cases, devices, diagnostics, and quotes',

  coreEntities: ['case', 'device', 'diagnostic', 'quote', 'technician', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Cases', path: '/cases', icon: 'FolderOpen' },
        { label: 'Devices', path: '/devices', icon: 'HardDrive' },
        { label: 'Diagnostics', path: '/diagnostics', icon: 'Search' },
        { label: 'Quotes', path: '/quotes', icon: 'FileText' },
        { label: 'Technicians', path: '/technicians', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-cases', component: 'kanban-board', entity: 'case', position: 'main' },
    ]},
    { path: '/cases', name: 'Cases', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'case-board', component: 'kanban-board', entity: 'case', position: 'main' },
    ]},
    { path: '/devices', name: 'Devices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'device-table', component: 'data-table', entity: 'device', position: 'main' },
    ]},
    { path: '/diagnostics', name: 'Diagnostics', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'diagnostic-table', component: 'data-table', entity: 'diagnostic', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'data-table', entity: 'quote', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/cases', entity: 'case', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/cases', entity: 'case', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/devices', entity: 'device', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/devices', entity: 'device', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/diagnostics', entity: 'diagnostic', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/diagnostics', entity: 'diagnostic', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    case: {
      defaultFields: [
        { name: 'case_number', type: 'string', required: true },
        { name: 'case_type', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'data_importance', type: 'enum' },
        { name: 'deadline', type: 'date' },
        { name: 'recovery_percentage', type: 'integer' },
        { name: 'files_recovered', type: 'integer' },
        { name: 'data_size_recovered', type: 'string' },
        { name: 'delivery_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
        { type: 'hasOne', target: 'device' },
        { type: 'hasOne', target: 'diagnostic' },
        { type: 'hasOne', target: 'quote' },
      ],
    },
    device: {
      defaultFields: [
        { name: 'device_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'capacity', type: 'string' },
        { name: 'interface', type: 'string' },
        { name: 'failure_type', type: 'enum' },
        { name: 'failure_symptoms', type: 'text' },
        { name: 'physical_damage', type: 'boolean' },
        { name: 'damage_description', type: 'text' },
        { name: 'previous_attempts', type: 'boolean' },
        { name: 'previous_attempt_details', type: 'text' },
        { name: 'intake_photos', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
      ],
    },
    diagnostic: {
      defaultFields: [
        { name: 'diagnostic_date', type: 'date', required: true },
        { name: 'smart_status', type: 'json' },
        { name: 'head_status', type: 'string' },
        { name: 'platter_status', type: 'string' },
        { name: 'pcb_status', type: 'string' },
        { name: 'firmware_status', type: 'string' },
        { name: 'data_accessibility', type: 'decimal' },
        { name: 'recovery_prognosis', type: 'enum' },
        { name: 'recommended_approach', type: 'text' },
        { name: 'cleanroom_required', type: 'boolean' },
        { name: 'parts_needed', type: 'json' },
        { name: 'estimated_time', type: 'string' },
        { name: 'findings', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'quote_date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'line_items', type: 'json' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'rush_fee', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_required', type: 'decimal' },
        { name: 'no_data_no_fee', type: 'boolean' },
        { name: 'terms', type: 'text' },
        { name: 'approved', type: 'boolean' },
        { name: 'approved_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
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
        { name: 'cleanroom_certified', type: 'boolean' },
        { name: 'cases_completed', type: 'integer' },
        { name: 'success_rate', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'case' },
        { type: 'hasMany', target: 'diagnostic' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'customer_type', type: 'enum', required: true },
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'referral_source', type: 'string' },
        { name: 'case_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'case' },
      ],
    },
  },
};

export default datarecoveryBlueprint;
