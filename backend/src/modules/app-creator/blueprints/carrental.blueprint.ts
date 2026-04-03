import { Blueprint } from './blueprint.interface';

/**
 * Car Rental Blueprint
 */
export const carrentalBlueprint: Blueprint = {
  appType: 'carrental',
  description: 'Car rental app with vehicles, bookings, customers, and locations',

  coreEntities: ['vehicle', 'booking', 'customer', 'location', 'insurance', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Vehicles', path: '/vehicles', icon: 'Car' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Locations', path: '/locations', icon: 'MapPin' },
        { label: 'Reports', path: '/reports', icon: 'BarChart' },
      ]}},
      { id: 'rental-stats', component: 'rental-stats', position: 'main' },
      { id: 'fleet-status', component: 'fleet-status', position: 'main' },
      { id: 'active-rentals', component: 'active-rentals', entity: 'booking', position: 'main' },
    ]},
    { path: '/vehicles', name: 'Vehicles', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-filters', component: 'vehicle-filters', entity: 'vehicle', position: 'main' },
      { id: 'vehicle-grid', component: 'vehicle-grid-rental', entity: 'vehicle', position: 'main' },
    ]},
    { path: '/vehicles/:id', name: 'Vehicle Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-detail', component: 'vehicle-detail-rental', entity: 'vehicle', position: 'main' },
      { id: 'vehicle-history', component: 'vehicle-history', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-filters', component: 'booking-filters-rental', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'booking-table-rental', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/:id', name: 'Booking Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-detail', component: 'booking-detail-rental', entity: 'booking', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-rental', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-rental', entity: 'customer', position: 'main' },
      { id: 'customer-rentals', component: 'customer-rentals', entity: 'booking', position: 'main' },
    ]},
    { path: '/locations', name: 'Locations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'location-grid', component: 'location-grid-rental', entity: 'location', position: 'main' },
    ]},
    { path: '/rent', name: 'Rent a Car', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'rental-search', component: 'rental-search', position: 'main' },
      { id: 'available-vehicles', component: 'available-vehicles', entity: 'vehicle', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/vehicles', entity: 'vehicle', operation: 'list' },
    { method: 'GET', path: '/vehicles/:id', entity: 'vehicle', operation: 'get' },
    { method: 'POST', path: '/vehicles', entity: 'vehicle', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/bookings/:id', entity: 'booking', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/locations', entity: 'location', operation: 'list' },
  ],

  entityConfig: {
    vehicle: {
      defaultFields: [
        { name: 'make', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'license_plate', type: 'string', required: true },
        { name: 'vin', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'transmission', type: 'enum' },
        { name: 'fuel_type', type: 'enum' },
        { name: 'seats', type: 'integer' },
        { name: 'daily_rate', type: 'decimal', required: true },
        { name: 'mileage', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'images', type: 'json' },
        { name: 'features', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'location' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'pickup_date', type: 'datetime', required: true },
        { name: 'return_date', type: 'datetime', required: true },
        { name: 'actual_return_date', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
        { name: 'total_amount', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'mileage_start', type: 'integer' },
        { name: 'mileage_end', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vehicle' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'location' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'license_number', type: 'string', required: true },
        { name: 'license_expiry', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'total_rentals', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'booking' }],
    },
    location: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'email', type: 'email' },
        { name: 'hours', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'vehicle' }],
    },
  },
};

export default carrentalBlueprint;
