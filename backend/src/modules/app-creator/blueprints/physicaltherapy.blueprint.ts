import { Blueprint } from './blueprint.interface';

/**
 * Physical Therapy / Physiotherapy Clinic Blueprint
 */
export const physicaltherapyBlueprint: Blueprint = {
  appType: 'physicaltherapy',
  description: 'Physical therapy clinic app with patients, exercises, treatment plans, and progress tracking',

  coreEntities: ['patient', 'appointment', 'treatment_plan', 'exercise', 'session', 'therapist', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Sessions', path: '/sessions', icon: 'Activity' },
        { label: 'Exercises', path: '/exercises', icon: 'Dumbbell' },
        { label: 'Therapists', path: '/therapists', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'rehab-stats', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list-today-rehab', entity: 'appointment', position: 'main' },
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
      { id: 'patient-profile', component: 'patient-profile-rehab', entity: 'patient', position: 'main' },
      { id: 'progress-overview', component: 'patient-progress-overview', entity: 'session', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-list', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/exercises', name: 'Exercises', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'exercise-list', component: 'data-table', entity: 'exercise', position: 'main' },
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
    { method: 'GET', path: '/exercises', entity: 'exercise', operation: 'list', requiresAuth: true },
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
        { name: 'diagnosis', type: 'text', required: true },
        { name: 'injury_date', type: 'date' },
        { name: 'referring_physician', type: 'json' },
        { name: 'medical_history', type: 'json' },
        { name: 'precautions', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'treatment_plan' },
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    treatment_plan: {
      defaultFields: [
        { name: 'diagnosis', type: 'text', required: true },
        { name: 'goals', type: 'json', required: true },
        { name: 'exercises', type: 'json' },
        { name: 'frequency', type: 'string' },
        { name: 'duration_weeks', type: 'integer' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'review_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'exercises_performed', type: 'json' },
        { name: 'pain_level_before', type: 'integer' },
        { name: 'pain_level_after', type: 'integer' },
        { name: 'range_of_motion', type: 'json' },
        { name: 'strength_assessment', type: 'json' },
        { name: 'progress_notes', type: 'text' },
        { name: 'home_program_compliance', type: 'enum' },
        { name: 'next_session_goals', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
        { type: 'belongsTo', target: 'appointment' },
      ],
    },
    exercise: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'body_region', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'instructions', type: 'text' },
        { name: 'video_url', type: 'url' },
        { name: 'image_url', type: 'image' },
        { name: 'difficulty', type: 'enum' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'contraindications', type: 'json' },
      ],
      relationships: [],
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
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
  },
};

export default physicaltherapyBlueprint;
