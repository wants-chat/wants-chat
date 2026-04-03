import { Blueprint } from './blueprint.interface';

/**
 * Marina/Boat Storage Blueprint
 */
export const marinaBlueprint: Blueprint = {
  appType: 'marina',
  description: 'Marina with boat slips, storage, reservations, and marine services',

  coreEntities: ['slip', 'boat', 'reservation', 'customer', 'service', 'amenity'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Slips', path: '/slips', icon: 'Anchor' },
        { label: 'Boats', path: '/boats', icon: 'Ship' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Services', path: '/services', icon: 'Wrench' },
      ]}},
      { id: 'marina-stats', component: 'marina-stats', position: 'main' },
      { id: 'slip-availability', component: 'slip-availability-overview', entity: 'slip', position: 'main' },
      { id: 'arrivals-departures', component: 'arrivals-departures', entity: 'reservation', position: 'main' },
    ]},
    { path: '/slips', name: 'Slips', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'slip-map', component: 'slip-map', entity: 'slip', position: 'main' },
    ]},
    { path: '/slips/:id', name: 'Slip Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'slip-detail', component: 'slip-detail', entity: 'slip', position: 'main' },
      { id: 'slip-reservations', component: 'slip-reservations', entity: 'reservation', position: 'main' },
    ]},
    { path: '/boats', name: 'Boats', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'boat-table', component: 'boat-table', entity: 'boat', position: 'main' },
    ]},
    { path: '/boats/:id', name: 'Boat Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'boat-detail', component: 'boat-detail', entity: 'boat', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'reservation-calendar-marina', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations/:id', name: 'Reservation Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-detail', component: 'reservation-detail-marina', entity: 'reservation', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-marina', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-marina', entity: 'customer', position: 'main' },
      { id: 'customer-boats', component: 'customer-boats', entity: 'boat', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'service-grid-marina', entity: 'service', position: 'main' },
    ]},
    { path: '/book', name: 'Reserve Slip', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'public-booking-marina', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/slips', entity: 'slip', operation: 'list' },
    { method: 'GET', path: '/boats', entity: 'boat', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
  ],

  entityConfig: {
    slip: {
      defaultFields: [
        { name: 'slip_number', type: 'string', required: true },
        { name: 'dock', type: 'string' },
        { name: 'type', type: 'enum', required: true },
        { name: 'length', type: 'decimal', required: true },
        { name: 'width', type: 'decimal' },
        { name: 'depth', type: 'decimal' },
        { name: 'power', type: 'enum' },
        { name: 'water', type: 'boolean' },
        { name: 'daily_rate', type: 'decimal' },
        { name: 'monthly_rate', type: 'decimal' },
        { name: 'annual_rate', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'hasMany', target: 'reservation' }],
    },
    boat: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'registration_number', type: 'string' },
        { name: 'type', type: 'enum' },
        { name: 'make', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'length', type: 'decimal', required: true },
        { name: 'beam', type: 'decimal' },
        { name: 'draft', type: 'decimal' },
        { name: 'color', type: 'string' },
        { name: 'insurance_info', type: 'json' },
        { name: 'photos', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'rate', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'check_in', type: 'datetime' },
        { name: 'check_out', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'slip' },
        { type: 'belongsTo', target: 'boat' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'member_since', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'boat' },
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal' },
        { name: 'price_type', type: 'enum' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default marinaBlueprint;
