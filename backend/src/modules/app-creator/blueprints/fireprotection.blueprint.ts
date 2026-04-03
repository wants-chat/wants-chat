import { Blueprint } from './blueprint.interface';

/**
 * Fire Protection Blueprint
 */
export const fireprotectionBlueprint: Blueprint = {
  appType: 'fireprotection',
  description: 'Fire protection service with inspections, equipment, customers, and compliance tracking',

  coreEntities: ['customer', 'inspection', 'equipment', 'deficiency', 'technician', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Customers', path: '/customers', icon: 'Building' },
        { label: 'Inspections', path: '/inspections', icon: 'Calendar' },
        { label: 'Equipment', path: '/equipment', icon: 'Flame' },
        { label: 'Deficiencies', path: '/deficiencies', icon: 'AlertTriangle' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-inspections', component: 'appointment-list', entity: 'inspection', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/inspections', name: 'Inspections', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inspection-calendar', component: 'appointment-calendar', entity: 'inspection', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-table', component: 'data-table', entity: 'equipment', position: 'main' },
    ]},
    { path: '/deficiencies', name: 'Deficiencies', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'deficiency-board', component: 'kanban-board', entity: 'deficiency', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/customers', entity: 'customer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/inspections', entity: 'inspection', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/inspections', entity: 'inspection', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/deficiencies', entity: 'deficiency', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/deficiencies', entity: 'deficiency', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    customer: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json', required: true },
        { name: 'property_type', type: 'enum' },
        { name: 'occupancy_type', type: 'enum' },
        { name: 'square_footage', type: 'integer' },
        { name: 'fire_marshal', type: 'string' },
        { name: 'inspection_frequency', type: 'enum' },
        { name: 'contract_start', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'inspection' },
        { type: 'hasMany', target: 'equipment' },
      ],
    },
    inspection: {
      defaultFields: [
        { name: 'inspection_number', type: 'string', required: true },
        { name: 'inspection_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'inspection_type', type: 'enum', required: true },
        { name: 'scope', type: 'json' },
        { name: 'findings', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'pass_fail', type: 'enum' },
        { name: 'report_url', type: 'string' },
        { name: 'next_inspection_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
        { type: 'hasMany', target: 'deficiency' },
      ],
    },
    equipment: {
      defaultFields: [
        { name: 'equipment_id', type: 'string', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'installation_date', type: 'date' },
        { name: 'last_inspection', type: 'date' },
        { name: 'next_inspection', type: 'date' },
        { name: 'service_history', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    deficiency: {
      defaultFields: [
        { name: 'deficiency_code', type: 'string', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'severity', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'code_reference', type: 'string' },
        { name: 'photos', type: 'json' },
        { name: 'due_date', type: 'date' },
        { name: 'corrected_date', type: 'date' },
        { name: 'correction_notes', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'inspection' },
        { type: 'belongsTo', target: 'equipment' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'inspection' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'inspection_fees', type: 'decimal' },
        { name: 'service_fees', type: 'decimal' },
        { name: 'parts_fees', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'inspection' },
      ],
    },
  },
};

export default fireprotectionBlueprint;
