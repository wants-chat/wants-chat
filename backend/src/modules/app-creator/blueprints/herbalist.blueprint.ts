import { Blueprint } from './blueprint.interface';

/**
 * Herbalist Practice Blueprint
 */
export const herbalistBlueprint: Blueprint = {
  appType: 'herbalist',
  description: 'Herbalist practice with clients, consultations, formulas, and herbal products',

  coreEntities: ['client', 'consultation', 'formula', 'herb', 'product', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Consultations', path: '/consultations', icon: 'Calendar' },
        { label: 'Formulas', path: '/formulas', icon: 'FlaskConical' },
        { label: 'Herbs', path: '/herbs', icon: 'Leaf' },
        { label: 'Products', path: '/products', icon: 'Package' },
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
    { path: '/formulas', name: 'Formulas', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'formula-table', component: 'data-table', entity: 'formula', position: 'main' },
    ]},
    { path: '/herbs', name: 'Herbs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'herb-grid', component: 'product-grid', entity: 'herb', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
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
    { method: 'GET', path: '/formulas', entity: 'formula', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/herbs', entity: 'herb', operation: 'list' },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'health_history', type: 'json' },
        { name: 'current_symptoms', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'diet_info', type: 'json' },
        { name: 'constitution_type', type: 'enum' },
        { name: 'health_goals', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'consultation' },
        { type: 'hasMany', target: 'formula' },
      ],
    },
    consultation: {
      defaultFields: [
        { name: 'consultation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'consultation_type', type: 'enum', required: true },
        { name: 'chief_complaints', type: 'json' },
        { name: 'assessment', type: 'text' },
        { name: 'tongue_diagnosis', type: 'text' },
        { name: 'pulse_diagnosis', type: 'text' },
        { name: 'recommendations', type: 'json' },
        { name: 'formulas_prescribed', type: 'json' },
        { name: 'diet_recommendations', type: 'json' },
        { name: 'lifestyle_recommendations', type: 'json' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    formula: {
      defaultFields: [
        { name: 'formula_name', type: 'string', required: true },
        { name: 'formula_type', type: 'enum', required: true },
        { name: 'purpose', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'herbs', type: 'json' },
        { name: 'dosage', type: 'string' },
        { name: 'preparation_method', type: 'enum' },
        { name: 'instructions', type: 'text' },
        { name: 'contraindications', type: 'json' },
        { name: 'duration_weeks', type: 'integer' },
        { name: 'batch_number', type: 'string' },
        { name: 'created_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'price', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    herb: {
      defaultFields: [
        { name: 'common_name', type: 'string', required: true },
        { name: 'botanical_name', type: 'string', required: true },
        { name: 'family', type: 'string' },
        { name: 'parts_used', type: 'json' },
        { name: 'actions', type: 'json' },
        { name: 'indications', type: 'json' },
        { name: 'contraindications', type: 'json' },
        { name: 'dosage_info', type: 'text' },
        { name: 'preparation_methods', type: 'json' },
        { name: 'safety_info', type: 'text' },
        { name: 'drug_interactions', type: 'json' },
        { name: 'origin', type: 'string' },
        { name: 'stock_quantity', type: 'decimal' },
        { name: 'unit', type: 'enum' },
        { name: 'price_per_unit', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_organic', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'product_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'benefits', type: 'json' },
        { name: 'usage_instructions', type: 'text' },
        { name: 'contraindications', type: 'json' },
        { name: 'size', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'stock_quantity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
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

export default herbalistBlueprint;
