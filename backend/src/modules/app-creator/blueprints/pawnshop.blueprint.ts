import { Blueprint } from './blueprint.interface';

/**
 * Pawn Shop Blueprint
 */
export const pawnshopBlueprint: Blueprint = {
  appType: 'pawnshop',
  description: 'Pawn shop app with pawns, loans, inventory, and sales',

  coreEntities: ['pawn', 'loan', 'item', 'customer', 'sale', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Pawns', path: '/pawns', icon: 'Handshake' },
        { label: 'Loans', path: '/loans', icon: 'DollarSign' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Sales', path: '/sales', icon: 'ShoppingCart' },
        { label: 'Payments', path: '/payments', icon: 'CreditCard' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'expiring-pawns', component: 'data-table', entity: 'pawn', position: 'main' },
    ]},
    { path: '/pawns', name: 'Pawns', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pawn-table', component: 'data-table', entity: 'pawn', position: 'main' },
    ]},
    { path: '/loans', name: 'Loans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'loan-table', component: 'data-table', entity: 'loan', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'item', position: 'main' },
      { id: 'item-grid', component: 'product-grid', entity: 'item', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/sales', name: 'Sales', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sale-table', component: 'data-table', entity: 'sale', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'data-table', entity: 'payment', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'item', position: 'main' },
      { id: 'item-display', component: 'product-grid', entity: 'item', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/pawns', entity: 'pawn', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/pawns', entity: 'pawn', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/loans', entity: 'loan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'item', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sales', entity: 'sale', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sales', entity: 'sale', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/payments', entity: 'payment', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    pawn: {
      defaultFields: [
        { name: 'pawn_ticket', type: 'string', required: true },
        { name: 'pawn_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date', required: true },
        { name: 'item_description', type: 'text', required: true },
        { name: 'category', type: 'enum' },
        { name: 'serial_number', type: 'string' },
        { name: 'appraised_value', type: 'decimal' },
        { name: 'loan_amount', type: 'decimal', required: true },
        { name: 'interest_rate', type: 'decimal', required: true },
        { name: 'storage_fee', type: 'decimal' },
        { name: 'redemption_amount', type: 'decimal' },
        { name: 'extensions', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'loan' },
      ],
    },
    loan: {
      defaultFields: [
        { name: 'loan_number', type: 'string', required: true },
        { name: 'loan_date', type: 'date', required: true },
        { name: 'principal', type: 'decimal', required: true },
        { name: 'interest_rate', type: 'decimal', required: true },
        { name: 'interest_accrued', type: 'decimal' },
        { name: 'fees', type: 'decimal' },
        { name: 'total_due', type: 'decimal' },
        { name: 'due_date', type: 'date', required: true },
        { name: 'payments_made', type: 'json' },
        { name: 'balance', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'pawn' },
        { type: 'hasMany', target: 'payment' },
      ],
    },
    item: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'condition', type: 'enum' },
        { name: 'acquisition_type', type: 'enum' },
        { name: 'cost', type: 'decimal' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'hold_until', type: 'date' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'id_type', type: 'enum' },
        { name: 'id_number', type: 'string' },
        { name: 'id_expiry', type: 'date' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'fingerprint_on_file', type: 'boolean' },
        { name: 'active_pawns', type: 'integer' },
        { name: 'total_loans', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'pawn' },
        { type: 'hasMany', target: 'loan' },
        { type: 'hasMany', target: 'sale' },
      ],
    },
    sale: {
      defaultFields: [
        { name: 'sale_number', type: 'string', required: true },
        { name: 'sale_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'cashier', type: 'string' },
        { name: 'hold_period', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    payment: {
      defaultFields: [
        { name: 'payment_number', type: 'string', required: true },
        { name: 'payment_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'payment_type', type: 'enum', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'applied_to_principal', type: 'decimal' },
        { name: 'applied_to_interest', type: 'decimal' },
        { name: 'applied_to_fees', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'loan' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default pawnshopBlueprint;
