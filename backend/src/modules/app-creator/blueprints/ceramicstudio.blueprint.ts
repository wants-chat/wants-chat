import { Blueprint } from './blueprint.interface';

/**
 * Ceramic Studio Blueprint
 */
export const ceramicstudioBlueprint: Blueprint = {
  appType: 'ceramicstudio',
  description: 'Ceramic studio app with classes, wheel time, kiln firings, and products',

  coreEntities: ['class', 'booking', 'member', 'firing', 'product', 'instructor'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Classes', path: '/classes', icon: 'GraduationCap' },
        { label: 'Studio Time', path: '/bookings', icon: 'Calendar' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Kiln Firings', path: '/firings', icon: 'Flame' },
        { label: 'Shop', path: '/products', icon: 'ShoppingBag' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-classes', component: 'appointment-list', entity: 'class', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
    ]},
    { path: '/bookings', name: 'Studio Time', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/firings', name: 'Kiln Firings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'firing-table', component: 'data-table', entity: 'firing', position: 'main' },
    ]},
    { path: '/products', name: 'Shop', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/schedule', name: 'Class Schedule', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'class-grid', component: 'product-grid', entity: 'class', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'POST', path: '/classes', entity: 'class', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create' },
    { method: 'GET', path: '/firings', entity: 'firing', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/firings', entity: 'firing', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
  ],

  entityConfig: {
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'skill_level', type: 'enum' },
        { name: 'class_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'materials_fee', type: 'decimal' },
        { name: 'clay_included', type: 'boolean' },
        { name: 'tools_provided', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'booking_type', type: 'enum', required: true },
        { name: 'wheel_number', type: 'string' },
        { name: 'price', type: 'decimal' },
        { name: 'clay_purchased', type: 'json' },
        { name: 'firing_needed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'membership_type', type: 'enum' },
        { name: 'membership_start', type: 'date' },
        { name: 'membership_end', type: 'date' },
        { name: 'skill_level', type: 'enum' },
        { name: 'studio_hours_used', type: 'decimal' },
        { name: 'clay_balance', type: 'decimal' },
        { name: 'locker_number', type: 'string' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'firing' },
      ],
    },
    firing: {
      defaultFields: [
        { name: 'firing_date', type: 'date', required: true },
        { name: 'firing_type', type: 'enum', required: true },
        { name: 'kiln_number', type: 'string' },
        { name: 'cone', type: 'string' },
        { name: 'pieces', type: 'json' },
        { name: 'piece_count', type: 'integer' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'ready_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'artist', type: 'string' },
        { name: 'dimensions', type: 'string' },
        { name: 'clay_type', type: 'string' },
        { name: 'glaze', type: 'string' },
        { name: 'firing_type', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'specialties', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
      ],
    },
  },
};

export default ceramicstudioBlueprint;
