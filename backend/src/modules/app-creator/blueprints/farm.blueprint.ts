import { Blueprint } from './blueprint.interface';

/**
 * Farm Blueprint
 */
export const farmBlueprint: Blueprint = {
  appType: 'farm',
  description: 'Farm management app with crops, livestock, equipment, and sales',

  coreEntities: ['crop', 'livestock', 'equipment', 'harvest', 'sale', 'expense'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Crops', path: '/crops', icon: 'Wheat' },
        { label: 'Livestock', path: '/livestock', icon: 'Bird' },
        { label: 'Equipment', path: '/equipment', icon: 'Tractor' },
        { label: 'Harvests', path: '/harvests', icon: 'Package' },
        { label: 'Sales', path: '/sales', icon: 'DollarSign' },
        { label: 'Expenses', path: '/expenses', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-crops', component: 'data-table', entity: 'crop', position: 'main' },
    ]},
    { path: '/crops', name: 'Crops', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'crop-table', component: 'data-table', entity: 'crop', position: 'main' },
    ]},
    { path: '/livestock', name: 'Livestock', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'livestock-table', component: 'data-table', entity: 'livestock', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-grid', component: 'product-grid', entity: 'equipment', position: 'main' },
    ]},
    { path: '/harvests', name: 'Harvests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'harvest-table', component: 'data-table', entity: 'harvest', position: 'main' },
    ]},
    { path: '/sales', name: 'Sales', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sale-table', component: 'data-table', entity: 'sale', position: 'main' },
    ]},
    { path: '/expenses', name: 'Expenses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'expense-table', component: 'data-table', entity: 'expense', position: 'main' },
    ]},
    { path: '/shop', name: 'Farm Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'product-grid', component: 'product-grid', entity: 'harvest', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/crops', entity: 'crop', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/crops', entity: 'crop', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/livestock', entity: 'livestock', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/livestock', entity: 'livestock', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/harvests', entity: 'harvest', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/harvests', entity: 'harvest', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/sales', entity: 'sale', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sales', entity: 'sale', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/expenses', entity: 'expense', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    crop: {
      defaultFields: [
        { name: 'crop_name', type: 'string', required: true },
        { name: 'variety', type: 'string' },
        { name: 'field_name', type: 'string', required: true },
        { name: 'acreage', type: 'decimal' },
        { name: 'planting_date', type: 'date' },
        { name: 'expected_harvest', type: 'date' },
        { name: 'seed_source', type: 'string' },
        { name: 'seed_cost', type: 'decimal' },
        { name: 'fertilizer_applied', type: 'json' },
        { name: 'pesticides_applied', type: 'json' },
        { name: 'irrigation', type: 'json' },
        { name: 'expected_yield', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'harvest' },
        { type: 'hasMany', target: 'expense' },
      ],
    },
    livestock: {
      defaultFields: [
        { name: 'animal_id', type: 'string', required: true },
        { name: 'animal_type', type: 'enum', required: true },
        { name: 'breed', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'gender', type: 'enum' },
        { name: 'weight', type: 'decimal' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'decimal' },
        { name: 'location', type: 'string' },
        { name: 'vaccinations', type: 'json' },
        { name: 'medical_history', type: 'json' },
        { name: 'breeding_info', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'expense' },
      ],
    },
    equipment: {
      defaultFields: [
        { name: 'equipment_name', type: 'string', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'serial_number', type: 'string' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'decimal' },
        { name: 'current_value', type: 'decimal' },
        { name: 'hours_used', type: 'integer' },
        { name: 'fuel_type', type: 'string' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'next_maintenance', type: 'date' },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'expense' },
      ],
    },
    harvest: {
      defaultFields: [
        { name: 'harvest_date', type: 'date', required: true },
        { name: 'crop_name', type: 'string', required: true },
        { name: 'field_name', type: 'string' },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'unit', type: 'string' },
        { name: 'quality_grade', type: 'enum' },
        { name: 'storage_location', type: 'string' },
        { name: 'market_price', type: 'decimal' },
        { name: 'total_value', type: 'decimal' },
        { name: 'sold_quantity', type: 'decimal' },
        { name: 'remaining_quantity', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'crop' },
        { type: 'hasMany', target: 'sale' },
      ],
    },
    sale: {
      defaultFields: [
        { name: 'sale_date', type: 'date', required: true },
        { name: 'product_type', type: 'enum', required: true },
        { name: 'product_name', type: 'string', required: true },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'unit', type: 'string' },
        { name: 'price_per_unit', type: 'decimal' },
        { name: 'total_amount', type: 'decimal', required: true },
        { name: 'buyer_name', type: 'string' },
        { name: 'buyer_type', type: 'enum' },
        { name: 'payment_method', type: 'enum' },
        { name: 'payment_received', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'harvest' },
      ],
    },
    expense: {
      defaultFields: [
        { name: 'expense_date', type: 'date', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'string', required: true },
        { name: 'vendor', type: 'string' },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'receipt_url', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'crop' },
        { type: 'belongsTo', target: 'livestock' },
        { type: 'belongsTo', target: 'equipment' },
      ],
    },
  },
};

export default farmBlueprint;
