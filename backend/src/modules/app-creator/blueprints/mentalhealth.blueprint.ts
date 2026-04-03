import { Blueprint } from './blueprint.interface';

/**
 * Mental Health / Therapy Practice Blueprint
 */
export const mentalhealthBlueprint: Blueprint = {
  appType: 'mentalhealth',
  description: 'Mental health practice app with patients, therapy sessions, mood tracking, and treatment plans',

  coreEntities: ['patient', 'appointment', 'session_note', 'mood_entry', 'treatment_plan', 'therapist', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Sessions', path: '/sessions', icon: 'MessageSquare' },
        { label: 'Mood Tracking', path: '/mood', icon: 'Heart' },
        { label: 'Therapists', path: '/therapists', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'mental-health-stats', component: 'mental-health-stats', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments/new', name: 'New Appointment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-form', component: 'appointment-form', entity: 'appointment', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile', entity: 'patient', position: 'main' },
      { id: 'therapy-session-notes', component: 'therapy-session-notes', entity: 'session_note', position: 'main' },
      { id: 'mood-tracker', component: 'mood-tracker', entity: 'mood_entry', position: 'main' },
    ]},
    { path: '/sessions', name: 'Session Notes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-list', component: 'data-table', entity: 'session_note', position: 'main' },
    ]},
    { path: '/mood', name: 'Mood Tracking', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'mood-list', component: 'data-table', entity: 'mood_entry', position: 'main' },
    ]},
    { path: '/therapists', name: 'Therapists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapist-grid', component: 'doctor-grid', entity: 'therapist', position: 'main' },
    ]},
    { path: '/therapists/:id', name: 'Therapist Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapist-profile', component: 'doctor-profile', entity: 'therapist', position: 'main' },
      { id: 'therapist-schedule', component: 'doctor-schedule', entity: 'appointment', position: 'main' },
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
    { method: 'GET', path: '/sessions', entity: 'session_note', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session_note', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/mood', entity: 'mood_entry', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/mood', entity: 'mood_entry', operation: 'create', requiresAuth: true },
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
        { name: 'emergency_contact', type: 'json' },
        { name: 'referral_source', type: 'string' },
        { name: 'presenting_concerns', type: 'text' },
        { name: 'diagnosis', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'risk_level', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'session_note' },
        { type: 'hasMany', target: 'mood_entry' },
        { type: 'hasMany', target: 'treatment_plan' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'modality', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
      ],
    },
    session_note: {
      defaultFields: [
        { name: 'session_date', type: 'datetime', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'presenting_issue', type: 'text' },
        { name: 'session_content', type: 'text', required: true },
        { name: 'interventions', type: 'json' },
        { name: 'client_response', type: 'text' },
        { name: 'homework', type: 'text' },
        { name: 'risk_assessment', type: 'json' },
        { name: 'next_session_goals', type: 'text' },
        { name: 'is_confidential', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
        { type: 'belongsTo', target: 'appointment' },
      ],
    },
    mood_entry: {
      defaultFields: [
        { name: 'entry_date', type: 'datetime', required: true },
        { name: 'mood_score', type: 'integer', required: true },
        { name: 'anxiety_level', type: 'integer' },
        { name: 'sleep_hours', type: 'decimal' },
        { name: 'sleep_quality', type: 'enum' },
        { name: 'energy_level', type: 'integer' },
        { name: 'activities', type: 'json' },
        { name: 'triggers', type: 'json' },
        { name: 'coping_strategies', type: 'json' },
        { name: 'journal_entry', type: 'text' },
        { name: 'medications_taken', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    treatment_plan: {
      defaultFields: [
        { name: 'start_date', type: 'date', required: true },
        { name: 'review_date', type: 'date' },
        { name: 'diagnosis', type: 'json', required: true },
        { name: 'goals', type: 'json', required: true },
        { name: 'objectives', type: 'json' },
        { name: 'interventions', type: 'json' },
        { name: 'frequency', type: 'string' },
        { name: 'estimated_duration', type: 'string' },
        { name: 'progress_notes', type: 'text' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
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
        { name: 'specializations', type: 'json' },
        { name: 'therapeutic_approaches', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'accepts_insurance', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
  },
};

export default mentalhealthBlueprint;
