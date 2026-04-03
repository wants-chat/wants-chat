import { Blueprint } from './blueprint.interface';

/**
 * Title Company Blueprint
 */
export const titlecompanyBlueprint: Blueprint = {
  appType: 'titlecompany',
  description: 'Title company app with orders, closings, title searches, and escrow management',

  coreEntities: ['order', 'closing', 'title_search', 'escrow', 'document', 'contact'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'FileText' },
        { label: 'Closings', path: '/closings', icon: 'Calendar' },
        { label: 'Title Searches', path: '/searches', icon: 'Search' },
        { label: 'Escrow', path: '/escrow', icon: 'Wallet' },
        { label: 'Documents', path: '/documents', icon: 'FolderOpen' },
        { label: 'Contacts', path: '/contacts', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-closings', component: 'appointment-list', entity: 'closing', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/closings', name: 'Closings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'closing-calendar', component: 'appointment-calendar', entity: 'closing', position: 'main' },
      { id: 'closing-list', component: 'data-table', entity: 'closing', position: 'main' },
    ]},
    { path: '/searches', name: 'Title Searches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search-table', component: 'data-table', entity: 'title_search', position: 'main' },
    ]},
    { path: '/escrow', name: 'Escrow', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'escrow-table', component: 'data-table', entity: 'escrow', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/contacts', name: 'Contacts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'contact-table', component: 'data-table', entity: 'contact', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/closings', entity: 'closing', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/closings', entity: 'closing', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/searches', entity: 'title_search', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/searches', entity: 'title_search', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/escrow', entity: 'escrow', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/escrow', entity: 'escrow', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/contacts', entity: 'contact', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    order: {
      defaultFields: [
        { name: 'file_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'transaction_type', type: 'enum', required: true },
        { name: 'property_address', type: 'json', required: true },
        { name: 'sale_price', type: 'decimal' },
        { name: 'loan_amount', type: 'decimal' },
        { name: 'buyer_names', type: 'json' },
        { name: 'seller_names', type: 'json' },
        { name: 'lender', type: 'string' },
        { name: 'real_estate_agent', type: 'string' },
        { name: 'closing_date', type: 'date' },
        { name: 'assigned_to', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasOne', target: 'closing' },
        { type: 'hasOne', target: 'title_search' },
        { type: 'hasOne', target: 'escrow' },
        { type: 'hasMany', target: 'document' },
      ],
    },
    closing: {
      defaultFields: [
        { name: 'closing_date', type: 'date', required: true },
        { name: 'closing_time', type: 'datetime', required: true },
        { name: 'closing_type', type: 'enum', required: true },
        { name: 'location', type: 'json' },
        { name: 'closer', type: 'string' },
        { name: 'notary', type: 'string' },
        { name: 'buyer_attending', type: 'json' },
        { name: 'seller_attending', type: 'json' },
        { name: 'documents_required', type: 'json' },
        { name: 'funds_due', type: 'decimal' },
        { name: 'wire_instructions_sent', type: 'boolean' },
        { name: 'closing_disclosure', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
      ],
    },
    title_search: {
      defaultFields: [
        { name: 'search_date', type: 'date', required: true },
        { name: 'search_type', type: 'enum', required: true },
        { name: 'searcher', type: 'string' },
        { name: 'property_legal_description', type: 'text' },
        { name: 'vesting_deed', type: 'json' },
        { name: 'chain_of_title', type: 'json' },
        { name: 'liens', type: 'json' },
        { name: 'judgments', type: 'json' },
        { name: 'taxes', type: 'json' },
        { name: 'easements', type: 'json' },
        { name: 'exceptions', type: 'json' },
        { name: 'commitment_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
      ],
    },
    escrow: {
      defaultFields: [
        { name: 'escrow_number', type: 'string', required: true },
        { name: 'earnest_money', type: 'decimal' },
        { name: 'earnest_received_date', type: 'date' },
        { name: 'earnest_held_by', type: 'string' },
        { name: 'buyer_funds', type: 'decimal' },
        { name: 'seller_proceeds', type: 'decimal' },
        { name: 'lender_funds', type: 'decimal' },
        { name: 'disbursements', type: 'json' },
        { name: 'wire_received', type: 'boolean' },
        { name: 'wire_date', type: 'date' },
        { name: 'funded_date', type: 'date' },
        { name: 'recorded_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_name', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'uploaded_date', type: 'date' },
        { name: 'uploaded_by', type: 'string' },
        { name: 'file_url', type: 'string' },
        { name: 'file_size', type: 'integer' },
        { name: 'recording_number', type: 'string' },
        { name: 'recorded_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
      ],
    },
    contact: {
      defaultFields: [
        { name: 'contact_type', type: 'enum', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'company_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'fax', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'license_number', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default titlecompanyBlueprint;
