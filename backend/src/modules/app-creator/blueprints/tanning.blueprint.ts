import { Blueprint } from './blueprint.interface';

/**
 * Tanning Salon Blueprint
 */
export const tanningBlueprint: Blueprint = {
  appType: 'tanning',
  description: 'Tanning salon app with sessions, beds, memberships, and spray tan bookings',

  coreEntities: ['session', 'customer', 'bed', 'membership', 'package', 'product'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Sessions', path: '/sessions', icon: 'Sun' },
        { label: 'Beds', path: '/beds', icon: 'Bed' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
        { label: 'Packages', path: '/packages', icon: 'Package' },
        { label: 'Products', path: '/products', icon: 'ShoppingBag' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
      { id: 'session-table', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/beds', name: 'Beds & Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'bed-grid', component: 'product-grid', entity: 'bed', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'product-grid', entity: 'package', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/book', name: 'Book Session', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'session', position: 'main' },
    ]},
    { path: '/pricing', name: 'Pricing', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'pricing-table', component: 'plan-grid', entity: 'package', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create' },
    { method: 'GET', path: '/beds', entity: 'bed', operation: 'list' },
    { method: 'GET', path: '/clients', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/memberships', entity: 'membership', operation: 'create' },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
  ],

  entityConfig: {
    session: {
      defaultFields: [
        { name: 'session_number', type: 'string', required: true },
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'intensity_level', type: 'enum' },
        { name: 'spray_tan_shade', type: 'enum' },
        { name: 'lotion_used', type: 'string' },
        { name: 'price', type: 'decimal' },
        { name: 'is_complimentary', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'bed' },
        { type: 'belongsTo', target: 'membership' },
        { type: 'belongsTo', target: 'package' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'birthday', type: 'date' },
        { name: 'skin_type', type: 'enum' },
        { name: 'preferred_shade', type: 'enum' },
        { name: 'allergies', type: 'json' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'waiver_date', type: 'date' },
        { name: 'total_sessions', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    bed: {
      defaultFields: [
        { name: 'bed_name', type: 'string', required: true },
        { name: 'bed_type', type: 'enum', required: true },
        { name: 'bed_number', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'lamp_type', type: 'string' },
        { name: 'intensity_levels', type: 'json' },
        { name: 'max_minutes', type: 'integer' },
        { name: 'price_per_session', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'lamp_hours', type: 'integer' },
        { name: 'is_available', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'included_beds', type: 'json' },
        { name: 'unlimited', type: 'boolean' },
        { name: 'sessions_included', type: 'integer' },
        { name: 'sessions_used', type: 'integer' },
        { name: 'spray_tans_included', type: 'integer' },
        { name: 'spray_tans_used', type: 'integer' },
        { name: 'product_discount', type: 'decimal' },
        { name: 'upgrade_discount', type: 'decimal' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    package: {
      defaultFields: [
        { name: 'package_name', type: 'string', required: true },
        { name: 'package_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'sessions_count', type: 'integer' },
        { name: 'valid_beds', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'price_per_session', type: 'decimal' },
        { name: 'validity_days', type: 'integer' },
        { name: 'includes_lotion', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'member_price', type: 'decimal' },
        { name: 'size', type: 'string' },
        { name: 'spf', type: 'integer' },
        { name: 'bronzer_level', type: 'enum' },
        { name: 'tingle_level', type: 'enum' },
        { name: 'sku', type: 'string' },
        { name: 'quantity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_bestseller', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default tanningBlueprint;
