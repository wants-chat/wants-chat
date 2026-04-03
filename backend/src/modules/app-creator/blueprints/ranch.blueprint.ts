import { Blueprint } from './blueprint.interface';

/**
 * Ranch Blueprint
 */
export const ranchBlueprint: Blueprint = {
  appType: 'ranch',
  description: 'Ranch management app with cattle, pastures, breeding, and sales',

  coreEntities: ['animal', 'pasture', 'breeding', 'veterinary', 'sale', 'employee'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Herd', path: '/herd', icon: 'Bird' },
        { label: 'Pastures', path: '/pastures', icon: 'Map' },
        { label: 'Breeding', path: '/breeding', icon: 'Heart' },
        { label: 'Veterinary', path: '/veterinary', icon: 'Stethoscope' },
        { label: 'Sales', path: '/sales', icon: 'DollarSign' },
        { label: 'Employees', path: '/employees', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'herd-summary', component: 'data-table', entity: 'animal', position: 'main' },
    ]},
    { path: '/herd', name: 'Herd', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'animal', position: 'main' },
      { id: 'animal-table', component: 'data-table', entity: 'animal', position: 'main' },
    ]},
    { path: '/pastures', name: 'Pastures', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pasture-grid', component: 'product-grid', entity: 'pasture', position: 'main' },
    ]},
    { path: '/breeding', name: 'Breeding', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'breeding-calendar', component: 'appointment-calendar', entity: 'breeding', position: 'main' },
      { id: 'breeding-table', component: 'data-table', entity: 'breeding', position: 'main' },
    ]},
    { path: '/veterinary', name: 'Veterinary', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vet-table', component: 'data-table', entity: 'veterinary', position: 'main' },
    ]},
    { path: '/sales', name: 'Sales', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sale-table', component: 'data-table', entity: 'sale', position: 'main' },
    ]},
    { path: '/employees', name: 'Employees', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'employee-grid', component: 'staff-grid', entity: 'employee', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/herd', entity: 'animal', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/herd', entity: 'animal', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/pastures', entity: 'pasture', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/breeding', entity: 'breeding', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/breeding', entity: 'breeding', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/veterinary', entity: 'veterinary', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/veterinary', entity: 'veterinary', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/sales', entity: 'sale', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sales', entity: 'sale', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/employees', entity: 'employee', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    animal: {
      defaultFields: [
        { name: 'tag_number', type: 'string', required: true },
        { name: 'animal_type', type: 'enum', required: true },
        { name: 'breed', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'gender', type: 'enum', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'weight', type: 'decimal' },
        { name: 'color_markings', type: 'string' },
        { name: 'sire', type: 'string' },
        { name: 'dam', type: 'string' },
        { name: 'registration_number', type: 'string' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'decimal' },
        { name: 'current_value', type: 'decimal' },
        { name: 'current_pasture', type: 'string' },
        { name: 'breeding_status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pasture' },
        { type: 'hasMany', target: 'breeding' },
        { type: 'hasMany', target: 'veterinary' },
      ],
    },
    pasture: {
      defaultFields: [
        { name: 'pasture_name', type: 'string', required: true },
        { name: 'acreage', type: 'decimal', required: true },
        { name: 'pasture_type', type: 'enum' },
        { name: 'grass_type', type: 'string' },
        { name: 'water_source', type: 'string' },
        { name: 'fencing_type', type: 'string' },
        { name: 'fencing_condition', type: 'enum' },
        { name: 'current_head_count', type: 'integer' },
        { name: 'max_capacity', type: 'integer' },
        { name: 'last_rotation', type: 'date' },
        { name: 'next_rotation', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'animal' },
      ],
    },
    breeding: {
      defaultFields: [
        { name: 'breeding_date', type: 'date', required: true },
        { name: 'breeding_method', type: 'enum', required: true },
        { name: 'sire_tag', type: 'string', required: true },
        { name: 'dam_tag', type: 'string', required: true },
        { name: 'expected_calving', type: 'date' },
        { name: 'actual_calving', type: 'date' },
        { name: 'offspring_count', type: 'integer' },
        { name: 'offspring_tags', type: 'json' },
        { name: 'technician', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'animal' },
      ],
    },
    veterinary: {
      defaultFields: [
        { name: 'visit_date', type: 'date', required: true },
        { name: 'visit_type', type: 'enum', required: true },
        { name: 'veterinarian', type: 'string' },
        { name: 'diagnosis', type: 'text' },
        { name: 'treatment', type: 'text' },
        { name: 'medications', type: 'json' },
        { name: 'vaccinations', type: 'json' },
        { name: 'weight_at_visit', type: 'decimal' },
        { name: 'temperature', type: 'decimal' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'cost', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'animal' },
      ],
    },
    sale: {
      defaultFields: [
        { name: 'sale_date', type: 'date', required: true },
        { name: 'sale_type', type: 'enum', required: true },
        { name: 'animal_tags', type: 'json', required: true },
        { name: 'head_count', type: 'integer', required: true },
        { name: 'total_weight', type: 'decimal' },
        { name: 'price_per_pound', type: 'decimal' },
        { name: 'total_amount', type: 'decimal', required: true },
        { name: 'buyer_name', type: 'string' },
        { name: 'buyer_contact', type: 'json' },
        { name: 'sale_location', type: 'string' },
        { name: 'commission', type: 'decimal' },
        { name: 'net_amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    employee: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'position', type: 'string', required: true },
        { name: 'hire_date', type: 'date' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'salary', type: 'decimal' },
        { name: 'skills', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default ranchBlueprint;
