import { Blueprint } from './blueprint.interface';

/**
 * Senior Living Blueprint
 */
export const seniorlivingBlueprint: Blueprint = {
  appType: 'seniorliving',
  description: 'Senior living community with residents, apartments, activities, and care management',

  coreEntities: ['resident', 'apartment', 'activity', 'staff', 'carenote', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Residents', path: '/residents', icon: 'Users' },
        { label: 'Apartments', path: '/apartments', icon: 'Building' },
        { label: 'Activities', path: '/activities', icon: 'Calendar' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
        { label: 'Care Notes', path: '/carenotes', icon: 'ClipboardList' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'todays-activities', component: 'appointment-list', entity: 'activity', position: 'main' },
    ]},
    { path: '/residents', name: 'Residents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'resident-table', component: 'data-table', entity: 'resident', position: 'main' },
    ]},
    { path: '/apartments', name: 'Apartments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'apartment-grid', component: 'product-grid', entity: 'apartment', position: 'main' },
    ]},
    { path: '/activities', name: 'Activities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'activity-calendar', component: 'appointment-calendar', entity: 'activity', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/carenotes', name: 'Care Notes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'carenote-table', component: 'data-table', entity: 'carenote', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/residents', entity: 'resident', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/residents', entity: 'resident', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/apartments', entity: 'apartment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/carenotes', entity: 'carenote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/carenotes', entity: 'carenote', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    resident: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'photo_url', type: 'image' },
        { name: 'move_in_date', type: 'date' },
        { name: 'care_level', type: 'enum' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'emergency_contacts', type: 'json' },
        { name: 'primary_physician', type: 'json' },
        { name: 'insurance_info', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'apartment' },
        { type: 'hasMany', target: 'carenote' },
      ],
    },
    apartment: {
      defaultFields: [
        { name: 'unit_number', type: 'string', required: true },
        { name: 'floor', type: 'string' },
        { name: 'unit_type', type: 'enum', required: true },
        { name: 'square_feet', type: 'integer' },
        { name: 'bedrooms', type: 'integer' },
        { name: 'bathrooms', type: 'integer' },
        { name: 'features', type: 'json' },
        { name: 'accessibility_features', type: 'json' },
        { name: 'monthly_rate', type: 'decimal', required: true },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'resident' },
      ],
    },
    activity: {
      defaultFields: [
        { name: 'activity_name', type: 'string', required: true },
        { name: 'activity_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'scheduled_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'max_participants', type: 'integer' },
        { name: 'registered_participants', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'staff' },
      ],
    },
    staff: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'activity' },
        { type: 'hasMany', target: 'carenote' },
      ],
    },
    carenote: {
      defaultFields: [
        { name: 'note_date', type: 'date', required: true },
        { name: 'note_time', type: 'datetime' },
        { name: 'note_type', type: 'enum', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'vitals', type: 'json' },
        { name: 'mood', type: 'enum' },
        { name: 'appetite', type: 'enum' },
        { name: 'mobility', type: 'enum' },
        { name: 'follow_up_required', type: 'boolean' },
        { name: 'follow_up_notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'resident' },
        { type: 'belongsTo', target: 'staff' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'billing_period', type: 'json' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'resident' },
      ],
    },
  },
};

export default seniorlivingBlueprint;
