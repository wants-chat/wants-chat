import { Blueprint } from './blueprint.interface';

/**
 * Fashion Stylist Blueprint
 */
export const fashionstylistBlueprint: Blueprint = {
  appType: 'fashionstylist',
  description: 'Fashion styling app with clients, lookbooks, appointments, and wardrobe management',

  coreEntities: ['client', 'appointment', 'lookbook', 'outfit', 'wardrobe', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Lookbooks', path: '/lookbooks', icon: 'Book' },
        { label: 'Outfits', path: '/outfits', icon: 'Shirt' },
        { label: 'Wardrobe', path: '/wardrobe', icon: 'Archive' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/lookbooks', name: 'Lookbooks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lookbook-grid', component: 'product-grid', entity: 'lookbook', position: 'main' },
    ]},
    { path: '/outfits', name: 'Outfits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'outfit-grid', component: 'product-grid', entity: 'outfit', position: 'main' },
    ]},
    { path: '/wardrobe', name: 'Wardrobe', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wardrobe-grid', component: 'product-grid', entity: 'wardrobe', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/lookbooks', entity: 'lookbook', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/outfits', entity: 'outfit', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/wardrobe', entity: 'wardrobe', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'occupation', type: 'string' },
        { name: 'style_preferences', type: 'json' },
        { name: 'color_preferences', type: 'json' },
        { name: 'size_info', type: 'json' },
        { name: 'budget_range', type: 'string' },
        { name: 'lifestyle', type: 'text' },
        { name: 'goals', type: 'text' },
        { name: 'dislikes', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'lookbook' },
        { type: 'hasMany', target: 'wardrobe' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'appointment_type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'location_type', type: 'enum' },
        { name: 'purpose', type: 'text' },
        { name: 'occasion', type: 'string' },
        { name: 'budget', type: 'decimal' },
        { name: 'session_fee', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'follow_up', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    lookbook: {
      defaultFields: [
        { name: 'lookbook_name', type: 'string', required: true },
        { name: 'season', type: 'enum' },
        { name: 'year', type: 'integer' },
        { name: 'occasion', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'style_notes', type: 'text' },
        { name: 'color_palette', type: 'json' },
        { name: 'cover_image', type: 'image' },
        { name: 'created_date', type: 'date' },
        { name: 'is_shared', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'outfit' },
      ],
    },
    outfit: {
      defaultFields: [
        { name: 'outfit_name', type: 'string', required: true },
        { name: 'occasion', type: 'string' },
        { name: 'season', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'style_tips', type: 'text' },
        { name: 'items', type: 'json' },
        { name: 'accessories', type: 'json' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_favorite', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'lookbook' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    wardrobe: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'sub_category', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'material', type: 'string' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'decimal' },
        { name: 'condition', type: 'enum' },
        { name: 'care_instructions', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'wear_count', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default fashionstylistBlueprint;
