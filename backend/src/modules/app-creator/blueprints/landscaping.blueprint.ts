import { Blueprint } from './blueprint.interface';

/**
 * Landscaping / Lawn Care Company Blueprint
 */
export const landscapingBlueprint: Blueprint = {
  appType: 'landscaping',
  description: 'Landscaping app with service routes, estimates, crews, and recurring maintenance',

  coreEntities: ['property', 'service', 'customer', 'crew', 'estimate', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Route Map', path: '/routes', icon: 'Map' },
        { label: 'Properties', path: '/properties', icon: 'Home' },
        { label: 'Services', path: '/services', icon: 'Leaf' },
        { label: 'Crews', path: '/crews', icon: 'Users' },
        { label: 'Estimates', path: '/estimates', icon: 'Calculator' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-route', component: 'route-list', entity: 'service', position: 'main' },
    ]},
    { path: '/routes', name: 'Route Map', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'route-map', component: 'tracking-map', entity: 'service', position: 'main' },
    ]},
    { path: '/properties', name: 'Properties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'property-table', component: 'data-table', entity: 'property', position: 'main' },
    ]},
    { path: '/properties/:id', name: 'Property Details', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'property-profile', component: 'property-details', entity: 'property', position: 'main' },
      { id: 'service-history', component: 'data-list', entity: 'service', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-calendar', component: 'appointment-calendar', entity: 'service', position: 'main' },
      { id: 'service-table', component: 'data-table', entity: 'service', position: 'main' },
    ]},
    { path: '/crews', name: 'Crews', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'crew-grid', component: 'staff-grid', entity: 'crew', position: 'main' },
    ]},
    { path: '/estimates', name: 'Estimates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-table', component: 'data-table', entity: 'estimate', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/quote', name: 'Get Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'estimate', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/properties', entity: 'property', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/properties', entity: 'property', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/services', entity: 'service', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/crews', entity: 'crew', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/estimates', entity: 'estimate', operation: 'create' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    property: {
      defaultFields: [
        { name: 'address', type: 'json', required: true },
        { name: 'property_type', type: 'enum', required: true },
        { name: 'lot_size', type: 'decimal' },
        { name: 'lawn_area', type: 'decimal' },
        { name: 'features', type: 'json' },
        { name: 'irrigation_type', type: 'enum' },
        { name: 'gate_code', type: 'string' },
        { name: 'access_notes', type: 'text' },
        { name: 'service_schedule', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'service' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'service_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'services_performed', type: 'json' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'materials_used', type: 'json' },
        { name: 'before_photos', type: 'json' },
        { name: 'after_photos', type: 'json' },
        { name: 'weather_conditions', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'is_recurring', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'property' },
        { type: 'belongsTo', target: 'crew' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'billing_address', type: 'json' },
        { name: 'preferred_contact', type: 'enum' },
        { name: 'payment_method', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'property' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    crew: {
      defaultFields: [
        { name: 'crew_name', type: 'string', required: true },
        { name: 'crew_lead', type: 'string', required: true },
        { name: 'members', type: 'json' },
        { name: 'phone', type: 'phone' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'equipment', type: 'json' },
        { name: 'service_area', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'frequency', type: 'enum' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'monthly_rate', type: 'decimal' },
        { name: 'seasonal_rate', type: 'decimal' },
        { name: 'valid_until', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'property' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'billing_period', type: 'json' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default landscapingBlueprint;
