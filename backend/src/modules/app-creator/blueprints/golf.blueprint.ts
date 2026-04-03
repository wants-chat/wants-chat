import { Blueprint } from './blueprint.interface';

/**
 * Golf Course Blueprint
 */
export const golfBlueprint: Blueprint = {
  appType: 'golf',
  description: 'Golf course with tee times, memberships, pro shop, and tournament management',

  coreEntities: ['tee_time', 'member', 'tournament', 'proshop_item', 'lesson', 'course'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Tee Times', path: '/tee-times', icon: 'Calendar' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Tournaments', path: '/tournaments', icon: 'Trophy' },
        { label: 'Pro Shop', path: '/proshop', icon: 'ShoppingBag' },
        { label: 'Lessons', path: '/lessons', icon: 'GraduationCap' },
      ]}},
      { id: 'golf-stats', component: 'golf-stats', position: 'main' },
      { id: 'today-tee-times', component: 'tee-time-list-today', entity: 'tee_time', position: 'main' },
      { id: 'upcoming-tournaments', component: 'tournament-list-upcoming', entity: 'tournament', position: 'main' },
    ]},
    { path: '/tee-times', name: 'Tee Times', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tee-time-calendar', component: 'tee-time-calendar', entity: 'tee_time', position: 'main' },
    ]},
    { path: '/tee-times/:id', name: 'Tee Time Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tee-time-detail', component: 'tee-time-detail', entity: 'tee_time', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'member-table-golf', entity: 'member', position: 'main' },
    ]},
    { path: '/members/:id', name: 'Member Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-profile', component: 'member-profile-golf', entity: 'member', position: 'main' },
      { id: 'member-handicap', component: 'member-handicap', entity: 'member', position: 'main' },
    ]},
    { path: '/tournaments', name: 'Tournaments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tournament-grid', component: 'tournament-grid', entity: 'tournament', position: 'main' },
    ]},
    { path: '/tournaments/:id', name: 'Tournament Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tournament-detail', component: 'tournament-detail', entity: 'tournament', position: 'main' },
      { id: 'tournament-leaderboard', component: 'tournament-leaderboard', entity: 'tournament', position: 'main' },
    ]},
    { path: '/proshop', name: 'Pro Shop', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'proshop-grid', component: 'proshop-grid', entity: 'proshop_item', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'lesson-calendar-golf', entity: 'lesson', position: 'main' },
    ]},
    { path: '/book', name: 'Book Tee Time', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-booking', component: 'public-booking-golf', entity: 'tee_time', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tee-times', entity: 'tee_time', operation: 'list' },
    { method: 'POST', path: '/tee-times', entity: 'tee_time', operation: 'create' },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tournaments', entity: 'tournament', operation: 'list' },
    { method: 'GET', path: '/proshop', entity: 'proshop_item', operation: 'list' },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    tee_time: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'course', type: 'string' },
        { name: 'holes', type: 'enum', required: true },
        { name: 'players', type: 'json', required: true },
        { name: 'cart_required', type: 'boolean' },
        { name: 'total', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'member' }],
    },
    member: {
      defaultFields: [
        { name: 'member_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'join_date', type: 'date' },
        { name: 'handicap', type: 'decimal' },
        { name: 'ghin_number', type: 'string' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'tee_time' },
        { type: 'hasMany', target: 'lesson' },
      ],
    },
    tournament: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'format', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'max_players', type: 'integer' },
        { name: 'registration_deadline', type: 'date' },
        { name: 'prizes', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    proshop_item: {
      defaultFields: [
        { name: 'sku', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'description', type: 'text' },
        { name: 'image', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    lesson: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'instructor', type: 'string' },
        { name: 'price', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'member' }],
    },
  },
};

export default golfBlueprint;
