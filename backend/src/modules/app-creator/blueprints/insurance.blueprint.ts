import { Blueprint } from './blueprint.interface';

/**
 * Insurance Blueprint
 *
 * Defines the structure for an insurance management application:
 * - Policies management
 * - Claims processing
 * - Quotes
 * - Customers
 * - Agents
 * - Documents
 */
export const insuranceBlueprint: Blueprint = {
  appType: 'insurance',
  description: 'Insurance app with policies, claims, quotes, and customer management',

  coreEntities: ['policy', 'claim', 'quote', 'customer', 'agent', 'document', 'payment'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Dashboard
    {
      path: '/',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
              { label: 'Policies', path: '/policies', icon: 'Shield' },
              { label: 'Claims', path: '/claims', icon: 'FileText' },
              { label: 'Quotes', path: '/quotes', icon: 'Calculator' },
              { label: 'Customers', path: '/customers', icon: 'Users' },
              { label: 'Payments', path: '/payments', icon: 'CreditCard' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'insurance-stats',
          position: 'main',
        },
        {
          id: 'recent-claims',
          component: 'claims-list',
          entity: 'claim',
          position: 'main',
          props: {
            title: 'Recent Claims',
            limit: 5,
          },
        },
        {
          id: 'expiring-policies',
          component: 'policy-list',
          entity: 'policy',
          position: 'main',
          props: {
            title: 'Expiring Soon',
            status: 'expiring',
          },
        },
      ],
    },
    // Policies
    {
      path: '/policies',
      name: 'Policies',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'policy-filters',
          component: 'policy-filters',
          position: 'main',
        },
        {
          id: 'policies-table',
          component: 'policy-table',
          entity: 'policy',
          position: 'main',
        },
      ],
    },
    // Policy Detail
    {
      path: '/policies/:id',
      name: 'Policy Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'policy-detail',
          component: 'policy-detail',
          entity: 'policy',
          position: 'main',
        },
        {
          id: 'policy-documents',
          component: 'document-list',
          entity: 'document',
          position: 'main',
          props: {
            title: 'Policy Documents',
          },
        },
        {
          id: 'policy-claims',
          component: 'claims-list',
          entity: 'claim',
          position: 'main',
          props: {
            title: 'Related Claims',
          },
        },
      ],
    },
    // New Policy
    {
      path: '/policies/new',
      name: 'New Policy',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'policy-form',
          component: 'policy-form',
          entity: 'policy',
          position: 'main',
        },
      ],
    },
    // Claims
    {
      path: '/claims',
      name: 'Claims',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'claims-stats',
          component: 'claims-stats',
          position: 'main',
        },
        {
          id: 'claims-table',
          component: 'claims-table',
          entity: 'claim',
          position: 'main',
        },
      ],
    },
    // Claim Detail
    {
      path: '/claims/:id',
      name: 'Claim Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'claim-detail',
          component: 'claim-detail',
          entity: 'claim',
          position: 'main',
        },
        {
          id: 'claim-timeline',
          component: 'claim-timeline',
          entity: 'claim',
          position: 'main',
        },
        {
          id: 'claim-documents',
          component: 'document-list',
          entity: 'document',
          position: 'main',
        },
      ],
    },
    // File Claim
    {
      path: '/claims/new',
      name: 'File Claim',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'claim-form',
          component: 'claim-form',
          entity: 'claim',
          position: 'main',
        },
      ],
    },
    // Quotes
    {
      path: '/quotes',
      name: 'Quotes',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'quotes-list',
          component: 'quote-list',
          entity: 'quote',
          position: 'main',
        },
      ],
    },
    // Get Quote
    {
      path: '/quotes/new',
      name: 'Get Quote',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'quote-wizard',
          component: 'quote-wizard',
          entity: 'quote',
          position: 'main',
        },
      ],
    },
    // Customers
    {
      path: '/customers',
      name: 'Customers',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'customers-table',
          component: 'data-table',
          entity: 'customer',
          position: 'main',
          props: {
            title: 'Customers',
            showCreate: true,
            columns: ['name', 'email', 'phone', 'policies_count', 'created_at'],
          },
        },
      ],
    },
    // Customer Detail
    {
      path: '/customers/:id',
      name: 'Customer Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'customer-profile',
          component: 'customer-profile',
          entity: 'customer',
          position: 'main',
        },
        {
          id: 'customer-policies',
          component: 'policy-list',
          entity: 'policy',
          position: 'main',
          props: {
            title: 'Policies',
          },
        },
      ],
    },
    // Payments
    {
      path: '/payments',
      name: 'Payments',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'payments-table',
          component: 'payment-table',
          entity: 'payment',
          position: 'main',
        },
      ],
    },
  ],

  endpoints: [
    // Policies
    { method: 'GET', path: '/policies', entity: 'policy', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/policies/:id', entity: 'policy', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/policies', entity: 'policy', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/policies/:id', entity: 'policy', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/policies/:id/claims', entity: 'claim', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/policies/:id/documents', entity: 'document', operation: 'list', requiresAuth: true },

    // Claims
    { method: 'GET', path: '/claims', entity: 'claim', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/claims/:id', entity: 'claim', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/claims', entity: 'claim', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/claims/:id', entity: 'claim', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/claims/:id/status', entity: 'claim', operation: 'update', requiresAuth: true },

    // Quotes
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create', requiresAuth: true },
    { method: 'POST', path: '/quotes/:id/convert', entity: 'policy', operation: 'create', requiresAuth: true },

    // Customers
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers/:id', entity: 'customer', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/customers', entity: 'customer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/customers/:id/policies', entity: 'policy', operation: 'list', requiresAuth: true },

    // Documents
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/documents', entity: 'document', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/documents/:id', entity: 'document', operation: 'delete', requiresAuth: true },

    // Payments
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/payments', entity: 'payment', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    policy: {
      defaultFields: [
        { name: 'policy_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'premium_amount', type: 'decimal', required: true },
        { name: 'coverage_amount', type: 'decimal', required: true },
        { name: 'deductible', type: 'decimal' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'payment_frequency', type: 'enum' },
        { name: 'coverage_details', type: 'json' },
        { name: 'beneficiaries', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'agent' },
        { type: 'hasMany', target: 'claim' },
        { type: 'hasMany', target: 'document' },
        { type: 'hasMany', target: 'payment' },
      ],
    },
    claim: {
      defaultFields: [
        { name: 'claim_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'incident_date', type: 'date', required: true },
        { name: 'filed_date', type: 'date', required: true },
        { name: 'amount_claimed', type: 'decimal', required: true },
        { name: 'amount_approved', type: 'decimal' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'denial_reason', type: 'text' },
        { name: 'adjuster_notes', type: 'text' },
        { name: 'evidence', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'policy' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'document' },
      ],
    },
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'premium_estimate', type: 'decimal', required: true },
        { name: 'coverage_amount', type: 'decimal', required: true },
        { name: 'valid_until', type: 'date', required: true },
        { name: 'details', type: 'json' },
        { name: 'risk_assessment', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'agent' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'identification', type: 'json' },
        { name: 'occupation', type: 'string' },
        { name: 'risk_profile', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'policy' },
        { type: 'hasMany', target: 'claim' },
        { type: 'hasMany', target: 'quote' },
      ],
    },
    agent: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'commission_rate', type: 'decimal' },
        { name: 'specializations', type: 'json' },
        { name: 'avatar_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'policy' },
        { type: 'hasMany', target: 'quote' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'file_url', type: 'file', required: true },
        { name: 'file_size', type: 'integer' },
        { name: 'mime_type', type: 'string' },
        { name: 'description', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'policy' },
        { type: 'belongsTo', target: 'claim' },
      ],
    },
    payment: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'reference', type: 'string' },
        { name: 'due_date', type: 'date' },
        { name: 'paid_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'policy' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default insuranceBlueprint;
