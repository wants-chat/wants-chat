import { Blueprint } from './blueprint.interface';

/**
 * Travel Agency Blueprint
 */
export const travelagencyBlueprint: Blueprint = {
  appType: 'travelagency',
  description: 'Travel agency with trip packages, bookings, clients, and itinerary management',

  coreEntities: ['trip', 'booking', 'client', 'itinerary', 'supplier', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Trips', path: '/trips', icon: 'Plane' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Suppliers', path: '/suppliers', icon: 'Building2' },
        { label: 'Payments', path: '/payments', icon: 'CreditCard' },
      ]}},
      { id: 'travel-stats', component: 'travel-stats', position: 'main' },
      { id: 'upcoming-trips', component: 'trip-list-upcoming', entity: 'booking', position: 'main' },
      { id: 'recent-bookings', component: 'booking-list-recent', entity: 'booking', position: 'main' },
    ]},
    { path: '/trips', name: 'Trips', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trip-filters', component: 'trip-filters-agency', entity: 'trip', position: 'main' },
      { id: 'trip-grid', component: 'trip-grid-agency', entity: 'trip', position: 'main' },
    ]},
    { path: '/trips/:id', name: 'Trip Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trip-header', component: 'trip-header-agency', entity: 'trip', position: 'main' },
      { id: 'trip-itinerary', component: 'trip-itinerary', entity: 'itinerary', position: 'main' },
    ]},
    { path: '/trips/new', name: 'New Trip', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trip-form', component: 'trip-form-agency', entity: 'trip', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-filters', component: 'booking-filters-agency', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'booking-table-agency', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/:id', name: 'Booking Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-header', component: 'booking-header-agency', entity: 'booking', position: 'main' },
      { id: 'booking-itinerary', component: 'booking-itinerary', entity: 'itinerary', position: 'main' },
      { id: 'booking-documents', component: 'booking-documents', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/new', name: 'New Booking', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-form', component: 'booking-form-agency', entity: 'booking', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-agency', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-agency', entity: 'client', position: 'main' },
      { id: 'client-trips', component: 'client-trips', entity: 'booking', position: 'main' },
    ]},
    { path: '/suppliers', name: 'Suppliers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'supplier-table', component: 'supplier-table', entity: 'supplier', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'payment-table-agency', entity: 'payment', position: 'main' },
    ]},
    { path: '/destinations', name: 'Explore Destinations', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'destination-browser', component: 'destination-browser', entity: 'trip', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/trips', entity: 'trip', operation: 'list' },
    { method: 'POST', path: '/trips', entity: 'trip', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/suppliers', entity: 'supplier', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    trip: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'destination', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'duration_days', type: 'integer', required: true },
        { name: 'description', type: 'text' },
        { name: 'highlights', type: 'json' },
        { name: 'inclusions', type: 'json' },
        { name: 'exclusions', type: 'json' },
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'images', type: 'json' },
        { name: 'start_dates', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'itinerary' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'travel_date', type: 'date', required: true },
        { name: 'return_date', type: 'date' },
        { name: 'travelers', type: 'json' },
        { name: 'num_adults', type: 'integer', required: true },
        { name: 'num_children', type: 'integer' },
        { name: 'special_requests', type: 'text' },
        { name: 'total_price', type: 'decimal', required: true },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'documents', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'trip' },
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'payment' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'passport_info', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'total_trips', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'booking' }],
    },
    itinerary: {
      defaultFields: [
        { name: 'day', type: 'integer', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'activities', type: 'json' },
        { name: 'meals', type: 'json' },
        { name: 'accommodation', type: 'json' },
        { name: 'transportation', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'trip' }],
    },
    supplier: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'services', type: 'json' },
        { name: 'commission_rate', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    payment: {
      defaultFields: [
        { name: 'payment_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'method', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'reference', type: 'string' },
      ],
      relationships: [{ type: 'belongsTo', target: 'booking' }],
    },
  },
};

export default travelagencyBlueprint;
