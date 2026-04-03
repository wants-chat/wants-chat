import { Blueprint } from './blueprint.interface';

/**
 * Funeral Home Blueprint
 */
export const funeralBlueprint: Blueprint = {
  appType: 'funeral',
  description: 'Funeral home with services, arrangements, obituaries, and pre-planning',

  coreEntities: ['arrangement', 'service', 'obituary', 'preplan', 'staff', 'inventory'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Arrangements', path: '/arrangements', icon: 'FileText' },
        { label: 'Services', path: '/services', icon: 'Heart' },
        { label: 'Obituaries', path: '/obituaries', icon: 'BookOpen' },
        { label: 'Pre-Planning', path: '/preplans', icon: 'Calendar' },
        { label: 'Staff', path: '/staff', icon: 'Users' },
      ]}},
      { id: 'funeral-stats', component: 'funeral-stats', position: 'main' },
      { id: 'upcoming-services', component: 'service-list-upcoming-funeral', entity: 'service', position: 'main' },
      { id: 'recent-arrangements', component: 'arrangement-list-recent', entity: 'arrangement', position: 'main' },
    ]},
    { path: '/arrangements', name: 'Arrangements', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'arrangement-filters', component: 'arrangement-filters', entity: 'arrangement', position: 'main' },
      { id: 'arrangement-table', component: 'arrangement-table', entity: 'arrangement', position: 'main' },
    ]},
    { path: '/arrangements/:id', name: 'Arrangement Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'arrangement-header', component: 'arrangement-header', entity: 'arrangement', position: 'main' },
      { id: 'arrangement-services', component: 'arrangement-services', entity: 'service', position: 'main' },
      { id: 'arrangement-billing', component: 'arrangement-billing', entity: 'arrangement', position: 'main' },
    ]},
    { path: '/arrangements/new', name: 'New Arrangement', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'arrangement-form', component: 'arrangement-form', entity: 'arrangement', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-calendar', component: 'service-calendar-funeral', entity: 'service', position: 'main' },
    ]},
    { path: '/obituaries', name: 'Obituaries', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'obituary-list', component: 'obituary-list', entity: 'obituary', position: 'main' },
    ]},
    { path: '/obituaries/:id', name: 'Obituary Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'obituary-detail', component: 'obituary-detail', entity: 'obituary', position: 'main' },
    ]},
    { path: '/preplans', name: 'Pre-Planning', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'preplan-table', component: 'preplan-table', entity: 'preplan', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid-funeral', entity: 'staff', position: 'main' },
    ]},
    { path: '/memorial/:id', name: 'Memorial Page', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'memorial-page', component: 'public-memorial', entity: 'obituary', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/arrangements', entity: 'arrangement', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/arrangements', entity: 'arrangement', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/obituaries', entity: 'obituary', operation: 'list' },
    { method: 'GET', path: '/preplans', entity: 'preplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    arrangement: {
      defaultFields: [
        { name: 'case_number', type: 'string', required: true },
        { name: 'deceased_name', type: 'string', required: true },
        { name: 'date_of_death', type: 'date', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'contact_phone', type: 'phone', required: true },
        { name: 'contact_email', type: 'email' },
        { name: 'contact_relationship', type: 'string' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'service_date', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'total_cost', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service' },
        { type: 'hasOne', target: 'obituary' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'datetime', type: 'datetime', required: true },
        { name: 'location', type: 'string' },
        { name: 'officiant', type: 'string' },
        { name: 'music', type: 'json' },
        { name: 'readings', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'arrangement' }],
    },
    obituary: {
      defaultFields: [
        { name: 'full_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'date_of_death', type: 'date', required: true },
        { name: 'photo', type: 'image' },
        { name: 'content', type: 'text', required: true },
        { name: 'survivors', type: 'text' },
        { name: 'service_info', type: 'text' },
        { name: 'donations_info', type: 'text' },
        { name: 'is_published', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'arrangement' }],
    },
    preplan: {
      defaultFields: [
        { name: 'plan_number', type: 'string', required: true },
        { name: 'client_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'email', type: 'email' },
        { name: 'address', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'payment_plan', type: 'enum' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    staff: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'role', type: 'enum', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default funeralBlueprint;
