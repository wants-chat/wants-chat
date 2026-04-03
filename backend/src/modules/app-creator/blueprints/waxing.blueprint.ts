import { Blueprint } from './blueprint.interface';

/**
 * Waxing / Hair Removal Salon Blueprint
 */
export const waxingBlueprint: Blueprint = {
  appType: 'waxing',
  description: 'Waxing salon app with appointments, services, estheticians, and memberships',

  coreEntities: ['appointment', 'service', 'customer', 'esthetician', 'membership', 'product'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Services', path: '/services', icon: 'Sparkles' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
        { label: 'Products', path: '/products', icon: 'Package' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
      { id: 'appointment-table', component: 'data-table', entity: 'appointment', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'product-grid', entity: 'service', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'esthetician', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/clients', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'esthetician', operation: 'list' },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
  ],

  entityConfig: {
    appointment: {
      defaultFields: [
        { name: 'appointment_number', type: 'string', required: true },
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'services', type: 'json', required: true },
        { name: 'total_duration', type: 'integer' },
        { name: 'total', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'first_time', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'esthetician' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'body_area', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'member_price', type: 'decimal' },
        { name: 'first_time_price', type: 'decimal' },
        { name: 'is_popular', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
        { name: 'sort_order', type: 'integer' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'birthday', type: 'date' },
        { name: 'skin_sensitivity', type: 'enum' },
        { name: 'allergies', type: 'json' },
        { name: 'preferred_esthetician', type: 'string' },
        { name: 'service_history', type: 'json' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    esthetician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'services_included', type: 'json' },
        { name: 'discount_percent', type: 'decimal' },
        { name: 'free_services', type: 'json' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
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
        { name: 'sku', type: 'string' },
        { name: 'quantity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default waxingBlueprint;
