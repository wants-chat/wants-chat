import { Blueprint } from './blueprint.interface';

/**
 * Parking Management Blueprint
 */
export const parkingBlueprint: Blueprint = {
  appType: 'parking',
  description: 'Parking lot management with spaces, reservations, payments, and access control',

  coreEntities: ['parking_lot', 'space', 'reservation', 'session', 'customer', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Live View', path: '/live', icon: 'Activity' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Parking Lots', path: '/lots', icon: 'ParkingSquare' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Payments', path: '/payments', icon: 'CreditCard' },
      ]}},
      { id: 'parking-stats', component: 'parking-stats', position: 'main' },
      { id: 'occupancy-overview', component: 'occupancy-overview-parking', entity: 'parking_lot', position: 'main' },
      { id: 'active-sessions', component: 'session-list-active', entity: 'session', position: 'main' },
    ]},
    { path: '/live', name: 'Live View', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'live-map', component: 'live-parking-map', entity: 'space', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-filters', component: 'reservation-filters-parking', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'reservation-table-parking', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations/:id', name: 'Reservation Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-detail', component: 'reservation-detail-parking', entity: 'reservation', position: 'main' },
    ]},
    { path: '/lots', name: 'Parking Lots', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lot-grid', component: 'lot-grid', entity: 'parking_lot', position: 'main' },
    ]},
    { path: '/lots/:id', name: 'Lot Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lot-header', component: 'lot-header', entity: 'parking_lot', position: 'main' },
      { id: 'lot-map', component: 'lot-space-map', entity: 'space', position: 'main' },
      { id: 'lot-stats', component: 'lot-stats', entity: 'session', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-parking', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-parking', entity: 'customer', position: 'main' },
      { id: 'customer-history', component: 'customer-parking-history', entity: 'session', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-stats', component: 'payment-stats-parking', position: 'main' },
      { id: 'payment-table', component: 'payment-table-parking', entity: 'payment', position: 'main' },
    ]},
    { path: '/find-parking', name: 'Find Parking', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'parking-finder', component: 'parking-finder', entity: 'parking_lot', position: 'main' },
    ]},
    { path: '/reserve', name: 'Reserve Spot', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'public-reservation-parking', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/lots', entity: 'parking_lot', operation: 'list' },
    { method: 'GET', path: '/spaces', entity: 'space', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    parking_lot: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'total_spaces', type: 'integer', required: true },
        { name: 'available_spaces', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'daily_rate', type: 'decimal' },
        { name: 'monthly_rate', type: 'decimal' },
        { name: 'operating_hours', type: 'json' },
        { name: 'amenities', type: 'json' },
        { name: 'coordinates', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'space' },
        { type: 'hasMany', target: 'session' },
      ],
    },
    space: {
      defaultFields: [
        { name: 'number', type: 'string', required: true },
        { name: 'level', type: 'string' },
        { name: 'zone', type: 'string' },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'is_accessible', type: 'boolean' },
        { name: 'is_ev_charging', type: 'boolean' },
        { name: 'is_reserved', type: 'boolean' },
        { name: 'coordinates', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'parking_lot' },
        { type: 'hasMany', target: 'session' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'vehicle_plate', type: 'string' },
        { name: 'vehicle_type', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'price', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'parking_lot' },
        { type: 'belongsTo', target: 'space' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'entry_time', type: 'datetime', required: true },
        { name: 'exit_time', type: 'datetime' },
        { name: 'vehicle_plate', type: 'string' },
        { name: 'vehicle_type', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'amount', type: 'decimal' },
        { name: 'entry_photo', type: 'image' },
        { name: 'exit_photo', type: 'image' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'parking_lot' },
        { type: 'belongsTo', target: 'space' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'payment' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'vehicles', type: 'json' },
        { name: 'membership_type', type: 'enum' },
        { name: 'balance', type: 'decimal' },
        { name: 'total_visits', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
        { type: 'hasMany', target: 'session' },
      ],
    },
    payment: {
      defaultFields: [
        { name: 'payment_date', type: 'datetime', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'method', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'reference', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'session' },
        { type: 'belongsTo', target: 'reservation' },
      ],
    },
  },
};

export default parkingBlueprint;
