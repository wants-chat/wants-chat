import { Blueprint } from './blueprint.interface';

/**
 * Naturopathic Medicine Blueprint
 */
export const naturopathBlueprint: Blueprint = {
  appType: 'naturopath',
  description: 'Naturopathic medicine practice with patients, treatments, remedies, and wellness plans',

  coreEntities: ['patient', 'appointment', 'treatment', 'remedy', 'wellnessplan', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Treatments', path: '/treatments', icon: 'Leaf' },
        { label: 'Remedies', path: '/remedies', icon: 'FlaskConical' },
        { label: 'Wellness Plans', path: '/wellnessplans', icon: 'ClipboardList' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/treatments', name: 'Treatments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'treatment-table', component: 'data-table', entity: 'treatment', position: 'main' },
    ]},
    { path: '/remedies', name: 'Remedies', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'remedy-grid', component: 'product-grid', entity: 'remedy', position: 'main' },
    ]},
    { path: '/wellnessplans', name: 'Wellness Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wellnessplan-table', component: 'data-table', entity: 'wellnessplan', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/treatments', entity: 'treatment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/remedies', entity: 'remedy', operation: 'list' },
    { method: 'GET', path: '/wellnessplans', entity: 'wellnessplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'health_history', type: 'json' },
        { name: 'current_symptoms', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'supplements', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'diet_info', type: 'json' },
        { name: 'lifestyle_factors', type: 'json' },
        { name: 'health_goals', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'treatment' },
        { type: 'hasMany', target: 'wellnessplan' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'appointment_type', type: 'enum', required: true },
        { name: 'reason', type: 'text' },
        { name: 'symptoms_discussed', type: 'json' },
        { name: 'findings', type: 'text' },
        { name: 'recommendations', type: 'json' },
        { name: 'remedies_prescribed', type: 'json' },
        { name: 'follow_up_instructions', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    treatment: {
      defaultFields: [
        { name: 'treatment_name', type: 'string', required: true },
        { name: 'treatment_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'indications', type: 'json' },
        { name: 'contraindications', type: 'json' },
        { name: 'protocol', type: 'text' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'frequency', type: 'string' },
        { name: 'expected_outcomes', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    remedy: {
      defaultFields: [
        { name: 'remedy_name', type: 'string', required: true },
        { name: 'remedy_type', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'benefits', type: 'json' },
        { name: 'usage_instructions', type: 'text' },
        { name: 'dosage', type: 'string' },
        { name: 'contraindications', type: 'json' },
        { name: 'price', type: 'decimal' },
        { name: 'stock_quantity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    wellnessplan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'health_goals', type: 'json' },
        { name: 'diet_recommendations', type: 'json' },
        { name: 'supplement_protocol', type: 'json' },
        { name: 'lifestyle_changes', type: 'json' },
        { name: 'exercise_recommendations', type: 'json' },
        { name: 'stress_management', type: 'json' },
        { name: 'sleep_recommendations', type: 'json' },
        { name: 'progress_notes', type: 'text' },
        { name: 'next_review_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
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
        { name: 'insurance_info', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
  },
};

export default naturopathBlueprint;
