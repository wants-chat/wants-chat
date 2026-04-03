import { Blueprint } from './blueprint.interface';

/**
 * Limousine / Chauffeur Service Blueprint
 */
export const limoBlueprint: Blueprint = {
  appType: 'limo',
  description: 'Limousine service app with bookings, fleet management, chauffeurs, and packages',

  coreEntities: ['booking', 'vehicle', 'chauffeur', 'customer', 'package', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Fleet', path: '/fleet', icon: 'Car' },
        { label: 'Chauffeurs', path: '/chauffeurs', icon: 'UserCheck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Packages', path: '/packages', icon: 'Gift' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/fleet', name: 'Fleet', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-grid', component: 'data-table', entity: 'vehicle', position: 'main' },
    ]},
    { path: '/chauffeurs', name: 'Chauffeurs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'chauffeur-grid', component: 'staff-grid', entity: 'chauffeur', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-table', component: 'data-table', entity: 'package', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book Now', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/fleet', entity: 'vehicle', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/chauffeurs', entity: 'chauffeur', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'pickup_date', type: 'date', required: true },
        { name: 'pickup_time', type: 'datetime', required: true },
        { name: 'pickup_location', type: 'json', required: true },
        { name: 'dropoff_location', type: 'json' },
        { name: 'stops', type: 'json' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'passengers', type: 'integer', required: true },
        { name: 'occasion', type: 'string' },
        { name: 'special_requests', type: 'text' },
        { name: 'amenities', type: 'json' },
        { name: 'base_rate', type: 'decimal' },
        { name: 'extras', type: 'decimal' },
        { name: 'gratuity', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'vehicle' },
        { type: 'belongsTo', target: 'chauffeur' },
        { type: 'belongsTo', target: 'package' },
      ],
    },
    vehicle: {
      defaultFields: [
        { name: 'vehicle_name', type: 'string', required: true },
        { name: 'vehicle_type', type: 'enum', required: true },
        { name: 'make', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'year', type: 'integer' },
        { name: 'color', type: 'string' },
        { name: 'license_plate', type: 'string' },
        { name: 'passenger_capacity', type: 'integer', required: true },
        { name: 'amenities', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'photos', type: 'json' },
        { name: 'insurance_expiry', type: 'date' },
        { name: 'last_service', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    chauffeur: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'license_number', type: 'string', required: true },
        { name: 'license_expiry', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'languages', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'uniform_size', type: 'string' },
        { name: 'background_check', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'company', type: 'string' },
        { name: 'addresses', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'payment_methods', type: 'json' },
        { name: 'total_bookings', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'vip_status', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    package: {
      defaultFields: [
        { name: 'package_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'vehicle_types', type: 'json' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'included_miles', type: 'integer' },
        { name: 'amenities_included', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'deposit_required', type: 'decimal' },
        { name: 'occasions', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'gratuity', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'booking' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default limoBlueprint;
