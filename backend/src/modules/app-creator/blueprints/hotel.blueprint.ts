import { Blueprint } from './blueprint.interface';

/**
 * Hotel Management Blueprint
 */
export const hotelBlueprint: Blueprint = {
  appType: 'hotel',
  description: 'Hotel management app with rooms, reservations, guests, and housekeeping',

  coreEntities: ['room', 'reservation', 'guest', 'room_type', 'housekeeping', 'amenity'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Rooms', path: '/rooms', icon: 'BedDouble' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Guests', path: '/guests', icon: 'Users' },
        { label: 'Housekeeping', path: '/housekeeping', icon: 'Sparkles' },
        { label: 'Reports', path: '/reports', icon: 'BarChart' },
      ]}},
      { id: 'hotel-stats', component: 'hotel-stats', position: 'main' },
      { id: 'room-status-grid', component: 'room-status-grid', entity: 'room', position: 'main' },
      { id: 'today-arrivals', component: 'arrivals-list', entity: 'reservation', position: 'main' },
    ]},
    { path: '/rooms', name: 'Rooms', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'room-filters', component: 'room-filters-hotel', entity: 'room', position: 'main' },
      { id: 'room-grid', component: 'room-grid-hotel', entity: 'room', position: 'main' },
    ]},
    { path: '/rooms/:id', name: 'Room Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'room-detail', component: 'room-detail-hotel', entity: 'room', position: 'main' },
      { id: 'room-calendar', component: 'room-calendar', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'reservation-calendar', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations/new', name: 'New Reservation', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-form', component: 'reservation-form-hotel', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations/:id', name: 'Reservation Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-detail', component: 'reservation-detail-hotel', entity: 'reservation', position: 'main' },
    ]},
    { path: '/guests', name: 'Guests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guest-table', component: 'guest-table-hotel', entity: 'guest', position: 'main' },
    ]},
    { path: '/guests/:id', name: 'Guest Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guest-profile', component: 'guest-profile-hotel', entity: 'guest', position: 'main' },
      { id: 'guest-reservations', component: 'guest-reservations', entity: 'reservation', position: 'main' },
    ]},
    { path: '/housekeeping', name: 'Housekeeping', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'housekeeping-board', component: 'housekeeping-board', entity: 'housekeeping', position: 'main' },
    ]},
    { path: '/book', name: 'Book a Room', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-search', component: 'hotel-booking-search', position: 'main' },
      { id: 'available-rooms', component: 'available-rooms', entity: 'room', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/rooms', entity: 'room', operation: 'list' },
    { method: 'GET', path: '/rooms/:id', entity: 'room', operation: 'get' },
    { method: 'GET', path: '/rooms/availability', entity: 'room', operation: 'custom' },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reservations/:id', entity: 'reservation', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/guests', entity: 'guest', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/housekeeping', entity: 'housekeeping', operation: 'list', requiresAuth: true },
    { method: 'PATCH', path: '/housekeeping/:id', entity: 'housekeeping', operation: 'update', requiresAuth: true },
  ],

  entityConfig: {
    room: {
      defaultFields: [
        { name: 'room_number', type: 'string', required: true },
        { name: 'floor', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'housekeeping_status', type: 'enum' },
        { name: 'amenities', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'room_type' },
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    room_type: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'max_occupancy', type: 'integer', required: true },
        { name: 'base_rate', type: 'decimal', required: true },
        { name: 'size', type: 'integer' },
        { name: 'bed_type', type: 'string' },
        { name: 'amenities', type: 'json' },
        { name: 'images', type: 'json' },
      ],
      relationships: [{ type: 'hasMany', target: 'room' }],
    },
    reservation: {
      defaultFields: [
        { name: 'confirmation_number', type: 'string', required: true },
        { name: 'check_in', type: 'date', required: true },
        { name: 'check_out', type: 'date', required: true },
        { name: 'adults', type: 'integer', required: true },
        { name: 'children', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'total_amount', type: 'decimal' },
        { name: 'paid_amount', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'source', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'room' },
        { type: 'belongsTo', target: 'guest' },
      ],
    },
    guest: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'id_type', type: 'enum' },
        { name: 'id_number', type: 'string' },
        { name: 'nationality', type: 'string' },
        { name: 'address', type: 'json' },
        { name: 'vip', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'total_stays', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'reservation' }],
    },
  },
};

export default hotelBlueprint;
