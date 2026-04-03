import { Blueprint } from './blueprint.interface';

/**
 * Salon/Barbershop Blueprint
 */
export const salonBlueprint: Blueprint = {
  appType: 'salon',
  description: 'Hair salon/barbershop with appointments, stylists, services, and client management',

  coreEntities: ['stylist', 'client', 'appointment', 'service', 'product', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Stylists', path: '/stylists', icon: 'Scissors' },
        { label: 'Services', path: '/services', icon: 'Sparkles' },
        { label: 'Products', path: '/products', icon: 'ShoppingBag' },
      ]}},
      { id: 'salon-stats', component: 'salon-stats', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list-salon', entity: 'appointment', position: 'main' },
      { id: 'stylist-schedule', component: 'stylist-schedule-overview', entity: 'stylist', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar-salon', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments/new', name: 'New Appointment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-form', component: 'appointment-form-salon', entity: 'appointment', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-salon', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-salon', entity: 'client', position: 'main' },
      { id: 'client-history', component: 'client-history-salon', entity: 'appointment', position: 'main' },
    ]},
    { path: '/stylists', name: 'Stylists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'stylist-grid', component: 'stylist-grid', entity: 'stylist', position: 'main' },
    ]},
    { path: '/stylists/:id', name: 'Stylist Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'stylist-profile', component: 'stylist-profile', entity: 'stylist', position: 'main' },
      { id: 'stylist-schedule', component: 'stylist-schedule', entity: 'appointment', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'service-grid-salon', entity: 'service', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid-salon', entity: 'product', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'online-booking', component: 'online-booking-salon', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients/:id', entity: 'client', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/stylists', entity: 'stylist', operation: 'list' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
  ],

  entityConfig: {
    stylist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'photo_url', type: 'image' },
        { name: 'bio', type: 'text' },
        { name: 'specialties', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'preferences', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'total_visits', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
        { name: 'total_price', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'stylist' },
        { type: 'belongsTo', target: 'service' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration', type: 'integer', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'category', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
    product: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'stock', type: 'integer' },
        { name: 'category', type: 'string' },
        { name: 'image_url', type: 'image' },
      ],
      relationships: [],
    },
  },
};

export default salonBlueprint;
