import { Blueprint } from './blueprint.interface';

/**
 * Cleaning Service Blueprint
 */
export const cleaningBlueprint: Blueprint = {
  appType: 'cleaning',
  description: 'House cleaning service with bookings, teams, schedules, and customer management',

  coreEntities: ['booking', 'customer', 'property', 'cleaner', 'service', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Team', path: '/team', icon: 'UserCheck' },
        { label: 'Services', path: '/services', icon: 'Sparkles' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'cleaning-stats', component: 'cleaning-stats', position: 'main' },
      { id: 'today-bookings', component: 'booking-list-cleaning', entity: 'booking', position: 'main' },
      { id: 'team-schedule', component: 'team-schedule-cleaning', entity: 'cleaner', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'booking-calendar-cleaning', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/new', name: 'New Booking', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-form', component: 'booking-form-cleaning', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/:id', name: 'Booking Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-detail', component: 'booking-detail-cleaning', entity: 'booking', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-cleaning', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-cleaning', entity: 'customer', position: 'main' },
      { id: 'customer-properties', component: 'customer-properties', entity: 'property', position: 'main' },
      { id: 'customer-bookings', component: 'customer-bookings-cleaning', entity: 'booking', position: 'main' },
    ]},
    { path: '/team', name: 'Team', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'cleaner-grid', component: 'cleaner-grid', entity: 'cleaner', position: 'main' },
    ]},
    { path: '/team/:id', name: 'Cleaner Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'cleaner-profile', component: 'cleaner-profile', entity: 'cleaner', position: 'main' },
      { id: 'cleaner-schedule', component: 'cleaner-schedule', entity: 'booking', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'service-grid-cleaning', entity: 'service', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'invoice-table-cleaning', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book Cleaning', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-booking', component: 'public-booking-cleaning', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/team', entity: 'cleaner', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'services', type: 'json' },
        { name: 'special_instructions', type: 'text' },
        { name: 'total_price', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'property' },
        { type: 'belongsTo', target: 'cleaner' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'preferred_day', type: 'string' },
        { name: 'preferred_time', type: 'string' },
        { name: 'total_bookings', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'property' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
    property: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'size', type: 'integer' },
        { name: 'bedrooms', type: 'integer' },
        { name: 'bathrooms', type: 'integer' },
        { name: 'access_instructions', type: 'text' },
        { name: 'special_requirements', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
    cleaner: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'photo_url', type: 'image' },
        { name: 'skills', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'rating', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'booking' }],
    },
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'type', type: 'enum' },
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'price_per_sqft', type: 'decimal' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default cleaningBlueprint;
