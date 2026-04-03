import { Blueprint } from './blueprint.interface';

/**
 * Storage Facility Blueprint
 */
export const storageBlueprint: Blueprint = {
  appType: 'storage',
  description: 'Self-storage facility with units, rentals, payments, and access control',

  coreEntities: ['unit', 'rental', 'customer', 'payment', 'access_log', 'facility'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Units', path: '/units', icon: 'Box' },
        { label: 'Rentals', path: '/rentals', icon: 'Key' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Payments', path: '/payments', icon: 'CreditCard' },
        { label: 'Access Logs', path: '/access', icon: 'Shield' },
      ]}},
      { id: 'storage-stats', component: 'storage-stats', position: 'main' },
      { id: 'occupancy-overview', component: 'occupancy-overview', entity: 'unit', position: 'main' },
      { id: 'overdue-list', component: 'overdue-rentals', entity: 'rental', position: 'main' },
    ]},
    { path: '/units', name: 'Units', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'unit-filters', component: 'unit-filters-storage', entity: 'unit', position: 'main' },
      { id: 'unit-grid', component: 'unit-grid-storage', entity: 'unit', position: 'main' },
    ]},
    { path: '/units/:id', name: 'Unit Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'unit-detail', component: 'unit-detail-storage', entity: 'unit', position: 'main' },
      { id: 'unit-history', component: 'unit-rental-history', entity: 'rental', position: 'main' },
    ]},
    { path: '/rentals', name: 'Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-filters', component: 'rental-filters-storage', entity: 'rental', position: 'main' },
      { id: 'rental-table', component: 'rental-table-storage', entity: 'rental', position: 'main' },
    ]},
    { path: '/rentals/:id', name: 'Rental Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-detail', component: 'rental-detail-storage', entity: 'rental', position: 'main' },
    ]},
    { path: '/rentals/new', name: 'New Rental', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-form', component: 'rental-form-storage', entity: 'rental', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-storage', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-storage', entity: 'customer', position: 'main' },
      { id: 'customer-rentals', component: 'customer-rentals-storage', entity: 'rental', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'payment-table-storage', entity: 'payment', position: 'main' },
    ]},
    { path: '/access', name: 'Access Logs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'access-log-table', component: 'access-log-table', entity: 'access_log', position: 'main' },
    ]},
    { path: '/reserve', name: 'Reserve Unit', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'unit-browser', component: 'unit-browser', entity: 'unit', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/units', entity: 'unit', operation: 'list' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'rental', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/access-logs', entity: 'access_log', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    unit: {
      defaultFields: [
        { name: 'unit_number', type: 'string', required: true },
        { name: 'size', type: 'enum', required: true },
        { name: 'width', type: 'decimal' },
        { name: 'depth', type: 'decimal' },
        { name: 'height', type: 'decimal' },
        { name: 'floor', type: 'integer' },
        { name: 'type', type: 'enum' },
        { name: 'features', type: 'json' },
        { name: 'monthly_rate', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'facility' },
        { type: 'hasMany', target: 'rental' },
      ],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
        { name: 'monthly_rate', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'access_code', type: 'string' },
        { name: 'auto_pay', type: 'boolean' },
        { name: 'insurance', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'unit' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'payment' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'id_type', type: 'string' },
        { name: 'id_number', type: 'string' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'balance', type: 'decimal' },
      ],
      relationships: [
        { type: 'hasMany', target: 'rental' },
        { type: 'hasMany', target: 'access_log' },
      ],
    },
    payment: {
      defaultFields: [
        { name: 'payment_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'method', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'reference', type: 'string' },
        { name: 'period_start', type: 'date' },
        { name: 'period_end', type: 'date' },
      ],
      relationships: [{ type: 'belongsTo', target: 'rental' }],
    },
    access_log: {
      defaultFields: [
        { name: 'access_time', type: 'datetime', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'method', type: 'string' },
        { name: 'gate', type: 'string' },
        { name: 'success', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'unit' },
      ],
    },
    facility: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'hours', type: 'json' },
        { name: 'access_hours', type: 'json' },
        { name: 'amenities', type: 'json' },
        { name: 'total_units', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'unit' }],
    },
  },
};

export default storageBlueprint;
