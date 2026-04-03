import { Blueprint } from './blueprint.interface';

/**
 * Cigar Shop Blueprint
 */
export const cigarshopBlueprint: Blueprint = {
  appType: 'cigarshop',
  description: 'Cigar shop app with cigars, humidors, lounge, and membership',

  coreEntities: ['cigar', 'humidor', 'lounge_reservation', 'member', 'order', 'brand'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Cigars', path: '/cigars', icon: 'Cigarette' },
        { label: 'Humidors', path: '/humidors', icon: 'Box' },
        { label: 'Lounge', path: '/lounge', icon: 'Armchair' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Brands', path: '/brands', icon: 'Award' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-reservations', component: 'appointment-list', entity: 'lounge_reservation', position: 'main' },
    ]},
    { path: '/cigars', name: 'Cigars', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'cigar', position: 'main' },
      { id: 'cigar-grid', component: 'product-grid', entity: 'cigar', position: 'main' },
    ]},
    { path: '/humidors', name: 'Humidors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'humidor-table', component: 'data-table', entity: 'humidor', position: 'main' },
    ]},
    { path: '/lounge', name: 'Lounge', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'lounge_reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'lounge_reservation', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/brands', name: 'Brands', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'brand-table', component: 'data-table', entity: 'brand', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'cigar', position: 'main' },
      { id: 'cigar-display', component: 'product-grid', entity: 'cigar', position: 'main' },
    ]},
    { path: '/reserve-lounge', name: 'Reserve Lounge', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'lounge_reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/cigars', entity: 'cigar', operation: 'list' },
    { method: 'GET', path: '/humidors', entity: 'humidor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/lounge', entity: 'lounge_reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/lounge', entity: 'lounge_reservation', operation: 'create' },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/brands', entity: 'brand', operation: 'list' },
  ],

  entityConfig: {
    cigar: {
      defaultFields: [
        { name: 'cigar_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'origin', type: 'string' },
        { name: 'wrapper', type: 'string' },
        { name: 'binder', type: 'string' },
        { name: 'filler', type: 'string' },
        { name: 'strength', type: 'enum' },
        { name: 'shape', type: 'enum' },
        { name: 'length', type: 'decimal' },
        { name: 'ring_gauge', type: 'integer' },
        { name: 'tasting_notes', type: 'text' },
        { name: 'rating', type: 'decimal' },
        { name: 'price_single', type: 'decimal', required: true },
        { name: 'price_box', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'brand' },
      ],
    },
    humidor: {
      defaultFields: [
        { name: 'humidor_number', type: 'string', required: true },
        { name: 'size', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'monthly_fee', type: 'decimal', required: true },
        { name: 'current_humidity', type: 'decimal' },
        { name: 'current_temperature', type: 'decimal' },
        { name: 'last_check', type: 'datetime' },
        { name: 'contents', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
    lounge_reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'party_size', type: 'integer' },
        { name: 'area', type: 'enum' },
        { name: 'special_requests', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'membership_start', type: 'date' },
        { name: 'membership_end', type: 'date' },
        { name: 'preferences', type: 'json' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'humidor' },
        { type: 'hasMany', target: 'lounge_reservation' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'member_discount', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
    brand: {
      defaultFields: [
        { name: 'brand_name', type: 'string', required: true },
        { name: 'country', type: 'string' },
        { name: 'factory', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'website', type: 'string' },
        { name: 'logo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'cigar' },
      ],
    },
  },
};

export default cigarshopBlueprint;
