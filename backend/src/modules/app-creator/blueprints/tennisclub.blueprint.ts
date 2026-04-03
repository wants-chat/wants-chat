import { Blueprint } from './blueprint.interface';

/**
 * Tennis Club / Racquet Club Blueprint
 */
export const tennisclubBlueprint: Blueprint = {
  appType: 'tennisclub',
  description: 'Tennis club app with court reservations, memberships, lessons, and tournaments',

  coreEntities: ['court', 'reservation', 'member', 'lesson', 'coach', 'tournament'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Courts', path: '/courts', icon: 'LayoutGrid' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Lessons', path: '/lessons', icon: 'GraduationCap' },
        { label: 'Coaches', path: '/coaches', icon: 'UserCheck' },
        { label: 'Tournaments', path: '/tournaments', icon: 'Trophy' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'court-status', component: 'data-table', entity: 'court', position: 'main' },
    ]},
    { path: '/reservations', name: 'Court Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/courts', name: 'Courts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'court-grid', component: 'data-table', entity: 'court', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'appointment-calendar', entity: 'lesson', position: 'main' },
      { id: 'lesson-table', component: 'data-table', entity: 'lesson', position: 'main' },
    ]},
    { path: '/coaches', name: 'Coaches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'coach-grid', component: 'staff-grid', entity: 'coach', position: 'main' },
    ]},
    { path: '/tournaments', name: 'Tournaments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tournament-table', component: 'data-table', entity: 'tournament', position: 'main' },
    ]},
    { path: '/book', name: 'Book Court', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/courts', entity: 'court', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/lessons', entity: 'lesson', operation: 'create' },
    { method: 'GET', path: '/coaches', entity: 'coach', operation: 'list' },
    { method: 'GET', path: '/tournaments', entity: 'tournament', operation: 'list' },
  ],

  entityConfig: {
    court: {
      defaultFields: [
        { name: 'court_number', type: 'integer', required: true },
        { name: 'court_name', type: 'string' },
        { name: 'surface_type', type: 'enum', required: true },
        { name: 'is_indoor', type: 'boolean' },
        { name: 'has_lights', type: 'boolean' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'peak_rate', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'maintenance_notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'match_type', type: 'enum' },
        { name: 'players', type: 'json' },
        { name: 'equipment_rental', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'court' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'member_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'membership_start', type: 'date' },
        { name: 'membership_expiry', type: 'date' },
        { name: 'skill_level', type: 'enum' },
        { name: 'ntrp_rating', type: 'decimal' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'court_hours_used', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
        { type: 'hasMany', target: 'lesson' },
      ],
    },
    lesson: {
      defaultFields: [
        { name: 'lesson_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'lesson_type', type: 'enum', required: true },
        { name: 'skill_focus', type: 'json' },
        { name: 'num_students', type: 'integer' },
        { name: 'students', type: 'json' },
        { name: 'price', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'coach' },
        { type: 'belongsTo', target: 'court' },
      ],
    },
    coach: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'specializations', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'lesson' },
      ],
    },
    tournament: {
      defaultFields: [
        { name: 'tournament_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'format', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'skill_level', type: 'enum' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'max_participants', type: 'integer' },
        { name: 'registered_players', type: 'json' },
        { name: 'bracket', type: 'json' },
        { name: 'prizes', type: 'json' },
        { name: 'rules', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
  },
};

export default tennisclubBlueprint;
