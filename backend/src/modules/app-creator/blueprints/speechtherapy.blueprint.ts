import { Blueprint } from './blueprint.interface';

/**
 * Speech Therapy / Speech-Language Pathology Clinic Blueprint
 */
export const speechtherapyBlueprint: Blueprint = {
  appType: 'speechtherapy',
  description: 'Speech therapy clinic app with patients, sessions, goals tracking, and progress monitoring',

  coreEntities: ['patient', 'appointment', 'session', 'treatment_plan', 'goal', 'therapist', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Sessions', path: '/sessions', icon: 'MessageSquare' },
        { label: 'Goals', path: '/goals', icon: 'Target' },
        { label: 'Therapists', path: '/therapists', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile', entity: 'patient', position: 'main' },
      { id: 'goal-progress', component: 'progress-tracker', entity: 'goal', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-list', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/goals', name: 'Goals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'goal-list', component: 'data-table', entity: 'goal', position: 'main' },
    ]},
    { path: '/therapists', name: 'Therapists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapist-grid', component: 'doctor-grid', entity: 'therapist', position: 'main' },
    ]},
    { path: '/therapists/:id', name: 'Therapist Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapist-profile', component: 'doctor-profile', entity: 'therapist', position: 'main' },
      { id: 'therapist-schedule', component: 'therapist-schedule', entity: 'appointment', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'stats-cards', position: 'main' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'online-booking', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/goals', entity: 'goal', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/therapists', entity: 'therapist', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'patient_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'insurance', type: 'json' },
        { name: 'parent_guardian', type: 'json' },
        { name: 'diagnosis', type: 'json' },
        { name: 'icd_codes', type: 'json' },
        { name: 'referral_source', type: 'string' },
        { name: 'referring_physician', type: 'json' },
        { name: 'school_info', type: 'json' },
        { name: 'medical_history', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'treatment_plan' },
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'goal' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    treatment_plan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'review_date', type: 'date' },
        { name: 'diagnosis', type: 'json' },
        { name: 'areas_of_focus', type: 'json', required: true },
        { name: 'frequency', type: 'string' },
        { name: 'session_duration', type: 'integer' },
        { name: 'parent_involvement', type: 'text' },
        { name: 'home_program', type: 'json' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
        { type: 'hasMany', target: 'goal' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'session_type', type: 'enum' },
        { name: 'modality', type: 'enum' },
        { name: 'activities', type: 'json' },
        { name: 'goals_addressed', type: 'json' },
        { name: 'patient_performance', type: 'text' },
        { name: 'data_collected', type: 'json' },
        { name: 'parent_feedback', type: 'text' },
        { name: 'homework_assigned', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
        { type: 'belongsTo', target: 'appointment' },
      ],
    },
    goal: {
      defaultFields: [
        { name: 'goal_area', type: 'enum', required: true },
        { name: 'long_term_goal', type: 'text', required: true },
        { name: 'short_term_objectives', type: 'json' },
        { name: 'baseline', type: 'text' },
        { name: 'target_criterion', type: 'string' },
        { name: 'target_date', type: 'date' },
        { name: 'current_progress', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'treatment_plan' },
      ],
    },
    therapist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'credentials', type: 'json' },
        { name: 'license_number', type: 'string' },
        { name: 'asha_number', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'populations_served', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
  },
};

export default speechtherapyBlueprint;
