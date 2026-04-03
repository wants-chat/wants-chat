import { Blueprint } from './blueprint.interface';

/**
 * Physical Therapy/Rehab Center Blueprint
 */
export const rehabBlueprint: Blueprint = {
  appType: 'rehab',
  description: 'Physical therapy and rehabilitation center with patients, treatments, exercises, and progress tracking',

  coreEntities: ['patient', 'treatment_plan', 'appointment', 'exercise', 'progress', 'therapist'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Treatment Plans', path: '/treatments', icon: 'ClipboardList' },
        { label: 'Exercises', path: '/exercises', icon: 'Dumbbell' },
        { label: 'Therapists', path: '/therapists', icon: 'UserCog' },
      ]}},
      { id: 'rehab-stats', component: 'rehab-stats', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list-today-rehab', entity: 'appointment', position: 'main' },
      { id: 'patient-progress', component: 'patient-progress-overview', entity: 'progress', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-table', component: 'patient-table-rehab', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile-rehab', entity: 'patient', position: 'main' },
      { id: 'patient-treatment', component: 'patient-treatment-summary', entity: 'treatment_plan', position: 'main' },
      { id: 'patient-progress', component: 'patient-progress-chart', entity: 'progress', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar-rehab', entity: 'appointment', position: 'main' },
    ]},
    { path: '/treatments', name: 'Treatment Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'treatment-table', component: 'treatment-table', entity: 'treatment_plan', position: 'main' },
    ]},
    { path: '/treatments/:id', name: 'Treatment Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'treatment-detail', component: 'treatment-detail', entity: 'treatment_plan', position: 'main' },
    ]},
    { path: '/exercises', name: 'Exercise Library', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'exercise-grid', component: 'exercise-grid', entity: 'exercise', position: 'main' },
    ]},
    { path: '/therapists', name: 'Therapists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapist-grid', component: 'therapist-grid', entity: 'therapist', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-booking', component: 'public-booking-rehab', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/treatments', entity: 'treatment_plan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/exercises', entity: 'exercise', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/therapists', entity: 'therapist', operation: 'list' },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'insurance', type: 'json' },
        { name: 'referral_source', type: 'string' },
        { name: 'diagnosis', type: 'text' },
        { name: 'injury_date', type: 'date' },
        { name: 'medical_history', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasOne', target: 'treatment_plan' },
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'progress' },
      ],
    },
    treatment_plan: {
      defaultFields: [
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'diagnosis', type: 'text', required: true },
        { name: 'goals', type: 'json' },
        { name: 'frequency', type: 'enum', required: true },
        { name: 'sessions_authorized', type: 'integer' },
        { name: 'sessions_completed', type: 'integer' },
        { name: 'exercises', type: 'json' },
        { name: 'precautions', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'treatment_notes', type: 'text' },
        { name: 'exercises_performed', type: 'json' },
        { name: 'pain_level', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'therapist' },
      ],
    },
    exercise: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'body_part', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'instructions', type: 'text' },
        { name: 'sets', type: 'integer' },
        { name: 'reps', type: 'integer' },
        { name: 'duration_seconds', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'video_url', type: 'url' },
        { name: 'image', type: 'image' },
      ],
      relationships: [],
    },
    progress: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'pain_level', type: 'integer' },
        { name: 'range_of_motion', type: 'json' },
        { name: 'strength', type: 'json' },
        { name: 'functional_goals', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'patient' }],
    },
    therapist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'title', type: 'string' },
        { name: 'credentials', type: 'string' },
        { name: 'specialties', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'treatment_plan' },
        { type: 'hasMany', target: 'appointment' },
      ],
    },
  },
};

export default rehabBlueprint;
