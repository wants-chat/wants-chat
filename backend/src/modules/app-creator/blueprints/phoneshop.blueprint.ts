import { Blueprint } from './blueprint.interface';

/**
 * Cell Phone / Mobile Store Blueprint
 */
export const phoneshopBlueprint: Blueprint = {
  appType: 'phoneshop',
  description: 'Cell phone store app with devices, repairs, accessories, and activations',

  coreEntities: ['device', 'repair', 'customer', 'accessory', 'activation', 'trade_in'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Devices', path: '/devices', icon: 'Smartphone' },
        { label: 'Repairs', path: '/repairs', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Accessories', path: '/accessories', icon: 'Headphones' },
        { label: 'Activations', path: '/activations', icon: 'Signal' },
        { label: 'Trade-Ins', path: '/trade-ins', icon: 'Repeat' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-repairs', component: 'kanban-board', entity: 'repair', position: 'main' },
    ]},
    { path: '/devices', name: 'Devices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'device-grid', component: 'product-grid', entity: 'device', position: 'main' },
    ]},
    { path: '/repairs', name: 'Repairs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-board', component: 'kanban-board', entity: 'repair', position: 'main' },
      { id: 'repair-table', component: 'data-table', entity: 'repair', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/accessories', name: 'Accessories', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'accessory-grid', component: 'product-grid', entity: 'accessory', position: 'main' },
    ]},
    { path: '/activations', name: 'Activations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'activation-table', component: 'data-table', entity: 'activation', position: 'main' },
    ]},
    { path: '/trade-ins', name: 'Trade-Ins', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trade-table', component: 'data-table', entity: 'trade_in', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'device', position: 'main' },
      { id: 'device-display', component: 'product-grid', entity: 'device', position: 'main' },
    ]},
    { path: '/repair-request', name: 'Request Repair', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'repair-form', component: 'booking-wizard', entity: 'repair', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/devices', entity: 'device', operation: 'list' },
    { method: 'GET', path: '/repairs', entity: 'repair', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/repairs', entity: 'repair', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/accessories', entity: 'accessory', operation: 'list' },
    { method: 'GET', path: '/activations', entity: 'activation', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/trade-ins', entity: 'trade_in', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    device: {
      defaultFields: [
        { name: 'device_name', type: 'string', required: true },
        { name: 'brand', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'device_type', type: 'enum', required: true },
        { name: 'condition', type: 'enum', required: true },
        { name: 'storage', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'carrier', type: 'enum' },
        { name: 'unlocked', type: 'boolean' },
        { name: 'imei', type: 'string' },
        { name: 'specs', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'warranty', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    repair: {
      defaultFields: [
        { name: 'repair_number', type: 'string', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'device_info', type: 'json', required: true },
        { name: 'imei', type: 'string' },
        { name: 'issue_description', type: 'text', required: true },
        { name: 'diagnosis', type: 'text' },
        { name: 'repair_type', type: 'json' },
        { name: 'parts_needed', type: 'json' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'technician', type: 'string' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'warranty_repair', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'carrier', type: 'enum' },
        { name: 'devices_owned', type: 'json' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'total_repairs', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'repair' },
        { type: 'hasMany', target: 'activation' },
        { type: 'hasMany', target: 'trade_in' },
      ],
    },
    accessory: {
      defaultFields: [
        { name: 'accessory_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'compatible_with', type: 'json' },
        { name: 'color', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'sku', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    activation: {
      defaultFields: [
        { name: 'activation_number', type: 'string', required: true },
        { name: 'activation_date', type: 'date', required: true },
        { name: 'activation_type', type: 'enum', required: true },
        { name: 'carrier', type: 'enum', required: true },
        { name: 'plan', type: 'json' },
        { name: 'device_info', type: 'json' },
        { name: 'phone_number', type: 'string' },
        { name: 'ported_from', type: 'string' },
        { name: 'account_number', type: 'string' },
        { name: 'monthly_cost', type: 'decimal' },
        { name: 'commission', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    trade_in: {
      defaultFields: [
        { name: 'trade_number', type: 'string', required: true },
        { name: 'trade_date', type: 'date', required: true },
        { name: 'device_info', type: 'json', required: true },
        { name: 'imei', type: 'string' },
        { name: 'condition', type: 'enum', required: true },
        { name: 'condition_notes', type: 'text' },
        { name: 'functional', type: 'boolean' },
        { name: 'screen_condition', type: 'enum' },
        { name: 'battery_health', type: 'integer' },
        { name: 'icloud_locked', type: 'boolean' },
        { name: 'offered_value', type: 'decimal', required: true },
        { name: 'accepted', type: 'boolean' },
        { name: 'applied_to', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default phoneshopBlueprint;
