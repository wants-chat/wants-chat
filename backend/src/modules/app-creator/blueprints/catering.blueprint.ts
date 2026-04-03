import { Blueprint } from './blueprint.interface';

/**
 * Catering Blueprint
 */
export const cateringBlueprint: Blueprint = {
  appType: 'catering',
  description: 'Catering app with events, menus, quotes, and orders',

  coreEntities: ['event', 'menu', 'menu_item', 'quote', 'order', 'client'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Menus', path: '/menus', icon: 'BookOpen' },
        { label: 'Quotes', path: '/quotes', icon: 'FileText' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
      ]}},
      { id: 'catering-stats', component: 'catering-stats', position: 'main' },
      { id: 'upcoming-events', component: 'event-list-catering', entity: 'event', position: 'main' },
      { id: 'pending-quotes', component: 'quote-list-catering', entity: 'quote', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'event-calendar-catering', entity: 'event', position: 'main' },
    ]},
    { path: '/events/:id', name: 'Event Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-detail', component: 'event-detail-catering', entity: 'event', position: 'main' },
      { id: 'event-menu', component: 'event-menu', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/events/new', name: 'New Event', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-form', component: 'event-form-catering', entity: 'event', position: 'main' },
    ]},
    { path: '/menus', name: 'Menus', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-grid', component: 'menu-grid-catering', entity: 'menu', position: 'main' },
    ]},
    { path: '/menus/:id', name: 'Menu Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-detail', component: 'menu-detail-catering', entity: 'menu', position: 'main' },
      { id: 'menu-items', component: 'menu-items-catering', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'quote-table-catering', entity: 'quote', position: 'main' },
    ]},
    { path: '/quotes/:id', name: 'Quote Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-detail', component: 'quote-detail-catering', entity: 'quote', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'order-table-catering', entity: 'order', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-catering', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-catering', entity: 'client', position: 'main' },
      { id: 'client-events', component: 'client-events', entity: 'event', position: 'main' },
    ]},
    { path: '/request-quote', name: 'Request Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-request-form', component: 'quote-request-form', entity: 'quote', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/events', entity: 'event', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/events/:id', entity: 'event', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/menus', entity: 'menu', operation: 'list' },
    { method: 'GET', path: '/menus/:id', entity: 'menu', operation: 'get' },
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create' },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    event: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'guest_count', type: 'integer', required: true },
        { name: 'venue', type: 'string' },
        { name: 'venue_address', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'total_amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'dietary_requirements', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'menu' },
        { type: 'hasOne', target: 'order' },
      ],
    },
    menu: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'type', type: 'enum' },
        { name: 'price_per_person', type: 'decimal' },
        { name: 'min_guests', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'menu_item' }],
    },
    menu_item: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum' },
        { name: 'price', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'allergens', type: 'json' },
        { name: 'dietary_info', type: 'json' },
      ],
      relationships: [{ type: 'belongsTo', target: 'menu' }],
    },
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'event_type', type: 'enum' },
        { name: 'event_date', type: 'date' },
        { name: 'guest_count', type: 'integer' },
        { name: 'venue', type: 'string' },
        { name: 'budget', type: 'decimal' },
        { name: 'quoted_amount', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
        { name: 'valid_until', type: 'date' },
      ],
      relationships: [{ type: 'belongsTo', target: 'client' }],
    },
    client: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'total_events', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'event' },
        { type: 'hasMany', target: 'quote' },
      ],
    },
  },
};

export default cateringBlueprint;
