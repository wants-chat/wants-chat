import { Blueprint } from './blueprint.interface';

/**
 * Bail Bonds Blueprint
 */
export const bailbondsBlueprint: Blueprint = {
  appType: 'bailbonds',
  description: 'Bail bonds agency with clients, bonds, payments, and court date tracking',

  coreEntities: ['client', 'bond', 'indemnitor', 'payment', 'courtdate', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Bonds', path: '/bonds', icon: 'FileText' },
        { label: 'Indemnitors', path: '/indemnitors', icon: 'UserCheck' },
        { label: 'Payments', path: '/payments', icon: 'DollarSign' },
        { label: 'Court Dates', path: '/courtdates', icon: 'Calendar' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-court-dates', component: 'appointment-list', entity: 'courtdate', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/bonds', name: 'Bonds', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'bond-table', component: 'data-table', entity: 'bond', position: 'main' },
    ]},
    { path: '/indemnitors', name: 'Indemnitors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'indemnitor-table', component: 'data-table', entity: 'indemnitor', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'data-table', entity: 'payment', position: 'main' },
    ]},
    { path: '/courtdates', name: 'Court Dates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'courtdate-calendar', component: 'appointment-calendar', entity: 'courtdate', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bonds', entity: 'bond', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bonds', entity: 'bond', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/indemnitors', entity: 'indemnitor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/payments', entity: 'payment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/courtdates', entity: 'courtdate', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'identification', type: 'json' },
        { name: 'employment_info', type: 'json' },
        { name: 'arrest_info', type: 'json' },
        { name: 'booking_number', type: 'string' },
        { name: 'jail_location', type: 'string' },
        { name: 'charges', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'bond' },
        { type: 'hasMany', target: 'courtdate' },
      ],
    },
    bond: {
      defaultFields: [
        { name: 'bond_number', type: 'string', required: true },
        { name: 'bond_date', type: 'date', required: true },
        { name: 'bond_type', type: 'enum', required: true },
        { name: 'bond_amount', type: 'decimal', required: true },
        { name: 'premium', type: 'decimal', required: true },
        { name: 'collateral', type: 'json' },
        { name: 'collateral_value', type: 'decimal' },
        { name: 'court', type: 'string' },
        { name: 'case_number', type: 'string' },
        { name: 'charges', type: 'json' },
        { name: 'expiration_date', type: 'date' },
        { name: 'forfeiture_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'indemnitor' },
        { type: 'hasMany', target: 'payment' },
        { type: 'hasMany', target: 'courtdate' },
      ],
    },
    indemnitor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'relationship', type: 'string' },
        { name: 'phone', type: 'phone' },
        { name: 'email', type: 'email' },
        { name: 'address', type: 'json' },
        { name: 'identification', type: 'json' },
        { name: 'employment_info', type: 'json' },
        { name: 'income', type: 'decimal' },
        { name: 'assets', type: 'json' },
        { name: 'indemnity_signed', type: 'boolean' },
        { name: 'signature_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'bond' },
      ],
    },
    payment: {
      defaultFields: [
        { name: 'payment_date', type: 'date', required: true },
        { name: 'payment_type', type: 'enum', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'reference_number', type: 'string' },
        { name: 'received_by', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'bond' },
        { type: 'belongsTo', target: 'indemnitor' },
      ],
    },
    courtdate: {
      defaultFields: [
        { name: 'court_date', type: 'date', required: true },
        { name: 'court_time', type: 'datetime' },
        { name: 'court_name', type: 'string', required: true },
        { name: 'courtroom', type: 'string' },
        { name: 'judge', type: 'string' },
        { name: 'hearing_type', type: 'enum' },
        { name: 'case_number', type: 'string' },
        { name: 'appeared', type: 'boolean' },
        { name: 'outcome', type: 'text' },
        { name: 'next_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'bond' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'premium_amount', type: 'decimal' },
        { name: 'fees', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'payments_received', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'bond' },
      ],
    },
  },
};

export default bailbondsBlueprint;
