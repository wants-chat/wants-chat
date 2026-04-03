import { Blueprint } from './blueprint.interface';

/**
 * Computer Repair Shop Blueprint
 */
export const computerrepairBlueprint: Blueprint = {
  appType: 'computerrepair',
  description: 'Computer repair shop app with tickets, diagnostics, parts, and customer management',

  coreEntities: ['repair_ticket', 'customer', 'device', 'part', 'technician', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Tickets', path: '/tickets', icon: 'Laptop' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Devices', path: '/devices', icon: 'Monitor' },
        { label: 'Parts', path: '/parts', icon: 'Cpu' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-tickets', component: 'kanban-board', entity: 'repair_ticket', position: 'main' },
    ]},
    { path: '/tickets', name: 'Repair Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-board', component: 'kanban-board', entity: 'repair_ticket', position: 'main' },
      { id: 'ticket-table', component: 'data-table', entity: 'repair_ticket', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/devices', name: 'Devices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'device-table', component: 'data-table', entity: 'device', position: 'main' },
    ]},
    { path: '/parts', name: 'Parts Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'parts-table', component: 'data-table', entity: 'part', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tech-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/request-repair', name: 'Request Repair', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'repair-form', component: 'booking-wizard', entity: 'repair_ticket', position: 'main' },
    ]},
    { path: '/track', name: 'Track Repair', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tickets', entity: 'repair_ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'repair_ticket', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/devices', entity: 'device', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/parts', entity: 'part', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    repair_ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'issue_description', type: 'text', required: true },
        { name: 'symptoms', type: 'json' },
        { name: 'diagnosis', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'data_backup', type: 'boolean' },
        { name: 'data_backup_location', type: 'string' },
        { name: 'password', type: 'string' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'customer_notified', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'device' },
        { type: 'belongsTo', target: 'technician' },
        { type: 'hasOne', target: 'invoice' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'company', type: 'string' },
        { name: 'preferred_contact', type: 'enum' },
        { name: 'total_repairs', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'device' },
        { type: 'hasMany', target: 'repair_ticket' },
      ],
    },
    device: {
      defaultFields: [
        { name: 'device_type', type: 'enum', required: true },
        { name: 'brand', type: 'string', required: true },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'os', type: 'string' },
        { name: 'specs', type: 'json' },
        { name: 'purchase_date', type: 'date' },
        { name: 'warranty_status', type: 'enum' },
        { name: 'warranty_expiry', type: 'date' },
        { name: 'condition', type: 'enum' },
        { name: 'photos', type: 'json' },
        { name: 'repair_history', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'repair_ticket' },
      ],
    },
    part: {
      defaultFields: [
        { name: 'part_name', type: 'string', required: true },
        { name: 'part_number', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'compatible_with', type: 'json' },
        { name: 'brand', type: 'string' },
        { name: 'condition', type: 'enum' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'reorder_level', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'supplier', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    technician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'repair_ticket' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'parts_total', type: 'decimal' },
        { name: 'labor_total', type: 'decimal' },
        { name: 'diagnostic_fee', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'repair_ticket' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default computerrepairBlueprint;
