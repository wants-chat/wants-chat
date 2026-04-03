import { Blueprint } from './blueprint.interface';

/**
 * Voice Over Agency Blueprint
 */
export const voiceoverBlueprint: Blueprint = {
  appType: 'voiceover',
  description: 'Voice over agency app with talent, projects, auditions, and bookings',

  coreEntities: ['talent', 'project', 'audition', 'booking', 'client', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Talent', path: '/talent', icon: 'Mic' },
        { label: 'Projects', path: '/projects', icon: 'Folder' },
        { label: 'Auditions', path: '/auditions', icon: 'Headphones' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/talent', name: 'Talent', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'talent-grid', component: 'staff-grid', entity: 'talent', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/auditions', name: 'Auditions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'audition-table', component: 'data-table', entity: 'audition', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/roster', name: 'Roster', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'talent-grid', component: 'staff-grid', entity: 'talent', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/talent', entity: 'talent', operation: 'list' },
    { method: 'POST', path: '/talent', entity: 'talent', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/auditions', entity: 'audition', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/auditions', entity: 'audition', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    talent: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'stage_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'gender', type: 'enum' },
        { name: 'age_range', type: 'string' },
        { name: 'voice_type', type: 'enum' },
        { name: 'accent', type: 'string' },
        { name: 'languages', type: 'json' },
        { name: 'specializations', type: 'json' },
        { name: 'demo_reels', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'project_rate', type: 'decimal' },
        { name: 'home_studio', type: 'boolean' },
        { name: 'turnaround_time', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'audition' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'script', type: 'text' },
        { name: 'word_count', type: 'integer' },
        { name: 'estimated_duration', type: 'integer' },
        { name: 'due_date', type: 'date' },
        { name: 'voice_requirements', type: 'json' },
        { name: 'deliverables', type: 'json' },
        { name: 'audio_specs', type: 'json' },
        { name: 'budget', type: 'decimal' },
        { name: 'actual_cost', type: 'decimal' },
        { name: 'files', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'audition' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
    audition: {
      defaultFields: [
        { name: 'audition_date', type: 'date', required: true },
        { name: 'deadline', type: 'date' },
        { name: 'script_snippet', type: 'text' },
        { name: 'direction_notes', type: 'text' },
        { name: 'audio_url', type: 'string' },
        { name: 'submitted_at', type: 'datetime' },
        { name: 'rating', type: 'integer' },
        { name: 'feedback', type: 'text' },
        { name: 'is_shortlisted', type: 'boolean' },
        { name: 'is_selected', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'talent' },
        { type: 'belongsTo', target: 'project' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_date', type: 'date', required: true },
        { name: 'session_date', type: 'date', required: true },
        { name: 'session_time', type: 'datetime' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'session_type', type: 'enum' },
        { name: 'studio_location', type: 'string' },
        { name: 'is_remote', type: 'boolean' },
        { name: 'rate', type: 'decimal' },
        { name: 'usage_rights', type: 'json' },
        { name: 'usage_duration', type: 'string' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'talent' },
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'client_type', type: 'enum' },
        { name: 'industry', type: 'string' },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_terms', type: 'string' },
        { name: 'preferred_talent', type: 'json' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
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

export default voiceoverBlueprint;
