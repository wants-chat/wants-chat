import { Blueprint } from './blueprint.interface';

/**
 * Spa/Wellness Blueprint
 */
export const spaBlueprint: Blueprint = {
  appType: 'spa',
  description: 'Spa and wellness app with services, appointments, therapists, and packages',

  coreEntities: ['service', 'appointment', 'therapist', 'package', 'client', 'room'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Services', path: '/services', icon: 'Sparkles' },
        { label: 'Therapists', path: '/therapists', icon: 'Users' },
        { label: 'Clients', path: '/clients', icon: 'Heart' },
        { label: 'Packages', path: '/packages', icon: 'Gift' },
      ]}},
      { id: 'spa-stats', component: 'spa-stats', position: 'main' },
      { id: 'today-schedule', component: 'spa-schedule', entity: 'appointment', position: 'main' },
      { id: 'therapist-availability', component: 'therapist-availability', entity: 'therapist', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar-spa', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments/new', name: 'New Appointment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-form', component: 'appointment-form-spa', entity: 'appointment', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'service-grid-spa', entity: 'service', position: 'main' },
    ]},
    { path: '/therapists', name: 'Therapists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapist-grid', component: 'therapist-grid-spa', entity: 'therapist', position: 'main' },
    ]},
    { path: '/therapists/:id', name: 'Therapist Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapist-profile', component: 'therapist-profile-spa', entity: 'therapist', position: 'main' },
      { id: 'therapist-schedule', component: 'therapist-schedule', entity: 'appointment', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-spa', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-spa', entity: 'client', position: 'main' },
      { id: 'client-history', component: 'client-history-spa', entity: 'appointment', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'package-grid-spa', entity: 'package', position: 'main' },
    ]},
    { path: '/book', name: 'Book Treatment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'service-menu', component: 'service-menu', entity: 'service', position: 'main' },
      { id: 'booking-form', component: 'spa-booking-form', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/services/:id', entity: 'service', operation: 'get' },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/therapists', entity: 'therapist', operation: 'list' },
    { method: 'GET', path: '/therapists/:id', entity: 'therapist', operation: 'get' },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
  ],

  entityConfig: {
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration', type: 'integer', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'benefits', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'total_amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'special_requests', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'service' },
        { type: 'belongsTo', target: 'therapist' },
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'room' },
      ],
    },
    therapist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'specializations', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
        { name: 'schedule', type: 'json' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'preferences', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'health_notes', type: 'text' },
        { name: 'total_visits', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
    package: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'services', type: 'json', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'validity_days', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default spaBlueprint;
