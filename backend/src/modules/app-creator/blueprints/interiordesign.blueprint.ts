import { Blueprint } from './blueprint.interface';

/**
 * Interior Design Blueprint
 */
export const interiordesignBlueprint: Blueprint = {
  appType: 'interiordesign',
  description: 'Interior design app with projects, clients, products, and quotes',

  coreEntities: ['project', 'client', 'product', 'room', 'quote', 'mood_board'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Home' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Products', path: '/products', icon: 'Sofa' },
        { label: 'Mood Boards', path: '/mood-boards', icon: 'LayoutGrid' },
        { label: 'Quotes', path: '/quotes', icon: 'FileText' },
      ]}},
      { id: 'design-stats', component: 'design-stats', position: 'main' },
      { id: 'active-projects', component: 'project-list-design', entity: 'project', position: 'main' },
      { id: 'pending-quotes', component: 'quote-list-design', entity: 'quote', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-filters', component: 'project-filters-design', entity: 'project', position: 'main' },
      { id: 'project-grid', component: 'project-grid-design', entity: 'project', position: 'main' },
    ]},
    { path: '/projects/:id', name: 'Project Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-header', component: 'project-header-design', entity: 'project', position: 'main' },
      { id: 'project-rooms', component: 'project-rooms', entity: 'room', position: 'main' },
      { id: 'project-products', component: 'project-products', entity: 'product', position: 'main' },
    ]},
    { path: '/projects/new', name: 'New Project', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-form', component: 'project-form-design', entity: 'project', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-design', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-design', entity: 'client', position: 'main' },
      { id: 'client-projects', component: 'client-projects-design', entity: 'project', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-filters', component: 'product-filters-design', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid-design', entity: 'product', position: 'main' },
    ]},
    { path: '/mood-boards', name: 'Mood Boards', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'mood-board-grid', component: 'mood-board-grid', entity: 'mood_board', position: 'main' },
    ]},
    { path: '/mood-boards/:id', name: 'Mood Board', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'mood-board-viewer', component: 'mood-board-viewer', entity: 'mood_board', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'quote-table-design', entity: 'quote', position: 'main' },
    ]},
    { path: '/portfolio', name: 'Portfolio', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-portfolio', component: 'public-portfolio-design', entity: 'project', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/projects/:id', entity: 'project', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients/:id', entity: 'client', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/mood-boards', entity: 'mood_board', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/portfolio', entity: 'project', operation: 'list' },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'budget', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'address', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'cover_image', type: 'image' },
        { name: 'images', type: 'json' },
        { name: 'is_portfolio', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'room' },
        { type: 'hasMany', target: 'mood_board' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'company', type: 'string' },
        { name: 'address', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'total_projects', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'project' }],
    },
    room: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'dimensions', type: 'json' },
        { name: 'budget', type: 'decimal' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'images', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'hasMany', target: 'product' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'brand', type: 'string' },
        { name: 'category', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'supplier', type: 'string' },
        { name: 'sku', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'dimensions', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'link', type: 'url' },
      ],
      relationships: [{ type: 'belongsTo', target: 'room' }],
    },
    mood_board: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'images', type: 'json' },
        { name: 'colors', type: 'json' },
        { name: 'products', type: 'json' },
        { name: 'is_approved', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'project' }],
    },
  },
};

export default interiordesignBlueprint;
