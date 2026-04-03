import { Blueprint } from './blueprint.interface';

/**
 * Hearing Aid / Audiology Clinic Blueprint
 */
export const hearingaidBlueprint: Blueprint = {
  appType: 'hearingaid',
  description: 'Hearing aid clinic app with patients, audiograms, device fittings, and follow-up care',

  coreEntities: ['patient', 'appointment', 'audiogram', 'hearing_device', 'fitting', 'audiologist', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Audiograms', path: '/audiograms', icon: 'Activity' },
        { label: 'Devices', path: '/devices', icon: 'Headphones' },
        { label: 'Audiologists', path: '/audiologists', icon: 'UserCheck' },
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
      { id: 'audiogram-history', component: 'data-list', entity: 'audiogram', position: 'main' },
      { id: 'device-history', component: 'data-list', entity: 'hearing_device', position: 'main' },
    ]},
    { path: '/audiograms', name: 'Audiograms', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'audiogram-list', component: 'data-table', entity: 'audiogram', position: 'main' },
    ]},
    { path: '/devices', name: 'Hearing Devices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'device-filters', component: 'filter-form', entity: 'hearing_device', position: 'main' },
      { id: 'device-table', component: 'data-table', entity: 'hearing_device', position: 'main' },
    ]},
    { path: '/audiologists', name: 'Audiologists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'audiologist-grid', component: 'doctor-grid', entity: 'audiologist', position: 'main' },
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
    { method: 'GET', path: '/audiograms', entity: 'audiogram', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/audiograms', entity: 'audiogram', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/devices', entity: 'hearing_device', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/audiologists', entity: 'audiologist', operation: 'list' },
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
        { name: 'hearing_loss_onset', type: 'text' },
        { name: 'noise_exposure_history', type: 'text' },
        { name: 'tinnitus', type: 'boolean' },
        { name: 'tinnitus_description', type: 'text' },
        { name: 'medical_history', type: 'json' },
        { name: 'ent_physician', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'audiogram' },
        { type: 'hasMany', target: 'hearing_device' },
        { type: 'hasMany', target: 'fitting' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    audiogram: {
      defaultFields: [
        { name: 'test_date', type: 'datetime', required: true },
        { name: 'test_type', type: 'enum', required: true },
        { name: 'right_ear_ac', type: 'json' },
        { name: 'left_ear_ac', type: 'json' },
        { name: 'right_ear_bc', type: 'json' },
        { name: 'left_ear_bc', type: 'json' },
        { name: 'speech_reception_threshold', type: 'json' },
        { name: 'word_recognition', type: 'json' },
        { name: 'tympanometry', type: 'json' },
        { name: 'interpretation', type: 'text' },
        { name: 'recommendations', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'audiologist' },
      ],
    },
    hearing_device: {
      defaultFields: [
        { name: 'serial_number', type: 'string', required: true },
        { name: 'manufacturer', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'style', type: 'enum', required: true },
        { name: 'ear', type: 'enum', required: true },
        { name: 'technology_level', type: 'enum' },
        { name: 'purchase_date', type: 'date' },
        { name: 'warranty_expiration', type: 'date' },
        { name: 'settings', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'hasMany', target: 'fitting' },
      ],
    },
    fitting: {
      defaultFields: [
        { name: 'fitting_date', type: 'datetime', required: true },
        { name: 'fitting_type', type: 'enum', required: true },
        { name: 'rem_results', type: 'json' },
        { name: 'adjustments_made', type: 'json' },
        { name: 'patient_feedback', type: 'text' },
        { name: 'sound_quality_rating', type: 'integer' },
        { name: 'comfort_rating', type: 'integer' },
        { name: 'follow_up_needed', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'hearing_device' },
        { type: 'belongsTo', target: 'audiologist' },
      ],
    },
    audiologist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'credentials', type: 'json' },
        { name: 'license_number', type: 'string' },
        { name: 'asha_number', type: 'string' },
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

export default hearingaidBlueprint;
