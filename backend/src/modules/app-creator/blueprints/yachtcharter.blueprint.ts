import { Blueprint } from './blueprint.interface';

/**
 * Yacht Charter Blueprint
 */
export const yachtcharterBlueprint: Blueprint = {
  appType: 'yachtcharter',
  description: 'Yacht charter service with vessels, bookings, crew, and itinerary management',

  coreEntities: ['vessel', 'booking', 'client', 'crew', 'itinerary', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Vessels', path: '/vessels', icon: 'Ship' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Crew', path: '/crew', icon: 'Anchor' },
        { label: 'Itineraries', path: '/itineraries', icon: 'Map' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/vessels', name: 'Vessels', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vessel-grid', component: 'product-grid', entity: 'vessel', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/crew', name: 'Crew', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'crew-grid', component: 'staff-grid', entity: 'crew', position: 'main' },
    ]},
    { path: '/itineraries', name: 'Itineraries', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'itinerary-table', component: 'data-table', entity: 'itinerary', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/vessels', entity: 'vessel', operation: 'list' },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/crew', entity: 'crew', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/itineraries', entity: 'itinerary', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    vessel: {
      defaultFields: [
        { name: 'vessel_name', type: 'string', required: true },
        { name: 'vessel_type', type: 'enum', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'length_feet', type: 'decimal' },
        { name: 'guest_capacity', type: 'integer' },
        { name: 'cabins', type: 'integer' },
        { name: 'crew_capacity', type: 'integer' },
        { name: 'amenities', type: 'json' },
        { name: 'water_toys', type: 'json' },
        { name: 'specifications', type: 'json' },
        { name: 'daily_rate', type: 'decimal', required: true },
        { name: 'weekly_rate', type: 'decimal' },
        { name: 'home_port', type: 'string' },
        { name: 'cruising_area', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'charter_type', type: 'enum' },
        { name: 'guest_count', type: 'integer' },
        { name: 'embarkation_port', type: 'string' },
        { name: 'disembarkation_port', type: 'string' },
        { name: 'special_requests', type: 'json' },
        { name: 'dietary_requirements', type: 'json' },
        { name: 'charter_rate', type: 'decimal' },
        { name: 'apa_amount', type: 'decimal' },
        { name: 'total_amount', type: 'decimal', required: true },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vessel' },
        { type: 'belongsTo', target: 'client' },
        { type: 'hasOne', target: 'itinerary' },
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
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'previous_charters', type: 'integer' },
        { name: 'vip_status', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    crew: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'position', type: 'enum', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'languages', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'daily_rate', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'bio', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vessel' },
      ],
    },
    itinerary: {
      defaultFields: [
        { name: 'itinerary_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'days', type: 'json' },
        { name: 'destinations', type: 'json' },
        { name: 'activities', type: 'json' },
        { name: 'dining_plans', type: 'json' },
        { name: 'special_events', type: 'json' },
        { name: 'weather_notes', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'booking' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'charter_fee', type: 'decimal' },
        { name: 'apa_fee', type: 'decimal' },
        { name: 'extras', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default yachtcharterBlueprint;
