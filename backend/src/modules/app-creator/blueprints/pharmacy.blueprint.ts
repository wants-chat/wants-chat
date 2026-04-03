import { Blueprint } from './blueprint.interface';

/**
 * Pharmacy Blueprint
 */
export const pharmacyBlueprint: Blueprint = {
  appType: 'pharmacy',
  description: 'Pharmacy with prescriptions, medications, customers, and inventory management',

  coreEntities: ['prescription', 'medication', 'customer', 'inventory', 'order', 'pharmacist'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Prescriptions', path: '/prescriptions', icon: 'FileText' },
        { label: 'Medications', path: '/medications', icon: 'Pill' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
      ]}},
      { id: 'pharmacy-stats', component: 'pharmacy-stats', position: 'main' },
      { id: 'pending-prescriptions', component: 'prescription-list-pending', entity: 'prescription', position: 'main' },
      { id: 'low-stock', component: 'medication-low-stock', entity: 'medication', position: 'main' },
    ]},
    { path: '/prescriptions', name: 'Prescriptions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'prescription-filters', component: 'prescription-filters', entity: 'prescription', position: 'main' },
      { id: 'prescription-table', component: 'prescription-table', entity: 'prescription', position: 'main' },
    ]},
    { path: '/prescriptions/:id', name: 'Prescription Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'prescription-detail', component: 'prescription-detail', entity: 'prescription', position: 'main' },
    ]},
    { path: '/medications', name: 'Medications', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'medication-search', component: 'medication-search', entity: 'medication', position: 'main' },
      { id: 'medication-grid', component: 'medication-grid', entity: 'medication', position: 'main' },
    ]},
    { path: '/medications/:id', name: 'Medication Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'medication-detail', component: 'medication-detail', entity: 'medication', position: 'main' },
      { id: 'medication-inventory', component: 'medication-inventory', entity: 'inventory', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-pharmacy', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-pharmacy', entity: 'customer', position: 'main' },
      { id: 'customer-prescriptions', component: 'customer-prescriptions', entity: 'prescription', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'inventory-table-pharmacy', entity: 'inventory', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'order-table-pharmacy', entity: 'order', position: 'main' },
    ]},
    { path: '/refill', name: 'Refill Request', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'refill-form', component: 'refill-request-form', entity: 'prescription', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/prescriptions', entity: 'prescription', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/prescriptions', entity: 'prescription', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/medications', entity: 'medication', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/refill-request', entity: 'prescription', operation: 'create' },
  ],

  entityConfig: {
    prescription: {
      defaultFields: [
        { name: 'rx_number', type: 'string', required: true },
        { name: 'doctor_name', type: 'string', required: true },
        { name: 'doctor_phone', type: 'phone' },
        { name: 'prescribed_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'dosage', type: 'string', required: true },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'refills_remaining', type: 'integer' },
        { name: 'instructions', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'filled_date', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'medication' },
        { type: 'belongsTo', target: 'pharmacist' },
      ],
    },
    medication: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'generic_name', type: 'string' },
        { name: 'ndc', type: 'string' },
        { name: 'manufacturer', type: 'string' },
        { name: 'category', type: 'enum' },
        { name: 'form', type: 'enum' },
        { name: 'strength', type: 'string' },
        { name: 'unit_price', type: 'decimal', required: true },
        { name: 'requires_prescription', type: 'boolean' },
        { name: 'controlled_substance', type: 'boolean' },
        { name: 'description', type: 'text' },
        { name: 'side_effects', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'prescription' },
        { type: 'hasMany', target: 'inventory' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'insurance_info', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'prescription' }],
    },
    inventory: {
      defaultFields: [
        { name: 'lot_number', type: 'string', required: true },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'expiry_date', type: 'date', required: true },
        { name: 'received_date', type: 'date' },
        { name: 'cost', type: 'decimal' },
        { name: 'location', type: 'string' },
      ],
      relationships: [{ type: 'belongsTo', target: 'medication' }],
    },
    pharmacist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'license_number', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'prescription' }],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'supplier', type: 'string' },
        { name: 'items', type: 'json', required: true },
        { name: 'total', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'received_date', type: 'datetime' },
      ],
      relationships: [],
    },
  },
};

export default pharmacyBlueprint;
