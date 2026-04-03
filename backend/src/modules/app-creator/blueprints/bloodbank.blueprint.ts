import { Blueprint } from './blueprint.interface';

/**
 * Blood Bank / Blood Donation Center Blueprint
 */
export const bloodbankBlueprint: Blueprint = {
  appType: 'bloodbank',
  description: 'Blood bank app with donors, donations, inventory management, and blood unit tracking',

  coreEntities: ['donor', 'donation', 'blood_unit', 'blood_request', 'staff', 'drive'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Donations', path: '/donations', icon: 'Heart' },
        { label: 'Donors', path: '/donors', icon: 'Users' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Requests', path: '/requests', icon: 'ClipboardList' },
        { label: 'Drives', path: '/drives', icon: 'MapPin' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'inventory-overview', component: 'data-list', entity: 'blood_unit', position: 'main' },
    ]},
    { path: '/donations', name: 'Donations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donation-calendar', component: 'appointment-calendar', entity: 'donation', position: 'main' },
    ]},
    { path: '/donors', name: 'Donors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donor-filters', component: 'filter-form', entity: 'donor', position: 'main' },
      { id: 'donor-table', component: 'data-table', entity: 'donor', position: 'main' },
    ]},
    { path: '/donors/:id', name: 'Donor Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donor-profile', component: 'profile-view', entity: 'donor', position: 'main' },
      { id: 'donation-history', component: 'data-list', entity: 'donation', position: 'main' },
    ]},
    { path: '/inventory', name: 'Blood Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-filters', component: 'filter-form', entity: 'blood_unit', position: 'main' },
      { id: 'inventory-table', component: 'data-table', entity: 'blood_unit', position: 'main' },
    ]},
    { path: '/requests', name: 'Blood Requests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'request-filters', component: 'filter-form', entity: 'blood_request', position: 'main' },
      { id: 'request-table', component: 'data-table', entity: 'blood_request', position: 'main' },
    ]},
    { path: '/drives', name: 'Blood Drives', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'drive-list', component: 'data-table', entity: 'drive', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/donate', name: 'Schedule Donation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'donation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/donations', entity: 'donation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/donations', entity: 'donation', operation: 'create' },
    { method: 'GET', path: '/donors', entity: 'donor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/donors/:id', entity: 'donor', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/donors', entity: 'donor', operation: 'create' },
    { method: 'GET', path: '/inventory', entity: 'blood_unit', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/requests', entity: 'blood_request', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/requests', entity: 'blood_request', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/drives', entity: 'drive', operation: 'list' },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    donor: {
      defaultFields: [
        { name: 'donor_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'blood_type', type: 'enum', required: true },
        { name: 'rh_factor', type: 'enum', required: true },
        { name: 'weight_kg', type: 'decimal' },
        { name: 'hemoglobin_level', type: 'decimal' },
        { name: 'last_donation_date', type: 'date' },
        { name: 'total_donations', type: 'integer' },
        { name: 'medical_history', type: 'json' },
        { name: 'eligibility_status', type: 'enum' },
        { name: 'deferral_reason', type: 'text' },
        { name: 'deferral_end_date', type: 'date' },
      ],
      relationships: [
        { type: 'hasMany', target: 'donation' },
      ],
    },
    donation: {
      defaultFields: [
        { name: 'donation_date', type: 'datetime', required: true },
        { name: 'donation_type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'pre_donation_vitals', type: 'json' },
        { name: 'volume_ml', type: 'integer' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'adverse_reactions', type: 'json' },
        { name: 'phlebotomist', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'donor' },
        { type: 'belongsTo', target: 'drive' },
        { type: 'hasMany', target: 'blood_unit' },
      ],
    },
    blood_unit: {
      defaultFields: [
        { name: 'unit_id', type: 'string', required: true },
        { name: 'blood_type', type: 'enum', required: true },
        { name: 'rh_factor', type: 'enum', required: true },
        { name: 'component_type', type: 'enum', required: true },
        { name: 'volume_ml', type: 'integer' },
        { name: 'collection_date', type: 'date', required: true },
        { name: 'expiration_date', type: 'date', required: true },
        { name: 'testing_status', type: 'enum' },
        { name: 'test_results', type: 'json' },
        { name: 'storage_location', type: 'string' },
        { name: 'temperature', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'donation' },
      ],
    },
    blood_request: {
      defaultFields: [
        { name: 'request_id', type: 'string', required: true },
        { name: 'request_date', type: 'datetime', required: true },
        { name: 'hospital_name', type: 'string', required: true },
        { name: 'requesting_physician', type: 'string' },
        { name: 'patient_name', type: 'string' },
        { name: 'blood_type', type: 'enum', required: true },
        { name: 'rh_factor', type: 'enum', required: true },
        { name: 'component_type', type: 'enum', required: true },
        { name: 'units_requested', type: 'integer', required: true },
        { name: 'urgency', type: 'enum', required: true },
        { name: 'reason', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'fulfilled_date', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    drive: {
      defaultFields: [
        { name: 'drive_name', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'location', type: 'json', required: true },
        { name: 'organizer', type: 'string' },
        { name: 'target_donations', type: 'integer' },
        { name: 'actual_donations', type: 'integer' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'donation' },
      ],
    },
    staff: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default bloodbankBlueprint;
