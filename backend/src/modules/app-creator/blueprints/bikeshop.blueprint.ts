import { Blueprint } from './blueprint.interface';

/**
 * Bike Shop Blueprint
 */
export const bikeshopBlueprint: Blueprint = {
  appType: 'bikeshop',
  description: 'Bike shop app with bikes, repairs, rentals, parts, and fitting services',

  coreEntities: ['bike', 'repair', 'rental', 'customer', 'part', 'fitting'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bikes', path: '/bikes', icon: 'Bike' },
        { label: 'Repairs', path: '/repairs', icon: 'Wrench' },
        { label: 'Rentals', path: '/rentals', icon: 'Clock' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Parts', path: '/parts', icon: 'Package' },
        { label: 'Fittings', path: '/fittings', icon: 'Ruler' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-repairs', component: 'kanban-board', entity: 'repair', position: 'main' },
    ]},
    { path: '/bikes', name: 'Bikes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'bike', position: 'main' },
      { id: 'bike-grid', component: 'product-grid', entity: 'bike', position: 'main' },
    ]},
    { path: '/repairs', name: 'Repairs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-board', component: 'kanban-board', entity: 'repair', position: 'main' },
      { id: 'repair-table', component: 'data-table', entity: 'repair', position: 'main' },
    ]},
    { path: '/rentals', name: 'Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-calendar', component: 'appointment-calendar', entity: 'rental', position: 'main' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/parts', name: 'Parts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'parts-table', component: 'data-table', entity: 'part', position: 'main' },
    ]},
    { path: '/fittings', name: 'Bike Fittings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'fitting-calendar', component: 'appointment-calendar', entity: 'fitting', position: 'main' },
      { id: 'fitting-table', component: 'data-table', entity: 'fitting', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'bike', position: 'main' },
      { id: 'bike-display', component: 'product-grid', entity: 'bike', position: 'main' },
    ]},
    { path: '/service-request', name: 'Request Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'service-form', component: 'booking-wizard', entity: 'repair', position: 'main' },
    ]},
    { path: '/book-fitting', name: 'Book Fitting', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'fitting-form', component: 'booking-wizard', entity: 'fitting', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bikes', entity: 'bike', operation: 'list' },
    { method: 'GET', path: '/repairs', entity: 'repair', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/repairs', entity: 'repair', operation: 'create' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'rental', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/parts', entity: 'part', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/fittings', entity: 'fitting', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/fittings', entity: 'fitting', operation: 'create' },
  ],

  entityConfig: {
    bike: {
      defaultFields: [
        { name: 'bike_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'brand', type: 'string', required: true },
        { name: 'model', type: 'string' },
        { name: 'bike_type', type: 'enum', required: true },
        { name: 'year', type: 'integer' },
        { name: 'frame_size', type: 'string' },
        { name: 'frame_material', type: 'enum' },
        { name: 'color', type: 'string' },
        { name: 'groupset', type: 'string' },
        { name: 'wheel_size', type: 'string' },
        { name: 'condition', type: 'enum' },
        { name: 'specifications', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'is_rentable', type: 'boolean' },
        { name: 'rental_price', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    repair: {
      defaultFields: [
        { name: 'repair_number', type: 'string', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'bike_info', type: 'json', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'issue_description', type: 'text' },
        { name: 'diagnosis', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'mechanic', type: 'string' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'rental_date', type: 'date', required: true },
        { name: 'return_date', type: 'date', required: true },
        { name: 'bike_info', type: 'json', required: true },
        { name: 'helmet_included', type: 'boolean' },
        { name: 'lock_included', type: 'boolean' },
        { name: 'customer_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'id_on_file', type: 'boolean' },
        { name: 'deposit', type: 'decimal' },
        { name: 'rental_total', type: 'decimal' },
        { name: 'checked_out', type: 'boolean' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'condition_notes', type: 'text' },
        { name: 'damage_charges', type: 'decimal' },
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
        { name: 'bikes_owned', type: 'json' },
        { name: 'riding_type', type: 'json' },
        { name: 'height', type: 'string' },
        { name: 'inseam', type: 'string' },
        { name: 'fit_data', type: 'json' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'repair' },
        { type: 'hasMany', target: 'rental' },
        { type: 'hasMany', target: 'fitting' },
      ],
    },
    part: {
      defaultFields: [
        { name: 'part_name', type: 'string', required: true },
        { name: 'part_number', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'compatible_with', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'reorder_level', type: 'integer' },
        { name: 'supplier', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    fitting: {
      defaultFields: [
        { name: 'fitting_number', type: 'string', required: true },
        { name: 'fitting_date', type: 'date', required: true },
        { name: 'fitting_time', type: 'datetime', required: true },
        { name: 'fitting_type', type: 'enum', required: true },
        { name: 'bike_type', type: 'enum' },
        { name: 'fitter', type: 'string' },
        { name: 'measurements', type: 'json' },
        { name: 'flexibility_assessment', type: 'json' },
        { name: 'current_bike', type: 'json' },
        { name: 'adjustments_made', type: 'json' },
        { name: 'recommendations', type: 'text' },
        { name: 'price', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default bikeshopBlueprint;
