import { Blueprint } from './blueprint.interface';

/**
 * Aromatherapy Practice Blueprint
 */
export const aromatherapyBlueprint: Blueprint = {
  appType: 'aromatherapy',
  description: 'Aromatherapy practice with clients, consultations, blends, and essential oil products',

  coreEntities: ['client', 'consultation', 'blend', 'product', 'order', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Consultations', path: '/consultations', icon: 'Calendar' },
        { label: 'Blends', path: '/blends', icon: 'FlaskConical' },
        { label: 'Products', path: '/products', icon: 'Droplets' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-consultations', component: 'appointment-list', entity: 'consultation', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/consultations', name: 'Consultations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consultation-calendar', component: 'appointment-calendar', entity: 'consultation', position: 'main' },
    ]},
    { path: '/blends', name: 'Blends', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'blend-grid', component: 'product-grid', entity: 'blend', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'consultation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/consultations', entity: 'consultation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/consultations', entity: 'consultation', operation: 'create' },
    { method: 'GET', path: '/blends', entity: 'blend', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'health_concerns', type: 'json' },
        { name: 'wellness_goals', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'skin_sensitivities', type: 'text' },
        { name: 'favorite_scents', type: 'json' },
        { name: 'disliked_scents', type: 'json' },
        { name: 'pregnancy_status', type: 'boolean' },
        { name: 'medications', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'consultation' },
        { type: 'hasMany', target: 'blend' },
        { type: 'hasMany', target: 'order' },
      ],
    },
    consultation: {
      defaultFields: [
        { name: 'consultation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'consultation_type', type: 'enum', required: true },
        { name: 'concerns_discussed', type: 'json' },
        { name: 'scent_preferences', type: 'json' },
        { name: 'oils_recommended', type: 'json' },
        { name: 'blends_created', type: 'json' },
        { name: 'usage_instructions', type: 'text' },
        { name: 'safety_notes', type: 'text' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    blend: {
      defaultFields: [
        { name: 'blend_name', type: 'string', required: true },
        { name: 'blend_type', type: 'enum', required: true },
        { name: 'purpose', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'essential_oils', type: 'json' },
        { name: 'carrier_oil', type: 'string' },
        { name: 'dilution_ratio', type: 'string' },
        { name: 'usage_method', type: 'enum' },
        { name: 'usage_instructions', type: 'text' },
        { name: 'contraindications', type: 'json' },
        { name: 'batch_number', type: 'string' },
        { name: 'created_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'price', type: 'decimal' },
        { name: 'image_url', type: 'image' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'product_type', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'botanical_name', type: 'string' },
        { name: 'origin', type: 'string' },
        { name: 'extraction_method', type: 'string' },
        { name: 'therapeutic_properties', type: 'json' },
        { name: 'safety_info', type: 'text' },
        { name: 'size_options', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'stock_quantity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_organic', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'shipping_address', type: 'json' },
        { name: 'shipping_method', type: 'enum' },
        { name: 'tracking_number', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
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
        { type: 'belongsTo', target: 'order' },
      ],
    },
  },
};

export default aromatherapyBlueprint;
