import { Blueprint } from './blueprint.interface';

/**
 * Translation Agency Blueprint
 */
export const translationagencyBlueprint: Blueprint = {
  appType: 'translationagency',
  description: 'Translation agency app with projects, translators, languages, and client management',

  coreEntities: ['project', 'translator', 'client', 'document', 'quote', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Folder' },
        { label: 'Translators', path: '/translators', icon: 'Users' },
        { label: 'Clients', path: '/clients', icon: 'Briefcase' },
        { label: 'Documents', path: '/documents', icon: 'FileText' },
        { label: 'Quotes', path: '/quotes', icon: 'Calculator' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/translators', name: 'Translators', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'translator-grid', component: 'staff-grid', entity: 'translator', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'data-table', entity: 'quote', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/get-quote', name: 'Get Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-wizard', component: 'booking-wizard', entity: 'quote', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/translators', entity: 'translator', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'source_language', type: 'string', required: true },
        { name: 'target_languages', type: 'json', required: true },
        { name: 'word_count', type: 'integer' },
        { name: 'deadline', type: 'datetime', required: true },
        { name: 'service_level', type: 'enum' },
        { name: 'subject_area', type: 'enum' },
        { name: 'instructions', type: 'text' },
        { name: 'glossary_url', type: 'string' },
        { name: 'tm_url', type: 'string' },
        { name: 'budget', type: 'decimal' },
        { name: 'actual_cost', type: 'decimal' },
        { name: 'progress_percent', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'document' },
        { type: 'hasMany', target: 'translator' },
      ],
    },
    translator: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'native_language', type: 'string', required: true },
        { name: 'language_pairs', type: 'json', required: true },
        { name: 'specializations', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'years_experience', type: 'integer' },
        { name: 'rate_per_word', type: 'decimal' },
        { name: 'rate_per_hour', type: 'decimal' },
        { name: 'cat_tools', type: 'json' },
        { name: 'avg_daily_output', type: 'integer' },
        { name: 'availability', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'industry', type: 'string' },
        { name: 'preferred_languages', type: 'json' },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_terms', type: 'string' },
        { name: 'discount_percent', type: 'decimal' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'quote' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_name', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'source_language', type: 'string' },
        { name: 'target_language', type: 'string' },
        { name: 'word_count', type: 'integer' },
        { name: 'source_file_url', type: 'string' },
        { name: 'translated_file_url', type: 'string' },
        { name: 'tm_match_percent', type: 'integer' },
        { name: 'review_status', type: 'enum' },
        { name: 'qa_score', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'translator' },
      ],
    },
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'quote_date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'source_language', type: 'string' },
        { name: 'target_languages', type: 'json' },
        { name: 'word_count', type: 'integer' },
        { name: 'service_type', type: 'enum' },
        { name: 'rate_per_word', type: 'decimal' },
        { name: 'rush_fee', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'turnaround_time', type: 'string' },
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
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'project' },
      ],
    },
  },
};

export default translationagencyBlueprint;
