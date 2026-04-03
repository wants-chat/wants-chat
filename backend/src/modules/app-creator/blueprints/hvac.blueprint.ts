import { Blueprint } from './blueprint.interface';

/**
 * HVAC Company Blueprint
 */
export const hvacBlueprint: Blueprint = {
  appType: 'hvac',
  description: 'HVAC company with service calls, installations, maintenance contracts, and equipment tracking',

  coreEntities: ['service_call', 'installation', 'contract', 'equipment', 'customer', 'technician'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Service Calls', path: '/service-calls', icon: 'Wrench' },
        { label: 'Installations', path: '/installations', icon: 'HardDrive' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
        { label: 'Equipment', path: '/equipment', icon: 'Fan' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCog' },
      ]}},
      { id: 'hvac-stats', component: 'hvac-stats', position: 'main' },
      { id: 'today-calls', component: 'service-call-list-today', entity: 'service_call', position: 'main' },
      { id: 'contracts-due', component: 'contract-renewal-due', entity: 'contract', position: 'main' },
    ]},
    { path: '/service-calls', name: 'Service Calls', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-call-table', component: 'service-call-table', entity: 'service_call', position: 'main' },
    ]},
    { path: '/service-calls/:id', name: 'Service Call Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-call-detail', component: 'service-call-detail', entity: 'service_call', position: 'main' },
    ]},
    { path: '/installations', name: 'Installations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'installation-table', component: 'installation-table', entity: 'installation', position: 'main' },
    ]},
    { path: '/installations/:id', name: 'Installation Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'installation-detail', component: 'installation-detail', entity: 'installation', position: 'main' },
    ]},
    { path: '/contracts', name: 'Maintenance Contracts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'contract-table', component: 'contract-table-hvac', entity: 'contract', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-table', component: 'equipment-table-hvac', entity: 'equipment', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-hvac', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-detail', component: 'customer-detail-hvac', entity: 'customer', position: 'main' },
      { id: 'customer-equipment', component: 'customer-equipment-hvac', entity: 'equipment', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'technician-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/request-service', name: 'Request Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-service', component: 'public-service-request-hvac', entity: 'service_call', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/service-calls', entity: 'service_call', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/service-calls', entity: 'service_call', operation: 'create' },
    { method: 'GET', path: '/installations', entity: 'installation', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/contracts', entity: 'contract', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    service_call: {
      defaultFields: [
        { name: 'call_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time_slot', type: 'string' },
        { name: 'type', type: 'enum', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'diagnosis', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'equipment' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    installation: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'completion_date', type: 'date' },
        { name: 'type', type: 'enum', required: true },
        { name: 'equipment_details', type: 'json' },
        { name: 'scope_of_work', type: 'text' },
        { name: 'permit_number', type: 'string' },
        { name: 'inspection_date', type: 'date' },
        { name: 'inspection_status', type: 'enum' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'equipment_cost', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'warranty_expiry', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    contract: {
      defaultFields: [
        { name: 'contract_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'annual_cost', type: 'decimal', required: true },
        { name: 'visits_per_year', type: 'integer' },
        { name: 'visits_used', type: 'integer' },
        { name: 'coverage_details', type: 'json' },
        { name: 'discount_percentage', type: 'decimal' },
        { name: 'priority_service', type: 'boolean' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    equipment: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'brand', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'serial_number', type: 'string' },
        { name: 'install_date', type: 'date' },
        { name: 'warranty_expiry', type: 'date' },
        { name: 'location', type: 'string' },
        { name: 'capacity', type: 'string' },
        { name: 'efficiency_rating', type: 'string' },
        { name: 'refrigerant_type', type: 'string' },
        { name: 'last_service_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'service_call' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'customer_type', type: 'enum', required: true },
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'billing_address', type: 'json' },
        { name: 'property_type', type: 'enum' },
        { name: 'square_footage', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'equipment' },
        { type: 'hasMany', target: 'service_call' },
        { type: 'hasMany', target: 'contract' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'employee_id', type: 'string' },
        { name: 'certifications', type: 'json' },
        { name: 'epa_certification', type: 'string' },
        { name: 'specialties', type: 'json' },
        { name: 'vehicle', type: 'string' },
        { name: 'territory', type: 'string' },
        { name: 'schedule', type: 'json' },
        { name: 'photo', type: 'image' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
        { type: 'hasMany', target: 'installation' },
      ],
    },
  },
};

export default hvacBlueprint;
