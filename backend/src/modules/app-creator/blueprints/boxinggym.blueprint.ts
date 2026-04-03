import { Blueprint } from './blueprint.interface';

/**
 * Boxing Gym / MMA Gym Blueprint
 */
export const boxinggymBlueprint: Blueprint = {
  appType: 'boxinggym',
  description: 'Boxing/MMA gym app with memberships, classes, training sessions, and fighters',

  coreEntities: ['member', 'class_session', 'training', 'fighter', 'coach', 'match'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Classes', path: '/classes', icon: 'Calendar' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Training', path: '/training', icon: 'Dumbbell' },
        { label: 'Fighters', path: '/fighters', icon: 'Shield' },
        { label: 'Coaches', path: '/coaches', icon: 'UserCheck' },
        { label: 'Fights', path: '/fights', icon: 'Swords' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-classes', component: 'appointment-list', entity: 'class_session', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class_session', position: 'main' },
      { id: 'class-table', component: 'data-table', entity: 'class_session', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/training', name: 'Training Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'training-calendar', component: 'appointment-calendar', entity: 'training', position: 'main' },
      { id: 'training-table', component: 'data-table', entity: 'training', position: 'main' },
    ]},
    { path: '/fighters', name: 'Fighters', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'fighter-grid', component: 'staff-grid', entity: 'fighter', position: 'main' },
    ]},
    { path: '/fighters/:id', name: 'Fighter Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'fighter-profile', component: 'trainer-profile', entity: 'fighter', position: 'main' },
      { id: 'fight-history', component: 'data-list', entity: 'match', position: 'main' },
    ]},
    { path: '/coaches', name: 'Coaches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'coach-grid', component: 'staff-grid', entity: 'coach', position: 'main' },
    ]},
    { path: '/fights', name: 'Fight Card', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'fight-table', component: 'data-table', entity: 'match', position: 'main' },
    ]},
    { path: '/join', name: 'Join Gym', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'signup-form', component: 'booking-wizard', entity: 'member', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/classes', entity: 'class_session', operation: 'list' },
    { method: 'POST', path: '/classes', entity: 'class_session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create' },
    { method: 'GET', path: '/training', entity: 'training', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/fighters', entity: 'fighter', operation: 'list' },
    { method: 'GET', path: '/coaches', entity: 'coach', operation: 'list' },
    { method: 'GET', path: '/fights', entity: 'match', operation: 'list' },
  ],

  entityConfig: {
    member: {
      defaultFields: [
        { name: 'member_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'membership_start', type: 'date' },
        { name: 'membership_expiry', type: 'date' },
        { name: 'training_goals', type: 'json' },
        { name: 'skill_level', type: 'enum' },
        { name: 'weight_class', type: 'enum' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'photo_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'training' },
      ],
    },
    class_session: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'class_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'max_capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'skill_level', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'coach' },
      ],
    },
    training: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'focus_areas', type: 'json' },
        { name: 'exercises', type: 'json' },
        { name: 'rounds', type: 'json' },
        { name: 'sparring_partner', type: 'string' },
        { name: 'intensity', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'coach' },
      ],
    },
    fighter: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'nickname', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'weight_class', type: 'enum', required: true },
        { name: 'stance', type: 'enum' },
        { name: 'record_wins', type: 'integer' },
        { name: 'record_losses', type: 'integer' },
        { name: 'record_draws', type: 'integer' },
        { name: 'record_kos', type: 'integer' },
        { name: 'ranking', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'coach' },
        { type: 'hasMany', target: 'match' },
      ],
    },
    coach: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specializations', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'fighting_background', type: 'text' },
        { name: 'experience_years', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class_session' },
        { type: 'hasMany', target: 'fighter' },
      ],
    },
    match: {
      defaultFields: [
        { name: 'event_name', type: 'string' },
        { name: 'fight_date', type: 'date', required: true },
        { name: 'weight_class', type: 'enum', required: true },
        { name: 'opponent_name', type: 'string', required: true },
        { name: 'opponent_record', type: 'string' },
        { name: 'rounds_scheduled', type: 'integer' },
        { name: 'result', type: 'enum' },
        { name: 'finish_type', type: 'enum' },
        { name: 'finish_round', type: 'integer' },
        { name: 'finish_time', type: 'string' },
        { name: 'venue', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'fighter' },
      ],
    },
  },
};

export default boxinggymBlueprint;
