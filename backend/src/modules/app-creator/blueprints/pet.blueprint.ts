import { Blueprint } from './blueprint.interface';

/**
 * Pet/Veterinary Blueprint
 */
export const petBlueprint: Blueprint = {
  appType: 'pet',
  description: 'Pet care app with pets, appointments, vaccinations, and veterinarians',

  coreEntities: ['pet', 'appointment', 'vaccination', 'veterinarian', 'medical_record', 'medication'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'My Pets', path: '/pets', icon: 'PawPrint' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Vaccinations', path: '/vaccinations', icon: 'Syringe' },
        { label: 'Find Vets', path: '/vets', icon: 'Stethoscope' },
      ]}},
      { id: 'pet-cards', component: 'pet-cards', entity: 'pet', position: 'main' },
      { id: 'upcoming-appointments', component: 'appointment-list', entity: 'appointment', position: 'main', props: { title: 'Upcoming Appointments' }},
      { id: 'vaccination-reminders', component: 'vaccination-reminders', entity: 'vaccination', position: 'main' },
    ]},
    { path: '/pets', name: 'My Pets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pet-grid', component: 'pet-grid', entity: 'pet', position: 'main' },
    ]},
    { path: '/pets/:id', name: 'Pet Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pet-profile', component: 'pet-profile', entity: 'pet', position: 'main' },
      { id: 'medical-history', component: 'medical-history', entity: 'medical_record', position: 'main' },
      { id: 'vaccinations', component: 'vaccination-list', entity: 'vaccination', position: 'main' },
    ]},
    { path: '/pets/new', name: 'Add Pet', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pet-form', component: 'pet-form', entity: 'pet', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/vets', name: 'Find Vets', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vet-search', component: 'vet-search', entity: 'veterinarian', position: 'main' },
      { id: 'vet-list', component: 'vet-list', entity: 'veterinarian', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/pets', entity: 'pet', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/pets/:id', entity: 'pet', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/pets', entity: 'pet', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/pets/:id', entity: 'pet', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/pets/:id/vaccinations', entity: 'vaccination', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/veterinarians', entity: 'veterinarian', operation: 'list' },
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
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'vaccination' },
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'medical_record' },
      ],
    },
    vaccination: {
      defaultFields: [
        { name: 'vaccine_name', type: 'string', required: true },
        { name: 'date_administered', type: 'date', required: true },
        { name: 'next_due_date', type: 'date' },
        { name: 'batch_number', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pet' },
        { type: 'belongsTo', target: 'veterinarian' },
      ],
    },
  },
};

export default petBlueprint;
