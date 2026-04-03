import { Blueprint } from './blueprint.interface';

/**
 * Fishing Charter Blueprint
 */
export const fishingcharterBlueprint: Blueprint = {
  appType: 'fishingcharter',
  description: 'Fishing charter app with trips, boats, bookings, and catch logs',

  coreEntities: ['trip', 'boat', 'booking', 'catch_log', 'captain', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Trips', path: '/trips', icon: 'Ship' },
        { label: 'Boats', path: '/boats', icon: 'Anchor' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Catch Logs', path: '/catches', icon: 'Fish' },
        { label: 'Captains', path: '/captains', icon: 'UserCheck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-trips', component: 'appointment-list', entity: 'trip', position: 'main' },
    ]},
    { path: '/trips', name: 'Trips', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trip-calendar', component: 'appointment-calendar', entity: 'trip', position: 'main' },
    ]},
    { path: '/boats', name: 'Boats', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'boat-grid', component: 'product-grid', entity: 'boat', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/catches', name: 'Catch Logs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'catch-table', component: 'data-table', entity: 'catch_log', position: 'main' },
    ]},
    { path: '/captains', name: 'Captains', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'captain-grid', component: 'staff-grid', entity: 'captain', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/book', name: 'Book a Trip', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'trip-grid', component: 'product-grid', entity: 'trip', position: 'main' },
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/trips', entity: 'trip', operation: 'list' },
    { method: 'POST', path: '/trips', entity: 'trip', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/boats', entity: 'boat', operation: 'list' },
    { method: 'POST', path: '/boats', entity: 'boat', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/catches', entity: 'catch_log', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/catches', entity: 'catch_log', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/captains', entity: 'captain', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    trip: {
      defaultFields: [
        { name: 'trip_name', type: 'string', required: true },
        { name: 'trip_type', type: 'enum', required: true },
        { name: 'trip_date', type: 'date', required: true },
        { name: 'departure_time', type: 'datetime', required: true },
        { name: 'return_time', type: 'datetime' },
        { name: 'duration_hours', type: 'integer', required: true },
        { name: 'target_species', type: 'json' },
        { name: 'fishing_location', type: 'string' },
        { name: 'max_passengers', type: 'integer', required: true },
        { name: 'booked_passengers', type: 'integer' },
        { name: 'price_per_person', type: 'decimal', required: true },
        { name: 'private_charter_price', type: 'decimal' },
        { name: 'includes', type: 'json' },
        { name: 'bring_list', type: 'json' },
        { name: 'weather_conditions', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'boat' },
        { type: 'belongsTo', target: 'captain' },
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'catch_log' },
      ],
    },
    boat: {
      defaultFields: [
        { name: 'boat_name', type: 'string', required: true },
        { name: 'boat_type', type: 'enum', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'length_feet', type: 'decimal' },
        { name: 'beam_feet', type: 'decimal' },
        { name: 'passenger_capacity', type: 'integer', required: true },
        { name: 'engine_type', type: 'string' },
        { name: 'horsepower', type: 'integer' },
        { name: 'cruising_speed', type: 'decimal' },
        { name: 'fuel_capacity', type: 'decimal' },
        { name: 'amenities', type: 'json' },
        { name: 'safety_equipment', type: 'json' },
        { name: 'fishing_equipment', type: 'json' },
        { name: 'registration_number', type: 'string' },
        { name: 'insurance_expiry', type: 'date' },
        { name: 'last_inspection', type: 'date' },
        { name: 'photos', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'trip' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'booking_type', type: 'enum', required: true },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'guest_names', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'experience_level', type: 'enum' },
        { name: 'price_per_person', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'trip' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    catch_log: {
      defaultFields: [
        { name: 'catch_date', type: 'date', required: true },
        { name: 'species', type: 'string', required: true },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'weight_lbs', type: 'decimal' },
        { name: 'length_inches', type: 'decimal' },
        { name: 'caught_by', type: 'string' },
        { name: 'fishing_method', type: 'string' },
        { name: 'bait_used', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'kept_released', type: 'enum' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'trip' },
      ],
    },
    captain: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string', required: true },
        { name: 'license_type', type: 'enum' },
        { name: 'license_expiry', type: 'date' },
        { name: 'years_experience', type: 'integer' },
        { name: 'specialties', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'hire_date', type: 'date' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'trip' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'experience_level', type: 'enum' },
        { name: 'preferred_species', type: 'json' },
        { name: 'trip_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'fishing_license', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
  },
};

export default fishingcharterBlueprint;
