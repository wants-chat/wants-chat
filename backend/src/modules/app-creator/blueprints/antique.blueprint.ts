import { Blueprint } from './blueprint.interface';

/**
 * Antique Store Blueprint
 */
export const antiqueBlueprint: Blueprint = {
  appType: 'antique',
  description: 'Antique store app with inventory, consignments, appraisals, and customer management',

  coreEntities: ['item', 'consignment', 'appraisal', 'customer', 'category', 'sale'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Inventory', path: '/inventory', icon: 'Archive' },
        { label: 'Consignments', path: '/consignments', icon: 'Handshake' },
        { label: 'Appraisals', path: '/appraisals', icon: 'Search' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
        { label: 'Sales', path: '/sales', icon: 'DollarSign' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-items', component: 'product-grid', entity: 'item', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'item', position: 'main' },
      { id: 'item-grid', component: 'product-grid', entity: 'item', position: 'main' },
    ]},
    { path: '/consignments', name: 'Consignments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consignment-table', component: 'data-table', entity: 'consignment', position: 'main' },
    ]},
    { path: '/appraisals', name: 'Appraisals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appraisal-calendar', component: 'appointment-calendar', entity: 'appraisal', position: 'main' },
      { id: 'appraisal-table', component: 'data-table', entity: 'appraisal', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-table', component: 'data-table', entity: 'category', position: 'main' },
    ]},
    { path: '/sales', name: 'Sales', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sales-table', component: 'data-table', entity: 'sale', position: 'main' },
    ]},
    { path: '/browse', name: 'Browse', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'item', position: 'main' },
      { id: 'item-display', component: 'product-grid', entity: 'item', position: 'main' },
    ]},
    { path: '/schedule-appraisal', name: 'Schedule Appraisal', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'appraisal-form', component: 'booking-wizard', entity: 'appraisal', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/inventory', entity: 'item', operation: 'list' },
    { method: 'GET', path: '/consignments', entity: 'consignment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/appraisals', entity: 'appraisal', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appraisals', entity: 'appraisal', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/sales', entity: 'sale', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    item: {
      defaultFields: [
        { name: 'item_number', type: 'string', required: true },
        { name: 'item_name', type: 'string', required: true },
        { name: 'era', type: 'enum' },
        { name: 'period', type: 'string' },
        { name: 'year_circa', type: 'string' },
        { name: 'origin', type: 'string' },
        { name: 'maker', type: 'string' },
        { name: 'materials', type: 'json' },
        { name: 'dimensions', type: 'json' },
        { name: 'condition', type: 'enum', required: true },
        { name: 'condition_notes', type: 'text' },
        { name: 'provenance', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'appraised_value', type: 'decimal' },
        { name: 'is_consignment', type: 'boolean' },
        { name: 'location', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'is_sold', type: 'boolean' },
        { name: 'featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'consignment' },
      ],
    },
    consignment: {
      defaultFields: [
        { name: 'consignment_number', type: 'string', required: true },
        { name: 'consignment_date', type: 'date', required: true },
        { name: 'consignor_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'items', type: 'json' },
        { name: 'commission_rate', type: 'decimal', required: true },
        { name: 'minimum_price', type: 'decimal' },
        { name: 'contract_period', type: 'integer' },
        { name: 'contract_end', type: 'date' },
        { name: 'total_sold', type: 'decimal' },
        { name: 'commission_owed', type: 'decimal' },
        { name: 'paid_to_consignor', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'item' },
      ],
    },
    appraisal: {
      defaultFields: [
        { name: 'appraisal_number', type: 'string', required: true },
        { name: 'appraisal_date', type: 'date', required: true },
        { name: 'appraisal_time', type: 'datetime' },
        { name: 'appraisal_type', type: 'enum', required: true },
        { name: 'purpose', type: 'enum' },
        { name: 'client_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'items_description', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'appraised_items', type: 'json' },
        { name: 'total_value', type: 'decimal' },
        { name: 'appraiser', type: 'string' },
        { name: 'fee', type: 'decimal' },
        { name: 'report', type: 'text' },
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
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'interests', type: 'json' },
        { name: 'collecting_areas', type: 'json' },
        { name: 'budget_range', type: 'json' },
        { name: 'wish_list', type: 'json' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'sale' },
        { type: 'hasMany', target: 'appraisal' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'parent_category', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'item_count', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'item' },
      ],
    },
    sale: {
      defaultFields: [
        { name: 'sale_number', type: 'string', required: true },
        { name: 'sale_date', type: 'date', required: true },
        { name: 'items_sold', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'shipping', type: 'json' },
        { name: 'shipping_cost', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default antiqueBlueprint;
