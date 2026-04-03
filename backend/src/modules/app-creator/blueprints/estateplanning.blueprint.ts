import { Blueprint } from './blueprint.interface';

/**
 * Estate Planning Blueprint
 */
export const estateplanningBlueprint: Blueprint = {
  appType: 'estateplanning',
  description: 'Estate planning practice with clients, wills, trusts, and asset management',

  coreEntities: ['client', 'estateplan', 'meeting', 'asset', 'document', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Estate Plans', path: '/estateplans', icon: 'FileText' },
        { label: 'Meetings', path: '/meetings', icon: 'Calendar' },
        { label: 'Assets', path: '/assets', icon: 'Landmark' },
        { label: 'Documents', path: '/documents', icon: 'FolderOpen' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-meetings', component: 'appointment-list', entity: 'meeting', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/estateplans', name: 'Estate Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estateplan-table', component: 'data-table', entity: 'estateplan', position: 'main' },
    ]},
    { path: '/meetings', name: 'Meetings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'meeting-calendar', component: 'appointment-calendar', entity: 'meeting', position: 'main' },
    ]},
    { path: '/assets', name: 'Assets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'asset-table', component: 'data-table', entity: 'asset', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'meeting', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/estateplans', entity: 'estateplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/meetings', entity: 'meeting', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/meetings', entity: 'meeting', operation: 'create' },
    { method: 'GET', path: '/assets', entity: 'asset', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
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
        { name: 'spouse_name', type: 'string' },
        { name: 'spouse_dob', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'children', type: 'json' },
        { name: 'beneficiaries', type: 'json' },
        { name: 'estate_size', type: 'enum' },
        { name: 'planning_goals', type: 'json' },
        { name: 'existing_documents', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'estateplan' },
        { type: 'hasMany', target: 'meeting' },
        { type: 'hasMany', target: 'asset' },
      ],
    },
    estateplan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'plan_type', type: 'enum', required: true },
        { name: 'created_date', type: 'date' },
        { name: 'last_review', type: 'date' },
        { name: 'next_review', type: 'date' },
        { name: 'will_info', type: 'json' },
        { name: 'trust_info', type: 'json' },
        { name: 'power_of_attorney', type: 'json' },
        { name: 'healthcare_directive', type: 'json' },
        { name: 'beneficiary_designations', type: 'json' },
        { name: 'guardianship', type: 'json' },
        { name: 'tax_planning', type: 'json' },
        { name: 'charitable_giving', type: 'json' },
        { name: 'business_succession', type: 'json' },
        { name: 'estimated_estate_value', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    meeting: {
      defaultFields: [
        { name: 'meeting_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'meeting_type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'attendees', type: 'json' },
        { name: 'agenda', type: 'json' },
        { name: 'topics_covered', type: 'json' },
        { name: 'decisions_made', type: 'json' },
        { name: 'action_items', type: 'json' },
        { name: 'documents_discussed', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    asset: {
      defaultFields: [
        { name: 'asset_name', type: 'string', required: true },
        { name: 'asset_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'ownership_type', type: 'enum' },
        { name: 'current_value', type: 'decimal' },
        { name: 'acquisition_date', type: 'date' },
        { name: 'acquisition_cost', type: 'decimal' },
        { name: 'location', type: 'string' },
        { name: 'account_number', type: 'string' },
        { name: 'institution', type: 'string' },
        { name: 'beneficiaries', type: 'json' },
        { name: 'titled_in', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_name', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'execution_date', type: 'date' },
        { name: 'effective_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'file_url', type: 'string' },
        { name: 'is_signed', type: 'boolean' },
        { name: 'witnesses', type: 'json' },
        { name: 'notarized', type: 'boolean' },
        { name: 'location_of_original', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'estateplan' },
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
        { name: 'retainer_applied', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default estateplanningBlueprint;
