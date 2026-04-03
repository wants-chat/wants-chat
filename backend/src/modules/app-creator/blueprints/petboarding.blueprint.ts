import { Blueprint } from './blueprint.interface';

/**
 * Pet Boarding/Daycare Blueprint
 */
export const petboardingBlueprint: Blueprint = {
  appType: 'petboarding',
  description: 'Pet boarding and daycare facility with reservations, pet profiles, and owner management',

  coreEntities: ['pet', 'owner', 'reservation', 'kennel', 'service', 'activity'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Pets', path: '/pets', icon: 'PawPrint' },
        { label: 'Owners', path: '/owners', icon: 'Users' },
        { label: 'Kennels', path: '/kennels', icon: 'Home' },
        { label: 'Services', path: '/services', icon: 'Sparkles' },
      ]}},
      { id: 'boarding-stats', component: 'boarding-stats', position: 'main' },
      { id: 'today-checkins', component: 'checkin-list', entity: 'reservation', position: 'main' },
      { id: 'kennel-status', component: 'kennel-status-grid', entity: 'kennel', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'reservation-calendar-boarding', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations/new', name: 'New Reservation', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-form', component: 'reservation-form-boarding', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations/:id', name: 'Reservation Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-detail', component: 'reservation-detail-boarding', entity: 'reservation', position: 'main' },
      { id: 'activity-log', component: 'pet-activity-log', entity: 'activity', position: 'main' },
    ]},
    { path: '/pets', name: 'Pets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pet-table', component: 'pet-table-boarding', entity: 'pet', position: 'main' },
    ]},
    { path: '/pets/:id', name: 'Pet Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pet-profile', component: 'pet-profile-boarding', entity: 'pet', position: 'main' },
      { id: 'pet-reservations', component: 'pet-reservation-history', entity: 'reservation', position: 'main' },
    ]},
    { path: '/owners', name: 'Owners', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'owner-table', component: 'owner-table-boarding', entity: 'owner', position: 'main' },
    ]},
    { path: '/owners/:id', name: 'Owner Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'owner-profile', component: 'owner-profile-boarding', entity: 'owner', position: 'main' },
      { id: 'owner-pets', component: 'owner-pets-boarding', entity: 'pet', position: 'main' },
    ]},
    { path: '/kennels', name: 'Kennels', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'kennel-grid', component: 'kennel-grid', entity: 'kennel', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'service-grid-boarding', entity: 'service', position: 'main' },
    ]},
    { path: '/book', name: 'Book Stay', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'online-booking', component: 'online-booking-boarding', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/pets', entity: 'pet', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/owners', entity: 'owner', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/kennels', entity: 'kennel', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
  ],

  entityConfig: {
    pet: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'species', type: 'enum', required: true },
        { name: 'breed', type: 'string' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'gender', type: 'enum' },
        { name: 'weight', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'medical_info', type: 'json' },
        { name: 'dietary_needs', type: 'json' },
        { name: 'behavioral_notes', type: 'text' },
        { name: 'emergency_vet', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'owner' },
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    owner: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
      ],
      relationships: [{ type: 'hasMany', target: 'pet' }],
    },
    reservation: {
      defaultFields: [
        { name: 'check_in_date', type: 'date', required: true },
        { name: 'check_out_date', type: 'date', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'type', type: 'enum' },
        { name: 'special_instructions', type: 'text' },
        { name: 'total_price', type: 'decimal' },
        { name: 'services', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pet' },
        { type: 'belongsTo', target: 'kennel' },
      ],
    },
    kennel: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'size', type: 'enum', required: true },
        { name: 'type', type: 'enum' },
        { name: 'daily_rate', type: 'decimal', required: true },
        { name: 'amenities', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'reservation' }],
    },
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'category', type: 'string' },
      ],
      relationships: [],
    },
    activity: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'recorded_at', type: 'datetime', required: true },
        { name: 'notes', type: 'text' },
        { name: 'photo_url', type: 'image' },
      ],
      relationships: [{ type: 'belongsTo', target: 'reservation' }],
    },
  },
};

export default petboardingBlueprint;
