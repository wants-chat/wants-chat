import { Blueprint } from './blueprint.interface';

/**
 * Insurance Agency Blueprint
 */
export const insuranceagencyBlueprint: Blueprint = {
  appType: 'insuranceagency',
  description: 'Insurance agency app with clients, policies, claims, quotes, and commissions',

  coreEntities: ['client', 'policy', 'claim', 'quote', 'carrier', 'commission'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Policies', path: '/policies', icon: 'Shield' },
        { label: 'Claims', path: '/claims', icon: 'FileWarning' },
        { label: 'Quotes', path: '/quotes', icon: 'Calculator' },
        { label: 'Carriers', path: '/carriers', icon: 'Building' },
        { label: 'Commissions', path: '/commissions', icon: 'DollarSign' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'renewals', component: 'data-table', entity: 'policy', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/policies', name: 'Policies', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'policy', position: 'main' },
      { id: 'policy-table', component: 'data-table', entity: 'policy', position: 'main' },
    ]},
    { path: '/claims', name: 'Claims', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'claim-table', component: 'data-table', entity: 'claim', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'data-table', entity: 'quote', position: 'main' },
    ]},
    { path: '/carriers', name: 'Carriers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'carrier-table', component: 'data-table', entity: 'carrier', position: 'main' },
    ]},
    { path: '/commissions', name: 'Commissions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'commission-table', component: 'data-table', entity: 'commission', position: 'main' },
    ]},
    { path: '/get-quote', name: 'Get a Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'quote', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/policies', entity: 'policy', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/policies', entity: 'policy', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/claims', entity: 'claim', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/claims', entity: 'claim', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create' },
    { method: 'GET', path: '/carriers', entity: 'carrier', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/commissions', entity: 'commission', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'client_number', type: 'string', required: true },
        { name: 'client_type', type: 'enum', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'business_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'assigned_agent', type: 'string' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'policy' },
        { type: 'hasMany', target: 'claim' },
        { type: 'hasMany', target: 'quote' },
      ],
    },
    policy: {
      defaultFields: [
        { name: 'policy_number', type: 'string', required: true },
        { name: 'policy_type', type: 'enum', required: true },
        { name: 'effective_date', type: 'date', required: true },
        { name: 'expiration_date', type: 'date', required: true },
        { name: 'premium', type: 'decimal', required: true },
        { name: 'payment_frequency', type: 'enum' },
        { name: 'coverage_limits', type: 'json' },
        { name: 'deductibles', type: 'json' },
        { name: 'insured_items', type: 'json' },
        { name: 'endorsements', type: 'json' },
        { name: 'agent', type: 'string' },
        { name: 'renewal_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'carrier' },
        { type: 'hasMany', target: 'claim' },
        { type: 'hasMany', target: 'commission' },
      ],
    },
    claim: {
      defaultFields: [
        { name: 'claim_number', type: 'string', required: true },
        { name: 'claim_date', type: 'date', required: true },
        { name: 'incident_date', type: 'date', required: true },
        { name: 'claim_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'estimated_loss', type: 'decimal' },
        { name: 'approved_amount', type: 'decimal' },
        { name: 'paid_amount', type: 'decimal' },
        { name: 'adjuster', type: 'string' },
        { name: 'documents', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'policy' },
      ],
    },
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'quote_date', type: 'date', required: true },
        { name: 'expiration_date', type: 'date' },
        { name: 'quote_type', type: 'enum', required: true },
        { name: 'applicant_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'coverage_requested', type: 'json' },
        { name: 'quoted_premium', type: 'decimal' },
        { name: 'carrier_quotes', type: 'json' },
        { name: 'agent', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    carrier: {
      defaultFields: [
        { name: 'carrier_name', type: 'string', required: true },
        { name: 'carrier_code', type: 'string' },
        { name: 'lines_of_business', type: 'json' },
        { name: 'am_best_rating', type: 'string' },
        { name: 'contact_name', type: 'string' },
        { name: 'contact_email', type: 'email' },
        { name: 'contact_phone', type: 'phone' },
        { name: 'portal_url', type: 'string' },
        { name: 'commission_schedule', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'policy' },
      ],
    },
    commission: {
      defaultFields: [
        { name: 'commission_date', type: 'date', required: true },
        { name: 'commission_type', type: 'enum', required: true },
        { name: 'premium_amount', type: 'decimal', required: true },
        { name: 'commission_rate', type: 'decimal', required: true },
        { name: 'commission_amount', type: 'decimal', required: true },
        { name: 'agent', type: 'string' },
        { name: 'split_details', type: 'json' },
        { name: 'paid_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'policy' },
        { type: 'belongsTo', target: 'carrier' },
      ],
    },
  },
};

export default insuranceagencyBlueprint;
