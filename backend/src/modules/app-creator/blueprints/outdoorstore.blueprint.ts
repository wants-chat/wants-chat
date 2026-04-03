import { Blueprint } from './blueprint.interface';

/**
 * Outdoor / Camping Equipment Store Blueprint
 */
export const outdoorstoreBlueprint: Blueprint = {
  appType: 'outdoorstore',
  description: 'Outdoor equipment store app with gear, rentals, repairs, and guided trips',

  coreEntities: ['product', 'rental', 'repair', 'customer', 'guided_trip', 'category'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Tent' },
        { label: 'Rentals', path: '/rentals', icon: 'Clock' },
        { label: 'Repairs', path: '/repairs', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Guided Trips', path: '/trips', icon: 'Mountain' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-trips', component: 'appointment-list', entity: 'guided_trip', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/rentals', name: 'Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-calendar', component: 'appointment-calendar', entity: 'rental', position: 'main' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/repairs', name: 'Repairs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-board', component: 'kanban-board', entity: 'repair', position: 'main' },
      { id: 'repair-table', component: 'data-table', entity: 'repair', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/trips', name: 'Guided Trips', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trip-calendar', component: 'appointment-calendar', entity: 'guided_trip', position: 'main' },
      { id: 'trip-table', component: 'data-table', entity: 'guided_trip', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-table', component: 'data-table', entity: 'category', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-display', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/rent', name: 'Rent Gear', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'rental-form', component: 'booking-wizard', entity: 'rental', position: 'main' },
    ]},
    { path: '/book-trip', name: 'Book Trip', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'trip-display', component: 'product-grid', entity: 'guided_trip', position: 'main' },
      { id: 'trip-form', component: 'booking-wizard', entity: 'guided_trip', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'rental', operation: 'create' },
    { method: 'GET', path: '/repairs', entity: 'repair', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/repairs', entity: 'repair', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/trips', entity: 'guided_trip', operation: 'list' },
    { method: 'POST', path: '/trips/book', entity: 'guided_trip', operation: 'create' },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'activity_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'weight', type: 'decimal' },
        { name: 'size', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'season', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'is_rentable', type: 'boolean' },
        { name: 'rental_price_day', type: 'decimal' },
        { name: 'rental_price_week', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
      ],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'pickup_date', type: 'date', required: true },
        { name: 'return_date', type: 'date', required: true },
        { name: 'items_rented', type: 'json', required: true },
        { name: 'customer_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'trip_destination', type: 'string' },
        { name: 'trip_type', type: 'enum' },
        { name: 'party_size', type: 'integer' },
        { name: 'deposit', type: 'decimal' },
        { name: 'rental_total', type: 'decimal' },
        { name: 'checked_out', type: 'boolean' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'condition_notes', type: 'text' },
        { name: 'damage_charges', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    repair: {
      defaultFields: [
        { name: 'repair_number', type: 'string', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'equipment_type', type: 'string', required: true },
        { name: 'brand', type: 'string' },
        { name: 'issue_description', type: 'text', required: true },
        { name: 'diagnosis', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'technician', type: 'string' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'outdoor_interests', type: 'json' },
        { name: 'experience_level', type: 'enum' },
        { name: 'gear_owned', type: 'json' },
        { name: 'shoe_size', type: 'string' },
        { name: 'clothing_size', type: 'string' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'rental' },
        { type: 'hasMany', target: 'repair' },
      ],
    },
    guided_trip: {
      defaultFields: [
        { name: 'trip_name', type: 'string', required: true },
        { name: 'trip_type', type: 'enum', required: true },
        { name: 'destination', type: 'string', required: true },
        { name: 'trip_date', type: 'date', required: true },
        { name: 'duration_days', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'itinerary', type: 'json' },
        { name: 'includes', type: 'json' },
        { name: 'gear_provided', type: 'json' },
        { name: 'gear_needed', type: 'json' },
        { name: 'min_participants', type: 'integer' },
        { name: 'max_participants', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'guide', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'images', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'parent_category', type: 'string' },
        { name: 'activity_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
  },
};

export default outdoorstoreBlueprint;
