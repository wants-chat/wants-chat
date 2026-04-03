import { Blueprint } from './blueprint.interface';

/**
 * Yoga Studio Blueprint
 */
export const yogaBlueprint: Blueprint = {
  appType: 'yoga',
  description: 'Yoga studio with classes, instructors, memberships, and workshop management',

  coreEntities: ['class', 'instructor', 'member', 'membership', 'booking', 'workshop'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Schedule', path: '/schedule', icon: 'Calendar' },
        { label: 'Classes', path: '/classes', icon: 'Users' },
        { label: 'Instructors', path: '/instructors', icon: 'User' },
        { label: 'Members', path: '/members', icon: 'Heart' },
        { label: 'Workshops', path: '/workshops', icon: 'Sparkles' },
      ]}},
      { id: 'yoga-stats', component: 'yoga-stats', position: 'main' },
      { id: 'today-classes', component: 'class-list-today-yoga', entity: 'class', position: 'main' },
      { id: 'recent-bookings', component: 'booking-list-recent-yoga', entity: 'booking', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'schedule-calendar', component: 'schedule-calendar-yoga', entity: 'class', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-grid', component: 'class-grid-yoga', entity: 'class', position: 'main' },
    ]},
    { path: '/classes/:id', name: 'Class Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-detail', component: 'class-detail-yoga', entity: 'class', position: 'main' },
      { id: 'class-attendees', component: 'class-attendees', entity: 'booking', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'instructor-grid-yoga', entity: 'instructor', position: 'main' },
    ]},
    { path: '/instructors/:id', name: 'Instructor Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-profile', component: 'instructor-profile-yoga', entity: 'instructor', position: 'main' },
      { id: 'instructor-schedule', component: 'instructor-schedule-yoga', entity: 'class', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'member-table-yoga', entity: 'member', position: 'main' },
    ]},
    { path: '/members/:id', name: 'Member Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-profile', component: 'member-profile-yoga', entity: 'member', position: 'main' },
      { id: 'member-bookings', component: 'member-bookings-yoga', entity: 'booking', position: 'main' },
    ]},
    { path: '/workshops', name: 'Workshops', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'workshop-grid', component: 'workshop-grid', entity: 'workshop', position: 'main' },
    ]},
    { path: '/book', name: 'Book Class', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-schedule', component: 'public-schedule-yoga', entity: 'class', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/workshops', entity: 'workshop', operation: 'list' },
  ],

  entityConfig: {
    class: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'max_capacity', type: 'integer', required: true },
        { name: 'current_bookings', type: 'integer' },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'room', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
        { type: 'hasMany', target: 'booking' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'bio', type: 'text' },
        { name: 'specialties', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'photo', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'class' }],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'health_notes', type: 'text' },
        { name: 'join_date', type: 'date' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'classes_remaining', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'auto_renew', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'member' }],
    },
    booking: {
      defaultFields: [
        { name: 'booking_date', type: 'datetime', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'checked_in', type: 'boolean' },
        { name: 'check_in_time', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'class' },
        { type: 'belongsTo', target: 'member' },
      ],
    },
    workshop: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'max_capacity', type: 'integer' },
        { name: 'registrations', type: 'integer' },
        { name: 'image', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'instructor' }],
    },
  },
};

export default yogaBlueprint;
