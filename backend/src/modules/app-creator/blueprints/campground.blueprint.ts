import { Blueprint } from './blueprint.interface';

/**
 * Campground/RV Park Blueprint
 */
export const campgroundBlueprint: Blueprint = {
  appType: 'campground',
  description: 'Campground/RV park with sites, reservations, amenities, and activities',

  coreEntities: ['site', 'reservation', 'guest', 'amenity', 'activity', 'rate'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Site Map', path: '/map', icon: 'Map' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Guests', path: '/guests', icon: 'Users' },
        { label: 'Activities', path: '/activities', icon: 'Tent' },
        { label: 'Rates', path: '/rates', icon: 'DollarSign' },
      ]}},
      { id: 'campground-stats', component: 'campground-stats', position: 'main' },
      { id: 'site-availability', component: 'site-availability-overview', entity: 'site', position: 'main' },
      { id: 'arrivals-today', component: 'arrivals-today-campground', entity: 'reservation', position: 'main' },
    ]},
    { path: '/map', name: 'Site Map', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'site-map', component: 'site-map-campground', entity: 'site', position: 'main' },
    ]},
    { path: '/sites/:id', name: 'Site Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'site-detail', component: 'site-detail-campground', entity: 'site', position: 'main' },
      { id: 'site-calendar', component: 'site-calendar-campground', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-filters', component: 'reservation-filters-campground', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'reservation-table-campground', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations/:id', name: 'Reservation Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-detail', component: 'reservation-detail-campground', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations/new', name: 'New Reservation', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-form', component: 'reservation-form-campground', entity: 'reservation', position: 'main' },
    ]},
    { path: '/guests', name: 'Guests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guest-table', component: 'guest-table-campground', entity: 'guest', position: 'main' },
    ]},
    { path: '/guests/:id', name: 'Guest Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guest-profile', component: 'guest-profile-campground', entity: 'guest', position: 'main' },
      { id: 'guest-reservations', component: 'guest-reservations-campground', entity: 'reservation', position: 'main' },
    ]},
    { path: '/activities', name: 'Activities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'activity-calendar', component: 'activity-calendar-campground', entity: 'activity', position: 'main' },
    ]},
    { path: '/rates', name: 'Rates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rate-table', component: 'rate-table-campground', entity: 'rate', position: 'main' },
    ]},
    { path: '/book', name: 'Book Site', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-booking', component: 'public-booking-campground', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/sites', entity: 'site', operation: 'list' },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/guests', entity: 'guest', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list' },
    { method: 'GET', path: '/rates', entity: 'rate', operation: 'list' },
  ],

  entityConfig: {
    site: {
      defaultFields: [
        { name: 'site_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'size', type: 'enum' },
        { name: 'max_length', type: 'integer' },
        { name: 'hookups', type: 'json' },
        { name: 'amenities', type: 'json' },
        { name: 'location', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'hasMany', target: 'reservation' }],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'arrival_date', type: 'date', required: true },
        { name: 'departure_date', type: 'date', required: true },
        { name: 'adults', type: 'integer', required: true },
        { name: 'children', type: 'integer' },
        { name: 'pets', type: 'integer' },
        { name: 'vehicle_type', type: 'enum' },
        { name: 'vehicle_length', type: 'integer' },
        { name: 'nightly_rate', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'check_in', type: 'datetime' },
        { name: 'check_out', type: 'datetime' },
        { name: 'special_requests', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'site' },
        { type: 'belongsTo', target: 'guest' },
      ],
    },
    guest: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'reservation' }],
    },
    activity: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'date', type: 'date' },
        { name: 'time', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'max_participants', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'image', type: 'image' },
      ],
      relationships: [],
    },
    rate: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'site_type', type: 'enum', required: true },
        { name: 'season', type: 'enum' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'nightly_rate', type: 'decimal', required: true },
        { name: 'weekly_rate', type: 'decimal' },
        { name: 'monthly_rate', type: 'decimal' },
        { name: 'extra_person', type: 'decimal' },
        { name: 'pet_fee', type: 'decimal' },
      ],
      relationships: [],
    },
  },
};

export default campgroundBlueprint;
