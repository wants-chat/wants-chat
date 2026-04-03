import { Blueprint } from './blueprint.interface';

/**
 * Car Wash Business Blueprint
 */
export const carwashBlueprint: Blueprint = {
  appType: 'carwash',
  description: 'Car wash app with services, memberships, appointments, and express checkout',

  coreEntities: ['service', 'wash_ticket', 'customer', 'membership', 'employee', 'package'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Queue', path: '/queue', icon: 'Car' },
        { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Packages', path: '/packages', icon: 'Package' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'current-queue', component: 'appointment-list', entity: 'wash_ticket', position: 'main' },
    ]},
    { path: '/queue', name: 'Wash Queue', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'queue-board', component: 'kanban-board', entity: 'wash_ticket', position: 'main' },
    ]},
    { path: '/tickets', name: 'Wash Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-table', component: 'data-table', entity: 'wash_ticket', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/packages', name: 'Wash Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'product-grid', entity: 'package', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'employee', position: 'main' },
    ]},
    { path: '/book', name: 'Book Wash', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'wash_ticket', position: 'main' },
    ]},
    { path: '/membership', name: 'Join Membership', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'pricing', component: 'plan-grid', entity: 'package', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tickets', entity: 'wash_ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'wash_ticket', operation: 'create' },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/memberships', entity: 'membership', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
    { method: 'GET', path: '/staff', entity: 'employee', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    wash_ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'wash_date', type: 'datetime', required: true },
        { name: 'vehicle_info', type: 'json', required: true },
        { name: 'license_plate', type: 'string' },
        { name: 'wash_type', type: 'enum', required: true },
        { name: 'addons', type: 'json' },
        { name: 'queue_position', type: 'integer' },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'payment_method', type: 'enum' },
        { name: 'total', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'package' },
        { type: 'belongsTo', target: 'membership' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'vehicles', type: 'json' },
        { name: 'preferred_services', type: 'json' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'wash_ticket' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'vehicle_info', type: 'json' },
        { name: 'license_plates', type: 'json' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'renewal_date', type: 'date' },
        { name: 'billing_cycle', type: 'enum' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'washes_used', type: 'integer' },
        { name: 'payment_method', type: 'json' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'package' },
      ],
    },
    package: {
      defaultFields: [
        { name: 'package_name', type: 'string', required: true },
        { name: 'package_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'services_included', type: 'json' },
        { name: 'single_price', type: 'decimal' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'annual_price', type: 'decimal' },
        { name: 'wash_limit', type: 'integer' },
        { name: 'vehicle_size', type: 'enum' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'sort_order', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    employee: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'tip_earnings', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'is_addon', type: 'boolean' },
        { name: 'sort_order', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default carwashBlueprint;
