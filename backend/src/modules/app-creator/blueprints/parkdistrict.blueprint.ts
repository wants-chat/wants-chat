import { Blueprint } from './blueprint.interface';

/**
 * Park District Blueprint
 */
export const parkdistrictBlueprint: Blueprint = {
  appType: 'parkdistrict',
  description: 'Park district app with parks, programs, permits, and facility rentals',

  coreEntities: ['park', 'program', 'permit', 'facility', 'registration', 'event'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Parks', path: '/parks', icon: 'Trees' },
        { label: 'Programs', path: '/programs', icon: 'GraduationCap' },
        { label: 'Permits', path: '/permits', icon: 'FileCheck' },
        { label: 'Facilities', path: '/facilities', icon: 'Building' },
        { label: 'Registrations', path: '/registrations', icon: 'ClipboardList' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-events', component: 'appointment-list', entity: 'event', position: 'main' },
    ]},
    { path: '/parks', name: 'Parks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'park-grid', component: 'product-grid', entity: 'park', position: 'main' },
    ]},
    { path: '/programs', name: 'Programs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'program', position: 'main' },
      { id: 'program-grid', component: 'product-grid', entity: 'program', position: 'main' },
    ]},
    { path: '/permits', name: 'Permits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'permit-table', component: 'data-table', entity: 'permit', position: 'main' },
    ]},
    { path: '/facilities', name: 'Facilities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'facility-grid', component: 'product-grid', entity: 'facility', position: 'main' },
    ]},
    { path: '/registrations', name: 'Registrations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'registration-table', component: 'data-table', entity: 'registration', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/explore', name: 'Explore Parks', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'park-grid', component: 'product-grid', entity: 'park', position: 'main' },
    ]},
    { path: '/register', name: 'Register for Programs', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'program-grid', component: 'product-grid', entity: 'program', position: 'main' },
      { id: 'registration-form', component: 'booking-wizard', entity: 'registration', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/parks', entity: 'park', operation: 'list' },
    { method: 'GET', path: '/programs', entity: 'program', operation: 'list' },
    { method: 'GET', path: '/permits', entity: 'permit', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/permits', entity: 'permit', operation: 'create' },
    { method: 'GET', path: '/facilities', entity: 'facility', operation: 'list' },
    { method: 'GET', path: '/registrations', entity: 'registration', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/registrations', entity: 'registration', operation: 'create' },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
  ],

  entityConfig: {
    park: {
      defaultFields: [
        { name: 'park_name', type: 'string', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'acreage', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'amenities', type: 'json' },
        { name: 'hours', type: 'json' },
        { name: 'parking', type: 'json' },
        { name: 'trails', type: 'json' },
        { name: 'sports_facilities', type: 'json' },
        { name: 'playgrounds', type: 'json' },
        { name: 'restrooms', type: 'boolean' },
        { name: 'photos', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'facility' },
        { type: 'hasMany', target: 'event' },
      ],
    },
    program: {
      defaultFields: [
        { name: 'program_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'age_group', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'instructor', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'schedule', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'resident_fee', type: 'decimal' },
        { name: 'nonresident_fee', type: 'decimal' },
        { name: 'registration_deadline', type: 'date' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'registration' },
      ],
    },
    permit: {
      defaultFields: [
        { name: 'permit_number', type: 'string', required: true },
        { name: 'permit_type', type: 'enum', required: true },
        { name: 'applicant_name', type: 'string', required: true },
        { name: 'organization', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'event_name', type: 'string' },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string', required: true },
        { name: 'expected_attendance', type: 'integer' },
        { name: 'activities', type: 'json' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'insurance_on_file', type: 'boolean' },
        { name: 'fee', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'facility' },
      ],
    },
    facility: {
      defaultFields: [
        { name: 'facility_name', type: 'string', required: true },
        { name: 'facility_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'capacity', type: 'integer' },
        { name: 'amenities', type: 'json' },
        { name: 'hours', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'resident_rate', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'rules', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'park' },
        { type: 'hasMany', target: 'permit' },
      ],
    },
    registration: {
      defaultFields: [
        { name: 'registration_number', type: 'string', required: true },
        { name: 'registration_date', type: 'date', required: true },
        { name: 'participant_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'parent_guardian', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'is_resident', type: 'boolean' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'medical_info', type: 'json' },
        { name: 'fee', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'program' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'age_group', type: 'string' },
        { name: 'fee', type: 'decimal' },
        { name: 'registration_required', type: 'boolean' },
        { name: 'capacity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'park' },
      ],
    },
  },
};

export default parkdistrictBlueprint;
