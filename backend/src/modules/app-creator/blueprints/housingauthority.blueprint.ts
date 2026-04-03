import { Blueprint } from './blueprint.interface';

/**
 * Housing Authority Blueprint
 */
export const housingauthorityBlueprint: Blueprint = {
  appType: 'housingauthority',
  description: 'Housing authority app with properties, tenants, applications, and maintenance',

  coreEntities: ['property', 'unit', 'tenant', 'application', 'maintenance', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Properties', path: '/properties', icon: 'Building' },
        { label: 'Units', path: '/units', icon: 'Home' },
        { label: 'Tenants', path: '/tenants', icon: 'Users' },
        { label: 'Applications', path: '/applications', icon: 'FileText' },
        { label: 'Maintenance', path: '/maintenance', icon: 'Wrench' },
        { label: 'Payments', path: '/payments', icon: 'CreditCard' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-applications', component: 'data-table', entity: 'application', position: 'main' },
    ]},
    { path: '/properties', name: 'Properties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'property-grid', component: 'product-grid', entity: 'property', position: 'main' },
    ]},
    { path: '/units', name: 'Units', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'unit', position: 'main' },
      { id: 'unit-table', component: 'data-table', entity: 'unit', position: 'main' },
    ]},
    { path: '/tenants', name: 'Tenants', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'tenant-table', component: 'data-table', entity: 'tenant', position: 'main' },
    ]},
    { path: '/applications', name: 'Applications', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'application-board', component: 'kanban-board', entity: 'application', position: 'main' },
    ]},
    { path: '/maintenance', name: 'Maintenance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'maintenance-board', component: 'kanban-board', entity: 'maintenance', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'data-table', entity: 'payment', position: 'main' },
    ]},
    { path: '/apply', name: 'Apply for Housing', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'application-form', component: 'booking-wizard', entity: 'application', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/properties', entity: 'property', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/units', entity: 'unit', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tenants', entity: 'tenant', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tenants', entity: 'tenant', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/applications', entity: 'application', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/applications', entity: 'application', operation: 'create' },
    { method: 'GET', path: '/maintenance', entity: 'maintenance', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/maintenance', entity: 'maintenance', operation: 'create' },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    property: {
      defaultFields: [
        { name: 'property_name', type: 'string', required: true },
        { name: 'property_type', type: 'enum', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'year_built', type: 'integer' },
        { name: 'total_units', type: 'integer' },
        { name: 'occupied_units', type: 'integer' },
        { name: 'amenities', type: 'json' },
        { name: 'property_manager', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'unit' },
      ],
    },
    unit: {
      defaultFields: [
        { name: 'unit_number', type: 'string', required: true },
        { name: 'unit_type', type: 'enum', required: true },
        { name: 'bedrooms', type: 'integer', required: true },
        { name: 'bathrooms', type: 'decimal' },
        { name: 'square_feet', type: 'integer' },
        { name: 'floor', type: 'integer' },
        { name: 'rent_amount', type: 'decimal', required: true },
        { name: 'subsidy_type', type: 'enum' },
        { name: 'accessibility_features', type: 'json' },
        { name: 'appliances', type: 'json' },
        { name: 'last_inspection', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'property' },
        { type: 'hasOne', target: 'tenant' },
        { type: 'hasMany', target: 'maintenance' },
      ],
    },
    tenant: {
      defaultFields: [
        { name: 'tenant_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'household_size', type: 'integer' },
        { name: 'household_members', type: 'json' },
        { name: 'annual_income', type: 'decimal' },
        { name: 'income_sources', type: 'json' },
        { name: 'lease_start', type: 'date' },
        { name: 'lease_end', type: 'date' },
        { name: 'rent_amount', type: 'decimal' },
        { name: 'subsidy_amount', type: 'decimal' },
        { name: 'tenant_portion', type: 'decimal' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'unit' },
        { type: 'hasMany', target: 'payment' },
        { type: 'hasMany', target: 'maintenance' },
      ],
    },
    application: {
      defaultFields: [
        { name: 'application_number', type: 'string', required: true },
        { name: 'application_date', type: 'date', required: true },
        { name: 'applicant_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'current_address', type: 'json' },
        { name: 'household_size', type: 'integer', required: true },
        { name: 'household_members', type: 'json' },
        { name: 'annual_income', type: 'decimal' },
        { name: 'income_sources', type: 'json' },
        { name: 'preferred_location', type: 'string' },
        { name: 'bedrooms_needed', type: 'integer' },
        { name: 'accessibility_needs', type: 'json' },
        { name: 'documents', type: 'json' },
        { name: 'waitlist_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    maintenance: {
      defaultFields: [
        { name: 'request_number', type: 'string', required: true },
        { name: 'request_date', type: 'date', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'reported_by', type: 'string' },
        { name: 'contact_phone', type: 'phone' },
        { name: 'permission_to_enter', type: 'boolean' },
        { name: 'assigned_to', type: 'string' },
        { name: 'scheduled_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'unit' },
        { type: 'belongsTo', target: 'tenant' },
      ],
    },
    payment: {
      defaultFields: [
        { name: 'payment_number', type: 'string', required: true },
        { name: 'payment_date', type: 'date', required: true },
        { name: 'payment_type', type: 'enum', required: true },
        { name: 'period_month', type: 'string' },
        { name: 'rent_amount', type: 'decimal' },
        { name: 'subsidy_amount', type: 'decimal' },
        { name: 'tenant_portion', type: 'decimal' },
        { name: 'amount_paid', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'late_fee', type: 'decimal' },
        { name: 'balance', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'tenant' },
      ],
    },
  },
};

export default housingauthorityBlueprint;
