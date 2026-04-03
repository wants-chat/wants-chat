import { Blueprint } from './blueprint.interface';

/**
 * Glass Blowing Blueprint
 */
export const glassblowingBlueprint: Blueprint = {
  appType: 'glassblowing',
  description: 'Glass blowing studio app with classes, private sessions, gallery, and commissions',

  coreEntities: ['class', 'session', 'artwork', 'commission', 'artist', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Classes', path: '/classes', icon: 'GraduationCap' },
        { label: 'Private Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Gallery', path: '/gallery', icon: 'Image' },
        { label: 'Commissions', path: '/commissions', icon: 'Palette' },
        { label: 'Artists', path: '/artists', icon: 'UserCheck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
    ]},
    { path: '/sessions', name: 'Private Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/gallery', name: 'Gallery', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artwork-grid', component: 'product-grid', entity: 'artwork', position: 'main' },
    ]},
    { path: '/commissions', name: 'Commissions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'commission-board', component: 'kanban-board', entity: 'commission', position: 'main' },
    ]},
    { path: '/artists', name: 'Artists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artist-grid', component: 'staff-grid', entity: 'artist', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/shop', name: 'Art Gallery', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'artwork-grid', component: 'product-grid', entity: 'artwork', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'POST', path: '/classes', entity: 'class', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create' },
    { method: 'GET', path: '/gallery', entity: 'artwork', operation: 'list' },
    { method: 'POST', path: '/gallery', entity: 'artwork', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/commissions', entity: 'commission', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/commissions', entity: 'commission', operation: 'create' },
    { method: 'GET', path: '/artists', entity: 'artist', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'skill_level', type: 'enum' },
        { name: 'class_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'project', type: 'string' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'materials_included', type: 'boolean' },
        { name: 'take_home', type: 'boolean' },
        { name: 'age_requirement', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'artist' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_hours', type: 'decimal', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'group_size', type: 'integer' },
        { name: 'project_type', type: 'string' },
        { name: 'skill_level', type: 'enum' },
        { name: 'special_requests', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'artist' },
      ],
    },
    artwork: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'technique', type: 'string' },
        { name: 'colors', type: 'json' },
        { name: 'dimensions', type: 'string' },
        { name: 'weight', type: 'string' },
        { name: 'year_created', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'is_sold', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'images', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'artist' },
      ],
    },
    commission: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'commission_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'dimensions', type: 'string' },
        { name: 'colors', type: 'json' },
        { name: 'inspiration_images', type: 'json' },
        { name: 'quantity', type: 'integer' },
        { name: 'due_date', type: 'date' },
        { name: 'quoted_price', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'final_price', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'progress_photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'artist' },
      ],
    },
    artist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'specialties', type: 'json' },
        { name: 'techniques', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'portfolio_url', type: 'string' },
        { name: 'years_experience', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
        { type: 'hasMany', target: 'artwork' },
        { type: 'hasMany', target: 'commission' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'commission' },
      ],
    },
  },
};

export default glassblowingBlueprint;
