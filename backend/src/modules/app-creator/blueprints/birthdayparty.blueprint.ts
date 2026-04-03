import { Blueprint } from './blueprint.interface';

/**
 * Birthday Party Blueprint
 */
export const birthdaypartyBlueprint: Blueprint = {
  appType: 'birthdayparty',
  description: 'Birthday party venue app with packages, bookings, add-ons, and event coordination',

  coreEntities: ['package', 'booking', 'addon', 'guest', 'staff', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Packages', path: '/packages', icon: 'Gift' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Add-ons', path: '/addons', icon: 'Plus' },
        { label: 'Guests', path: '/guests', icon: 'Users' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-parties', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'product-grid', entity: 'package', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/addons', name: 'Add-ons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'addon-grid', component: 'product-grid', entity: 'addon', position: 'main' },
    ]},
    { path: '/guests', name: 'Guests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guest-table', component: 'data-table', entity: 'guest', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book a Party', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'package-grid', component: 'product-grid', entity: 'package', position: 'main' },
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
    { method: 'POST', path: '/packages', entity: 'package', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/addons', entity: 'addon', operation: 'list' },
    { method: 'POST', path: '/addons', entity: 'addon', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/guests', entity: 'guest', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    package: {
      defaultFields: [
        { name: 'package_name', type: 'string', required: true },
        { name: 'theme', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'duration_hours', type: 'decimal', required: true },
        { name: 'min_guests', type: 'integer' },
        { name: 'max_guests', type: 'integer' },
        { name: 'age_range', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'price_per_extra_guest', type: 'decimal' },
        { name: 'includes', type: 'json' },
        { name: 'room', type: 'string' },
        { name: 'available_days', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'party_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'birthday_child_name', type: 'string', required: true },
        { name: 'birthday_child_age', type: 'integer' },
        { name: 'expected_guests', type: 'integer', required: true },
        { name: 'theme', type: 'string' },
        { name: 'addons_selected', type: 'json' },
        { name: 'cake_details', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'package_price', type: 'decimal' },
        { name: 'addons_total', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'package' },
        { type: 'belongsTo', target: 'guest' },
        { type: 'hasOne', target: 'invoice' },
      ],
    },
    addon: {
      defaultFields: [
        { name: 'addon_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'price_type', type: 'enum' },
        { name: 'min_quantity', type: 'integer' },
        { name: 'max_quantity', type: 'integer' },
        { name: 'requires_advance_notice', type: 'boolean' },
        { name: 'advance_notice_days', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    guest: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'how_heard', type: 'string' },
        { name: 'parties_booked', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'preferences', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    staff: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specialties', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default birthdaypartyBlueprint;
