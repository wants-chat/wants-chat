import { Blueprint } from './blueprint.interface';

/**
 * Memory Care Blueprint
 */
export const memorycareBlueprint: Blueprint = {
  appType: 'memorycare',
  description: 'Memory care facility with residents, care plans, therapies, and family communication',

  coreEntities: ['resident', 'careplan', 'therapy', 'staff', 'familyupdate', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Residents', path: '/residents', icon: 'Users' },
        { label: 'Care Plans', path: '/careplans', icon: 'ClipboardList' },
        { label: 'Therapies', path: '/therapies', icon: 'Calendar' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
        { label: 'Family Updates', path: '/familyupdates', icon: 'MessageCircle' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'todays-therapies', component: 'appointment-list', entity: 'therapy', position: 'main' },
    ]},
    { path: '/residents', name: 'Residents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'resident-table', component: 'data-table', entity: 'resident', position: 'main' },
    ]},
    { path: '/careplans', name: 'Care Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'careplan-table', component: 'data-table', entity: 'careplan', position: 'main' },
    ]},
    { path: '/therapies', name: 'Therapies', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapy-calendar', component: 'appointment-calendar', entity: 'therapy', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/familyupdates', name: 'Family Updates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'familyupdate-table', component: 'data-table', entity: 'familyupdate', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/residents', entity: 'resident', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/residents', entity: 'resident', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/careplans', entity: 'careplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/therapies', entity: 'therapy', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/therapies', entity: 'therapy', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/familyupdates', entity: 'familyupdate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/familyupdates', entity: 'familyupdate', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    resident: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'photo_url', type: 'image' },
        { name: 'room_number', type: 'string' },
        { name: 'admission_date', type: 'date' },
        { name: 'diagnosis', type: 'enum' },
        { name: 'stage', type: 'enum' },
        { name: 'medical_history', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'dietary_needs', type: 'json' },
        { name: 'emergency_contacts', type: 'json' },
        { name: 'life_story', type: 'text' },
        { name: 'preferences', type: 'json' },
        { name: 'triggers', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasOne', target: 'careplan' },
        { type: 'hasMany', target: 'therapy' },
        { type: 'hasMany', target: 'familyupdate' },
      ],
    },
    careplan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'review_date', type: 'date' },
        { name: 'cognitive_goals', type: 'json' },
        { name: 'behavioral_goals', type: 'json' },
        { name: 'physical_goals', type: 'json' },
        { name: 'daily_routine', type: 'json' },
        { name: 'care_interventions', type: 'json' },
        { name: 'safety_measures', type: 'json' },
        { name: 'communication_strategies', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'resident' },
      ],
    },
    therapy: {
      defaultFields: [
        { name: 'therapy_name', type: 'string', required: true },
        { name: 'therapy_type', type: 'enum', required: true },
        { name: 'scheduled_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'objectives', type: 'json' },
        { name: 'engagement_level', type: 'enum' },
        { name: 'outcomes', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'resident' },
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
        { name: 'dementia_training', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'therapy' },
      ],
    },
    familyupdate: {
      defaultFields: [
        { name: 'update_date', type: 'date', required: true },
        { name: 'update_type', type: 'enum' },
        { name: 'subject', type: 'string', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'photos', type: 'json' },
        { name: 'mood_today', type: 'enum' },
        { name: 'activities_participated', type: 'json' },
        { name: 'meals_eaten', type: 'json' },
        { name: 'sleep_quality', type: 'enum' },
        { name: 'sent_to', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'resident' },
        { type: 'belongsTo', target: 'staff' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'billing_period', type: 'json' },
        { name: 'care_level_fee', type: 'decimal' },
        { name: 'room_fee', type: 'decimal' },
        { name: 'therapy_fees', type: 'decimal' },
        { name: 'additional_services', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'resident' },
      ],
    },
  },
};

export default memorycareBlueprint;
