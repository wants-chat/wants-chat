import { Blueprint } from './blueprint.interface';

/**
 * Event Venue Blueprint
 */
export const eventvenueBlueprint: Blueprint = {
  appType: 'eventvenue',
  description: 'Event venue with space rentals, bookings, event management, and client coordination',

  coreEntities: ['venue', 'booking', 'client', 'event', 'package', 'staff'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Calendar', path: '/calendar', icon: 'Calendar' },
        { label: 'Bookings', path: '/bookings', icon: 'CalendarCheck' },
        { label: 'Venues', path: '/venues', icon: 'Building' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Packages', path: '/packages', icon: 'Package' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
      ]}},
      { id: 'venue-stats', component: 'venue-stats', position: 'main' },
      { id: 'upcoming-events', component: 'event-list-upcoming', entity: 'event', position: 'main' },
      { id: 'pending-inquiries', component: 'inquiry-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/calendar', name: 'Calendar', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'venue-calendar', component: 'venue-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-filters', component: 'booking-filters-venue', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'booking-table-venue', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/:id', name: 'Booking Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-header', component: 'booking-header-venue', entity: 'booking', position: 'main' },
      { id: 'event-details', component: 'event-details-venue', entity: 'event', position: 'main' },
    ]},
    { path: '/bookings/new', name: 'New Booking', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-form', component: 'booking-form-venue', entity: 'booking', position: 'main' },
    ]},
    { path: '/venues', name: 'Venues', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'venue-grid', component: 'venue-grid', entity: 'venue', position: 'main' },
    ]},
    { path: '/venues/:id', name: 'Venue Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'venue-detail', component: 'venue-detail', entity: 'venue', position: 'main' },
      { id: 'venue-bookings', component: 'venue-bookings', entity: 'booking', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-venue', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-venue', entity: 'client', position: 'main' },
      { id: 'client-bookings', component: 'client-bookings-venue', entity: 'booking', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'package-grid-venue', entity: 'package', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid-venue', entity: 'staff', position: 'main' },
    ]},
    { path: '/explore', name: 'Explore Venues', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-venues', component: 'public-venue-browser', entity: 'venue', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/venues', entity: 'venue', operation: 'list' },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    venue: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'square_feet', type: 'integer' },
        { name: 'amenities', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'daily_rate', type: 'decimal' },
        { name: 'rules', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'booking' }],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'setup_time', type: 'datetime' },
        { name: 'breakdown_time', type: 'datetime' },
        { name: 'guest_count', type: 'integer' },
        { name: 'total_price', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'venue' },
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'package' },
        { type: 'hasOne', target: 'event' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'total_bookings', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'booking' }],
    },
    event: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'catering', type: 'json' },
        { name: 'entertainment', type: 'json' },
        { name: 'decorations', type: 'json' },
        { name: 'av_requirements', type: 'json' },
        { name: 'timeline', type: 'json' },
        { name: 'vendors', type: 'json' },
      ],
      relationships: [{ type: 'belongsTo', target: 'booking' }],
    },
    package: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'inclusions', type: 'json', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'min_hours', type: 'integer' },
        { name: 'min_guests', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'booking' }],
    },
    staff: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'role', type: 'enum', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'availability', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default eventvenueBlueprint;
