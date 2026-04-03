import { Blueprint } from './blueprint.interface';

/**
 * Taxi / Ride-Share Company Blueprint
 */
export const taxiBlueprint: Blueprint = {
  appType: 'taxi',
  description: 'Taxi/ride-share app with bookings, drivers, vehicles, and fare management',

  coreEntities: ['ride', 'driver', 'vehicle', 'customer', 'fare', 'shift'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Rides', path: '/rides', icon: 'Car' },
        { label: 'Drivers', path: '/drivers', icon: 'UserCheck' },
        { label: 'Vehicles', path: '/vehicles', icon: 'Truck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Fares', path: '/fares', icon: 'DollarSign' },
        { label: 'Shifts', path: '/shifts', icon: 'Clock' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'live-rides', component: 'tracking-map', entity: 'ride', position: 'main' },
    ]},
    { path: '/rides', name: 'Rides', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ride-filters', component: 'filter-form', entity: 'ride', position: 'main' },
      { id: 'ride-table', component: 'data-table', entity: 'ride', position: 'main' },
    ]},
    { path: '/drivers', name: 'Drivers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'driver-grid', component: 'staff-grid', entity: 'driver', position: 'main' },
    ]},
    { path: '/drivers/:id', name: 'Driver Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'driver-profile', component: 'driver-profile', entity: 'driver', position: 'main' },
      { id: 'driver-stats', component: 'stats-cards', position: 'main' },
    ]},
    { path: '/vehicles', name: 'Vehicles', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-table', component: 'data-table', entity: 'vehicle', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/fares', name: 'Fare Management', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'fare-table', component: 'data-table', entity: 'fare', position: 'main' },
    ]},
    { path: '/shifts', name: 'Shifts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'shift-table', component: 'data-table', entity: 'shift', position: 'main' },
    ]},
    { path: '/book', name: 'Book Ride', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'ride', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/rides', entity: 'ride', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rides', entity: 'ride', operation: 'create' },
    { method: 'PUT', path: '/rides/:id', entity: 'ride', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/drivers', entity: 'driver', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/vehicles', entity: 'vehicle', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/fares', entity: 'fare', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/shifts', entity: 'shift', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    ride: {
      defaultFields: [
        { name: 'ride_number', type: 'string', required: true },
        { name: 'pickup_location', type: 'json', required: true },
        { name: 'dropoff_location', type: 'json', required: true },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'dropoff_time', type: 'datetime' },
        { name: 'requested_at', type: 'datetime', required: true },
        { name: 'ride_type', type: 'enum', required: true },
        { name: 'passengers', type: 'integer' },
        { name: 'distance_miles', type: 'decimal' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'base_fare', type: 'decimal' },
        { name: 'surge_multiplier', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'total_fare', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'rating', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'driver' },
        { type: 'belongsTo', target: 'vehicle' },
      ],
    },
    driver: {
      defaultFields: [
        { name: 'driver_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'license_number', type: 'string', required: true },
        { name: 'license_expiry', type: 'date' },
        { name: 'background_check', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'rating', type: 'decimal' },
        { name: 'total_rides', type: 'integer' },
        { name: 'total_earnings', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'current_location', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vehicle' },
        { type: 'hasMany', target: 'ride' },
        { type: 'hasMany', target: 'shift' },
      ],
    },
    vehicle: {
      defaultFields: [
        { name: 'vehicle_id', type: 'string', required: true },
        { name: 'make', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'color', type: 'string' },
        { name: 'license_plate', type: 'string', required: true },
        { name: 'vin', type: 'string' },
        { name: 'vehicle_type', type: 'enum', required: true },
        { name: 'seating_capacity', type: 'integer' },
        { name: 'insurance_expiry', type: 'date' },
        { name: 'registration_expiry', type: 'date' },
        { name: 'inspection_expiry', type: 'date' },
        { name: 'mileage', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'ride' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'saved_locations', type: 'json' },
        { name: 'payment_methods', type: 'json' },
        { name: 'total_rides', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'rating', type: 'decimal' },
        { name: 'is_verified', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'ride' },
      ],
    },
    fare: {
      defaultFields: [
        { name: 'fare_name', type: 'string', required: true },
        { name: 'ride_type', type: 'enum', required: true },
        { name: 'base_fare', type: 'decimal', required: true },
        { name: 'per_mile_rate', type: 'decimal', required: true },
        { name: 'per_minute_rate', type: 'decimal', required: true },
        { name: 'minimum_fare', type: 'decimal' },
        { name: 'booking_fee', type: 'decimal' },
        { name: 'cancellation_fee', type: 'decimal' },
        { name: 'surge_zones', type: 'json' },
        { name: 'effective_from', type: 'date' },
        { name: 'effective_to', type: 'date' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    shift: {
      defaultFields: [
        { name: 'shift_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'rides_completed', type: 'integer' },
        { name: 'total_distance', type: 'decimal' },
        { name: 'total_earnings', type: 'decimal' },
        { name: 'tips_earned', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'driver' },
        { type: 'belongsTo', target: 'vehicle' },
      ],
    },
  },
};

export default taxiBlueprint;
