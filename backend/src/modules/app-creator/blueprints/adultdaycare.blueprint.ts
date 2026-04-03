import { Blueprint } from './blueprint.interface';

/**
 * Adult Day Care Blueprint
 */
export const adultdaycareBlueprint: Blueprint = {
  appType: 'adultdaycare',
  description: 'Adult day care center with participants, programs, staff, and transportation',

  coreEntities: ['participant', 'program', 'staff', 'attendance', 'transport', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Participants', path: '/participants', icon: 'Users' },
        { label: 'Programs', path: '/programs', icon: 'Calendar' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
        { label: 'Attendance', path: '/attendance', icon: 'ClipboardCheck' },
        { label: 'Transport', path: '/transport', icon: 'Bus' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'todays-programs', component: 'appointment-list', entity: 'program', position: 'main' },
    ]},
    { path: '/participants', name: 'Participants', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'participant-table', component: 'data-table', entity: 'participant', position: 'main' },
    ]},
    { path: '/programs', name: 'Programs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'program-calendar', component: 'appointment-calendar', entity: 'program', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/attendance', name: 'Attendance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'attendance-table', component: 'data-table', entity: 'attendance', position: 'main' },
    ]},
    { path: '/transport', name: 'Transport', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'transport-table', component: 'data-table', entity: 'transport', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/participants', entity: 'participant', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/participants', entity: 'participant', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/programs', entity: 'program', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/attendance', entity: 'attendance', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/attendance', entity: 'attendance', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/transport', entity: 'transport', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    participant: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'photo_url', type: 'image' },
        { name: 'address', type: 'json' },
        { name: 'emergency_contacts', type: 'json' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'mobility_needs', type: 'enum' },
        { name: 'care_level', type: 'enum' },
        { name: 'enrollment_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'transport_needed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'attendance' },
      ],
    },
    program: {
      defaultFields: [
        { name: 'program_name', type: 'string', required: true },
        { name: 'program_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'scheduled_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'max_participants', type: 'integer' },
        { name: 'skill_level', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'staff' },
      ],
    },
    staff: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'program' },
      ],
    },
    attendance: {
      defaultFields: [
        { name: 'attendance_date', type: 'date', required: true },
        { name: 'check_in_time', type: 'datetime' },
        { name: 'check_out_time', type: 'datetime' },
        { name: 'arrived_by', type: 'enum' },
        { name: 'departed_by', type: 'enum' },
        { name: 'meals_eaten', type: 'json' },
        { name: 'activities_participated', type: 'json' },
        { name: 'mood', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'participant' },
      ],
    },
    transport: {
      defaultFields: [
        { name: 'transport_date', type: 'date', required: true },
        { name: 'direction', type: 'enum', required: true },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'actual_time', type: 'datetime' },
        { name: 'vehicle', type: 'string' },
        { name: 'driver', type: 'string' },
        { name: 'passengers', type: 'json' },
        { name: 'route', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'billing_period', type: 'json' },
        { name: 'days_attended', type: 'integer' },
        { name: 'daily_rate', type: 'decimal' },
        { name: 'transport_fee', type: 'decimal' },
        { name: 'meal_fee', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'participant' },
      ],
    },
  },
};

export default adultdaycareBlueprint;
