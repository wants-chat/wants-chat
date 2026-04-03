import { Blueprint } from './blueprint.interface';

/**
 * Real Estate Brokerage Blueprint
 */
export const realestatebrokerageBlueprint: Blueprint = {
  appType: 'realestatebrokerage',
  description: 'Real estate brokerage app with agents, listings, transactions, and commissions',

  coreEntities: ['agent', 'listing', 'transaction', 'client', 'showing', 'commission'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Agents', path: '/agents', icon: 'Users' },
        { label: 'Listings', path: '/listings', icon: 'Home' },
        { label: 'Transactions', path: '/transactions', icon: 'FileSignature' },
        { label: 'Clients', path: '/clients', icon: 'UserCheck' },
        { label: 'Showings', path: '/showings', icon: 'Calendar' },
        { label: 'Commissions', path: '/commissions', icon: 'DollarSign' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-listings', component: 'data-table', entity: 'listing', position: 'main' },
    ]},
    { path: '/agents', name: 'Agents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'agent-grid', component: 'staff-grid', entity: 'agent', position: 'main' },
    ]},
    { path: '/listings', name: 'Listings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'listing', position: 'main' },
      { id: 'listing-grid', component: 'product-grid', entity: 'listing', position: 'main' },
    ]},
    { path: '/transactions', name: 'Transactions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'transaction-table', component: 'data-table', entity: 'transaction', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/showings', name: 'Showings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'showing-calendar', component: 'appointment-calendar', entity: 'showing', position: 'main' },
      { id: 'showing-list', component: 'appointment-list', entity: 'showing', position: 'main' },
    ]},
    { path: '/commissions', name: 'Commissions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'commission-table', component: 'data-table', entity: 'commission', position: 'main' },
    ]},
    { path: '/properties', name: 'Browse Properties', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'listing', position: 'main' },
      { id: 'property-grid', component: 'product-grid', entity: 'listing', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/agents', entity: 'agent', operation: 'list' },
    { method: 'POST', path: '/agents', entity: 'agent', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/listings', entity: 'listing', operation: 'list' },
    { method: 'POST', path: '/listings', entity: 'listing', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/transactions', entity: 'transaction', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/transactions', entity: 'transaction', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/showings', entity: 'showing', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/showings', entity: 'showing', operation: 'create' },
    { method: 'GET', path: '/commissions', entity: 'commission', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    agent: {
      defaultFields: [
        { name: 'agent_name', type: 'string', required: true },
        { name: 'license_number', type: 'string', required: true },
        { name: 'license_expiry', type: 'date' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specializations', type: 'json' },
        { name: 'service_areas', type: 'json' },
        { name: 'commission_split', type: 'decimal' },
        { name: 'hire_date', type: 'date' },
        { name: 'total_sales', type: 'decimal' },
        { name: 'active_listings', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'listing' },
        { type: 'hasMany', target: 'transaction' },
        { type: 'hasMany', target: 'client' },
      ],
    },
    listing: {
      defaultFields: [
        { name: 'mls_number', type: 'string', required: true },
        { name: 'listing_type', type: 'enum', required: true },
        { name: 'property_type', type: 'enum', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'list_price', type: 'decimal', required: true },
        { name: 'bedrooms', type: 'integer' },
        { name: 'bathrooms', type: 'decimal' },
        { name: 'square_feet', type: 'integer' },
        { name: 'lot_size', type: 'decimal' },
        { name: 'year_built', type: 'integer' },
        { name: 'features', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'virtual_tour_url', type: 'string' },
        { name: 'list_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'days_on_market', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'agent' },
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'showing' },
      ],
    },
    transaction: {
      defaultFields: [
        { name: 'transaction_number', type: 'string', required: true },
        { name: 'transaction_type', type: 'enum', required: true },
        { name: 'property_address', type: 'json', required: true },
        { name: 'sale_price', type: 'decimal', required: true },
        { name: 'contract_date', type: 'date', required: true },
        { name: 'closing_date', type: 'date' },
        { name: 'buyer_name', type: 'string' },
        { name: 'seller_name', type: 'string' },
        { name: 'commission_rate', type: 'decimal' },
        { name: 'commission_amount', type: 'decimal' },
        { name: 'escrow_company', type: 'string' },
        { name: 'title_company', type: 'string' },
        { name: 'lender', type: 'string' },
        { name: 'documents', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'agent' },
        { type: 'belongsTo', target: 'listing' },
        { type: 'hasOne', target: 'commission' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'client_type', type: 'enum', required: true },
        { name: 'preferred_areas', type: 'json' },
        { name: 'budget_min', type: 'decimal' },
        { name: 'budget_max', type: 'decimal' },
        { name: 'property_preferences', type: 'json' },
        { name: 'pre_approved', type: 'boolean' },
        { name: 'lender_info', type: 'json' },
        { name: 'source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'agent' },
        { type: 'hasMany', target: 'showing' },
      ],
    },
    showing: {
      defaultFields: [
        { name: 'showing_date', type: 'date', required: true },
        { name: 'showing_time', type: 'datetime', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'buyer_name', type: 'string', required: true },
        { name: 'buyer_phone', type: 'phone' },
        { name: 'buyer_email', type: 'email' },
        { name: 'buyer_agent', type: 'string' },
        { name: 'feedback', type: 'text' },
        { name: 'interest_level', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'listing' },
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'agent' },
      ],
    },
    commission: {
      defaultFields: [
        { name: 'sale_price', type: 'decimal', required: true },
        { name: 'total_commission', type: 'decimal', required: true },
        { name: 'listing_side', type: 'decimal' },
        { name: 'buyer_side', type: 'decimal' },
        { name: 'brokerage_split', type: 'decimal' },
        { name: 'agent_split', type: 'decimal' },
        { name: 'referral_fee', type: 'decimal' },
        { name: 'net_to_agent', type: 'decimal' },
        { name: 'closing_date', type: 'date' },
        { name: 'paid_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'transaction' },
        { type: 'belongsTo', target: 'agent' },
      ],
    },
  },
};

export default realestatebrokerageBlueprint;
