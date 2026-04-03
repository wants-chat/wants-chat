import { Blueprint } from './blueprint.interface';

/**
 * Pest Control Company Blueprint
 */
export const pestcontrolBlueprint: Blueprint = {
  appType: 'pestcontrol',
  description: 'Pest control app with service calls, treatments, recurring plans, and customer management',

  coreEntities: ['service_call', 'treatment', 'customer', 'property', 'technician', 'plan'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Service Calls', path: '/calls', icon: 'Phone' },
        { label: 'Properties', path: '/properties', icon: 'Home' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
        { label: 'Plans', path: '/plans', icon: 'RefreshCw' },
        { label: 'Treatments', path: '/treatments', icon: 'Bug' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-calls', component: 'appointment-list', entity: 'service_call', position: 'main' },
    ]},
    { path: '/calls', name: 'Service Calls', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'call-calendar', component: 'appointment-calendar', entity: 'service_call', position: 'main' },
      { id: 'call-table', component: 'data-table', entity: 'service_call', position: 'main' },
    ]},
    { path: '/properties', name: 'Properties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'property-table', component: 'data-table', entity: 'property', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/plans', name: 'Service Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plan-table', component: 'data-table', entity: 'plan', position: 'main' },
    ]},
    { path: '/treatments', name: 'Treatment Types', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'treatment-table', component: 'data-table', entity: 'treatment', position: 'main' },
    ]},
    { path: '/book', name: 'Schedule Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'service_call', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/calls', entity: 'service_call', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/calls', entity: 'service_call', operation: 'create' },
    { method: 'GET', path: '/properties', entity: 'property', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/plans', entity: 'plan', operation: 'list' },
    { method: 'GET', path: '/treatments', entity: 'treatment', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    service_call: {
      defaultFields: [
        { name: 'call_number', type: 'string', required: true },
        { name: 'service_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'pest_types', type: 'json' },
        { name: 'infestation_level', type: 'enum' },
        { name: 'problem_description', type: 'text' },
        { name: 'areas_treated', type: 'json' },
        { name: 'products_used', type: 'json' },
        { name: 'follow_up_required', type: 'boolean' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'technician_notes', type: 'text' },
        { name: 'customer_signature', type: 'string' },
        { name: 'photos', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'property' },
        { type: 'belongsTo', target: 'technician' },
        { type: 'belongsTo', target: 'plan' },
      ],
    },
    property: {
      defaultFields: [
        { name: 'address', type: 'json', required: true },
        { name: 'property_type', type: 'enum', required: true },
        { name: 'square_footage', type: 'decimal' },
        { name: 'year_built', type: 'integer' },
        { name: 'construction_type', type: 'enum' },
        { name: 'pest_history', type: 'json' },
        { name: 'entry_points', type: 'json' },
        { name: 'treatment_zones', type: 'json' },
        { name: 'access_instructions', type: 'text' },
        { name: 'pets', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'service_call' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_method', type: 'json' },
        { name: 'preferred_contact', type: 'enum' },
        { name: 'total_services', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'property' },
        { type: 'hasOne', target: 'plan' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'specializations', type: 'json' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
      ],
    },
    plan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'plan_type', type: 'enum', required: true },
        { name: 'frequency', type: 'enum', required: true },
        { name: 'services_included', type: 'json' },
        { name: 'pests_covered', type: 'json' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'annual_price', type: 'decimal' },
        { name: 'start_date', type: 'date' },
        { name: 'renewal_date', type: 'date' },
        { name: 'terms', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    treatment: {
      defaultFields: [
        { name: 'treatment_name', type: 'string', required: true },
        { name: 'treatment_type', type: 'enum', required: true },
        { name: 'target_pests', type: 'json' },
        { name: 'products', type: 'json' },
        { name: 'application_method', type: 'text' },
        { name: 'safety_precautions', type: 'text' },
        { name: 'reentry_time', type: 'string' },
        { name: 'price', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default pestcontrolBlueprint;
