import { Blueprint } from './blueprint.interface';

/**
 * Photography/Studio Blueprint
 */
export const photographyBlueprint: Blueprint = {
  appType: 'photography',
  description: 'Photography studio app with bookings, galleries, packages, and clients',

  coreEntities: ['booking', 'gallery', 'package', 'client', 'photo', 'contract'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Galleries', path: '/galleries', icon: 'Image' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Packages', path: '/packages', icon: 'Package' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
      ]}},
      { id: 'photo-stats', component: 'photo-stats', position: 'main' },
      { id: 'upcoming-sessions', component: 'session-list', entity: 'booking', position: 'main' },
      { id: 'recent-galleries', component: 'gallery-preview', entity: 'gallery', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'booking-calendar-photo', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/:id', name: 'Session Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-detail', component: 'session-detail', entity: 'booking', position: 'main' },
      { id: 'session-gallery', component: 'session-gallery', entity: 'photo', position: 'main' },
    ]},
    { path: '/galleries', name: 'Galleries', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'gallery-grid', component: 'gallery-grid-photo', entity: 'gallery', position: 'main' },
    ]},
    { path: '/galleries/:id', name: 'Gallery', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'gallery-viewer', component: 'gallery-viewer', entity: 'gallery', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-photo', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-photo', entity: 'client', position: 'main' },
      { id: 'client-sessions', component: 'client-sessions', entity: 'booking', position: 'main' },
      { id: 'client-galleries', component: 'client-galleries', entity: 'gallery', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'package-grid-photo', entity: 'package', position: 'main' },
    ]},
    { path: '/book', name: 'Book a Session', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard-photo', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/bookings/:id', entity: 'booking', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/galleries', entity: 'gallery', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/galleries/:id', entity: 'gallery', operation: 'get' },
    { method: 'POST', path: '/galleries', entity: 'gallery', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'session_type', type: 'enum', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'total_amount', type: 'decimal' },
        { name: 'deposit_paid', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'package' },
        { type: 'hasOne', target: 'gallery' },
      ],
    },
    gallery: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'cover_image', type: 'image' },
        { name: 'photo_count', type: 'integer' },
        { name: 'is_public', type: 'boolean' },
        { name: 'password', type: 'string' },
        { name: 'download_enabled', type: 'boolean' },
        { name: 'expires_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'booking' },
        { type: 'hasMany', target: 'photo' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'total_spent', type: 'decimal' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'gallery' },
      ],
    },
    package: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'includes', type: 'json' },
        { name: 'digital_images', type: 'integer' },
        { name: 'prints_included', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default photographyBlueprint;
