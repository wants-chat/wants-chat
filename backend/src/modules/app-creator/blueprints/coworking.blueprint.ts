import { Blueprint } from './blueprint.interface';

/**
 * Coworking Space Blueprint
 */
export const coworkingBlueprint: Blueprint = {
  appType: 'coworking',
  description: 'Coworking space management app with spaces, bookings, members, and amenities',

  coreEntities: ['space', 'booking', 'member', 'plan', 'amenity', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Spaces', path: '/spaces', icon: 'Building2' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Plans', path: '/plans', icon: 'CreditCard' },
        { label: 'Amenities', path: '/amenities', icon: 'Coffee' },
      ]}},
      { id: 'coworking-stats', component: 'coworking-stats', position: 'main' },
      { id: 'occupancy-chart', component: 'occupancy-chart', position: 'main' },
      { id: 'today-bookings', component: 'booking-list-coworking', entity: 'booking', position: 'main' },
    ]},
    { path: '/spaces', name: 'Spaces', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'space-grid', component: 'space-grid', entity: 'space', position: 'main' },
    ]},
    { path: '/spaces/:id', name: 'Space Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'space-detail', component: 'space-detail', entity: 'space', position: 'main' },
      { id: 'space-calendar', component: 'space-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'booking-calendar-coworking', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/new', name: 'New Booking', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-form', component: 'booking-form-coworking', entity: 'booking', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'member-table-coworking', entity: 'member', position: 'main' },
    ]},
    { path: '/members/:id', name: 'Member Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-profile', component: 'member-profile-coworking', entity: 'member', position: 'main' },
      { id: 'member-bookings', component: 'member-bookings', entity: 'booking', position: 'main' },
    ]},
    { path: '/plans', name: 'Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plan-grid', component: 'coworking-plan-grid', entity: 'plan', position: 'main' },
    ]},
    { path: '/book', name: 'Book a Space', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'space-browser', component: 'space-browser', entity: 'space', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/spaces', entity: 'space', operation: 'list' },
    { method: 'GET', path: '/spaces/:id', entity: 'space', operation: 'get' },
    { method: 'POST', path: '/spaces', entity: 'space', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/plans', entity: 'plan', operation: 'list' },
  ],

  entityConfig: {
    space: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'daily_rate', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'amenities', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'floor', type: 'string' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'booking' }],
    },
    booking: {
      defaultFields: [
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'total_amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'attendees', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'space' },
        { type: 'belongsTo', target: 'member' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'company', type: 'string' },
        { name: 'status', type: 'enum' },
        { name: 'join_date', type: 'date' },
        { name: 'credits', type: 'integer' },
        { name: 'photo_url', type: 'image' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'plan' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
  },
};

export default coworkingBlueprint;
