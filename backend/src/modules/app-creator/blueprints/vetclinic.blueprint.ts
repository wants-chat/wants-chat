import { Blueprint } from './blueprint.interface';

/**
 * Veterinary Clinic Blueprint
 */
export const vetclinicBlueprint: Blueprint = {
  appType: 'vetclinic',
  description: 'Veterinary clinic app with patients (pets), appointments, treatments, and billing',

  coreEntities: ['pet', 'owner', 'appointment', 'treatment', 'vaccination', 'invoice', 'veterinarian'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'PawPrint' },
        { label: 'Owners', path: '/owners', icon: 'Users' },
        { label: 'Veterinarians', path: '/vets', icon: 'Stethoscope' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'vet-stats', component: 'vet-clinic-stats', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list-vet', entity: 'appointment', position: 'main' },
      { id: 'vet-schedule', component: 'vet-schedule-overview', entity: 'veterinarian', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar-vet', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments/new', name: 'New Appointment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-form', component: 'appointment-form-vet', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments/:id', name: 'Appointment Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-detail', component: 'appointment-detail-vet', entity: 'appointment', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters-vet', entity: 'pet', position: 'main' },
      { id: 'patient-table', component: 'patient-table-vet', entity: 'pet', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile-vet', entity: 'pet', position: 'main' },
      { id: 'medical-records', component: 'medical-records-vet', entity: 'treatment', position: 'main' },
      { id: 'vaccination-records', component: 'vaccination-records', entity: 'vaccination', position: 'main' },
    ]},
    { path: '/owners', name: 'Owners', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'owner-table', component: 'owner-table', entity: 'owner', position: 'main' },
    ]},
    { path: '/owners/:id', name: 'Owner Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'owner-profile', component: 'owner-profile', entity: 'owner', position: 'main' },
      { id: 'owner-pets', component: 'owner-pets', entity: 'pet', position: 'main' },
    ]},
    { path: '/vets', name: 'Veterinarians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vet-grid', component: 'vet-grid', entity: 'veterinarian', position: 'main' },
    ]},
    { path: '/vets/:id', name: 'Veterinarian Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vet-profile', component: 'vet-profile', entity: 'veterinarian', position: 'main' },
      { id: 'vet-schedule', component: 'vet-schedule', entity: 'appointment', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'billing-stats-vet', position: 'main' },
      { id: 'invoice-table', component: 'invoice-table-vet', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'online-booking', component: 'online-booking-vet', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/pets', entity: 'pet', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/pets/:id', entity: 'pet', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/pets', entity: 'pet', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/owners', entity: 'owner', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/owners/:id', entity: 'owner', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/veterinarians', entity: 'veterinarian', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/treatments', entity: 'treatment', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    pet: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'species', type: 'enum', required: true },
        { name: 'breed', type: 'string' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'gender', type: 'enum' },
        { name: 'weight', type: 'decimal' },
        { name: 'color', type: 'string' },
        { name: 'microchip_id', type: 'string' },
        { name: 'photo_url', type: 'image' },
        { name: 'allergies', type: 'json' },
        { name: 'conditions', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_neutered', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'owner' },
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'treatment' },
        { type: 'hasMany', target: 'vaccination' },
      ],
    },
    owner: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'total_pets', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'pet' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'reason', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'diagnosis', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pet' },
        { type: 'belongsTo', target: 'veterinarian' },
        { type: 'hasMany', target: 'treatment' },
      ],
    },
    treatment: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'cost', type: 'decimal', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'notes', type: 'text' },
        { name: 'prescription', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pet' },
        { type: 'belongsTo', target: 'appointment' },
        { type: 'belongsTo', target: 'veterinarian' },
      ],
    },
    vaccination: {
      defaultFields: [
        { name: 'vaccine_name', type: 'string', required: true },
        { name: 'date_administered', type: 'date', required: true },
        { name: 'next_due_date', type: 'date' },
        { name: 'batch_number', type: 'string' },
        { name: 'manufacturer', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pet' },
        { type: 'belongsTo', target: 'veterinarian' },
      ],
    },
    veterinarian: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
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

export default vetclinicBlueprint;
