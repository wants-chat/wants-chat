import { Blueprint } from './blueprint.interface';

/**
 * Hunting Outfitter Blueprint
 */
export const huntingoutfitterBlueprint: Blueprint = {
  appType: 'huntingoutfitter',
  description: 'Hunting outfitter app with hunts, guides, bookings, and harvest logs',

  coreEntities: ['hunt', 'guide', 'booking', 'harvest', 'property', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Hunts', path: '/hunts', icon: 'Target' },
        { label: 'Guides', path: '/guides', icon: 'UserCheck' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Harvests', path: '/harvests', icon: 'Trophy' },
        { label: 'Properties', path: '/properties', icon: 'Map' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-hunts', component: 'appointment-list', entity: 'hunt', position: 'main' },
    ]},
    { path: '/hunts', name: 'Hunts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'hunt-calendar', component: 'appointment-calendar', entity: 'hunt', position: 'main' },
      { id: 'hunt-grid', component: 'product-grid', entity: 'hunt', position: 'main' },
    ]},
    { path: '/guides', name: 'Guides', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guide-grid', component: 'staff-grid', entity: 'guide', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/harvests', name: 'Harvests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'harvest-table', component: 'data-table', entity: 'harvest', position: 'main' },
    ]},
    { path: '/properties', name: 'Properties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'property-grid', component: 'product-grid', entity: 'property', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/packages', name: 'Hunt Packages', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'hunt-grid', component: 'product-grid', entity: 'hunt', position: 'main' },
    ]},
    { path: '/book', name: 'Book a Hunt', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/hunts', entity: 'hunt', operation: 'list' },
    { method: 'POST', path: '/hunts', entity: 'hunt', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/guides', entity: 'guide', operation: 'list' },
    { method: 'POST', path: '/guides', entity: 'guide', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/harvests', entity: 'harvest', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/harvests', entity: 'harvest', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/properties', entity: 'property', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    hunt: {
      defaultFields: [
        { name: 'hunt_name', type: 'string', required: true },
        { name: 'hunt_type', type: 'enum', required: true },
        { name: 'species', type: 'json', required: true },
        { name: 'season_start', type: 'date', required: true },
        { name: 'season_end', type: 'date', required: true },
        { name: 'duration_days', type: 'integer', required: true },
        { name: 'hunting_method', type: 'json' },
        { name: 'difficulty_level', type: 'enum' },
        { name: 'max_hunters', type: 'integer' },
        { name: 'price_per_hunter', type: 'decimal', required: true },
        { name: 'includes', type: 'json' },
        { name: 'not_included', type: 'json' },
        { name: 'requirements', type: 'json' },
        { name: 'success_rate', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'property' },
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'harvest' },
      ],
    },
    guide: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string', required: true },
        { name: 'license_state', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'years_experience', type: 'integer' },
        { name: 'specialties', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'first_aid_certified', type: 'boolean' },
        { name: 'cpr_certified', type: 'boolean' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'hire_date', type: 'date' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'hunt_dates', type: 'json', required: true },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'hunter_names', type: 'json' },
        { name: 'lodging_preference', type: 'enum' },
        { name: 'special_requests', type: 'text' },
        { name: 'experience_level', type: 'enum' },
        { name: 'price_per_hunter', type: 'decimal' },
        { name: 'lodging_fee', type: 'decimal' },
        { name: 'additional_fees', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'license_verified', type: 'boolean' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'hunt' },
        { type: 'belongsTo', target: 'guide' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    harvest: {
      defaultFields: [
        { name: 'harvest_date', type: 'date', required: true },
        { name: 'species', type: 'string', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'age_estimate', type: 'string' },
        { name: 'weight_lbs', type: 'decimal' },
        { name: 'antler_score', type: 'string' },
        { name: 'antler_points', type: 'integer' },
        { name: 'hunter_name', type: 'string', required: true },
        { name: 'weapon_used', type: 'string' },
        { name: 'shot_distance', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'tag_number', type: 'string' },
        { name: 'taxidermy', type: 'boolean' },
        { name: 'meat_processing', type: 'enum' },
        { name: 'photos', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'booking' },
        { type: 'belongsTo', target: 'hunt' },
      ],
    },
    property: {
      defaultFields: [
        { name: 'property_name', type: 'string', required: true },
        { name: 'property_type', type: 'enum', required: true },
        { name: 'acreage', type: 'decimal', required: true },
        { name: 'location', type: 'json' },
        { name: 'terrain', type: 'json' },
        { name: 'habitat', type: 'json' },
        { name: 'species_available', type: 'json' },
        { name: 'lodging_capacity', type: 'integer' },
        { name: 'lodging_type', type: 'json' },
        { name: 'amenities', type: 'json' },
        { name: 'access_notes', type: 'text' },
        { name: 'lease_expiry', type: 'date' },
        { name: 'photos', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'hunt' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'hunting_license', type: 'json' },
        { name: 'experience_level', type: 'enum' },
        { name: 'preferred_species', type: 'json' },
        { name: 'preferred_method', type: 'json' },
        { name: 'physical_limitations', type: 'text' },
        { name: 'dietary_restrictions', type: 'text' },
        { name: 'hunt_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
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

export default huntingoutfitterBlueprint;
