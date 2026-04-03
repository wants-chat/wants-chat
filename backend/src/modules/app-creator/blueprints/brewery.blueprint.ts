import { Blueprint } from './blueprint.interface';

/**
 * Brewery/Winery Blueprint
 */
export const breweryBlueprint: Blueprint = {
  appType: 'brewery',
  description: 'Brewery/winery with products, tours, tastings, and taproom management',

  coreEntities: ['product', 'tour', 'tasting', 'event', 'order', 'member'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Wine' },
        { label: 'Tours', path: '/tours', icon: 'Map' },
        { label: 'Tastings', path: '/tastings', icon: 'GlassWater' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Club Members', path: '/members', icon: 'Users' },
      ]}},
      { id: 'brewery-stats', component: 'brewery-stats', position: 'main' },
      { id: 'today-tours', component: 'tour-list-today', entity: 'tour', position: 'main' },
      { id: 'recent-orders', component: 'order-list-recent-brewery', entity: 'order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid-brewery', entity: 'product', position: 'main' },
    ]},
    { path: '/products/:id', name: 'Product Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-detail', component: 'product-detail-brewery', entity: 'product', position: 'main' },
    ]},
    { path: '/tours', name: 'Tours', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tour-calendar', component: 'tour-calendar-brewery', entity: 'tour', position: 'main' },
    ]},
    { path: '/tours/:id', name: 'Tour Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tour-detail', component: 'tour-detail-brewery', entity: 'tour', position: 'main' },
    ]},
    { path: '/tastings', name: 'Tastings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tasting-table', component: 'tasting-table', entity: 'tasting', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'event-calendar-brewery', entity: 'event', position: 'main' },
    ]},
    { path: '/members', name: 'Club Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'member-table-brewery', entity: 'member', position: 'main' },
    ]},
    { path: '/members/:id', name: 'Member Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-profile', component: 'member-profile-brewery', entity: 'member', position: 'main' },
      { id: 'member-orders', component: 'member-orders-brewery', entity: 'order', position: 'main' },
    ]},
    { path: '/visit', name: 'Plan Visit', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-visit', component: 'public-visit-brewery', entity: 'tour', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-shop', component: 'public-shop-brewery', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/tours', entity: 'tour', operation: 'list' },
    { method: 'POST', path: '/tours', entity: 'tour', operation: 'create' },
    { method: 'GET', path: '/tastings', entity: 'tasting', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'style', type: 'string' },
        { name: 'abv', type: 'decimal' },
        { name: 'ibu', type: 'integer' },
        { name: 'description', type: 'text' },
        { name: 'tasting_notes', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'size', type: 'string' },
        { name: 'image', type: 'image' },
        { name: 'is_available', type: 'boolean' },
        { name: 'is_seasonal', type: 'boolean' },
      ],
      relationships: [],
    },
    tour: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'type', type: 'enum' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'max_guests', type: 'integer', required: true },
        { name: 'current_guests', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'includes_tasting', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    tasting: {
      defaultFields: [
        { name: 'date', type: 'datetime', required: true },
        { name: 'type', type: 'enum' },
        { name: 'products', type: 'json' },
        { name: 'guests', type: 'integer' },
        { name: 'total', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    event: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'ticket_price', type: 'decimal' },
        { name: 'max_attendees', type: 'integer' },
        { name: 'current_attendees', type: 'integer' },
        { name: 'image', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'shipping_address', type: 'json' },
      ],
      relationships: [{ type: 'belongsTo', target: 'member' }],
    },
    member: {
      defaultFields: [
        { name: 'member_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'membership_tier', type: 'enum' },
        { name: 'join_date', type: 'date' },
        { name: 'preferences', type: 'json' },
        { name: 'shipping_address', type: 'json' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [{ type: 'hasMany', target: 'order' }],
    },
  },
};

export default breweryBlueprint;
