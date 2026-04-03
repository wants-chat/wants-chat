import { Blueprint } from './blueprint.interface';

/**
 * CrossFit/Gym Box Blueprint
 */
export const crossfitBlueprint: Blueprint = {
  appType: 'crossfit',
  description: 'CrossFit box/gym with WODs, athletes, competitions, and performance tracking',

  coreEntities: ['wod', 'athlete', 'result', 'membership', 'competition', 'coach'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'WODs', path: '/wods', icon: 'Dumbbell' },
        { label: 'Athletes', path: '/athletes', icon: 'Users' },
        { label: 'Leaderboard', path: '/leaderboard', icon: 'Trophy' },
        { label: 'Competitions', path: '/competitions', icon: 'Medal' },
        { label: 'Coaches', path: '/coaches', icon: 'UserCheck' },
      ]}},
      { id: 'crossfit-stats', component: 'crossfit-stats', position: 'main' },
      { id: 'today-wod', component: 'wod-today', entity: 'wod', position: 'main' },
      { id: 'recent-results', component: 'result-list-recent', entity: 'result', position: 'main' },
    ]},
    { path: '/wods', name: 'WODs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wod-calendar', component: 'wod-calendar', entity: 'wod', position: 'main' },
    ]},
    { path: '/wods/:id', name: 'WOD Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wod-detail', component: 'wod-detail', entity: 'wod', position: 'main' },
      { id: 'wod-results', component: 'wod-results', entity: 'result', position: 'main' },
    ]},
    { path: '/wods/new', name: 'Create WOD', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wod-form', component: 'wod-form', entity: 'wod', position: 'main' },
    ]},
    { path: '/athletes', name: 'Athletes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'athlete-table', component: 'athlete-table', entity: 'athlete', position: 'main' },
    ]},
    { path: '/athletes/:id', name: 'Athlete Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'athlete-profile', component: 'athlete-profile', entity: 'athlete', position: 'main' },
      { id: 'athlete-prs', component: 'athlete-prs', entity: 'result', position: 'main' },
      { id: 'athlete-history', component: 'athlete-history', entity: 'result', position: 'main' },
    ]},
    { path: '/leaderboard', name: 'Leaderboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'leaderboard', component: 'leaderboard-crossfit', entity: 'result', position: 'main' },
    ]},
    { path: '/competitions', name: 'Competitions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'competition-grid', component: 'competition-grid', entity: 'competition', position: 'main' },
    ]},
    { path: '/competitions/:id', name: 'Competition Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'competition-detail', component: 'competition-detail', entity: 'competition', position: 'main' },
      { id: 'competition-results', component: 'competition-results', entity: 'result', position: 'main' },
    ]},
    { path: '/coaches', name: 'Coaches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'coach-grid', component: 'coach-grid', entity: 'coach', position: 'main' },
    ]},
    { path: '/wod-today', name: 'Today WOD', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-wod', component: 'public-wod-today', entity: 'wod', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/wods', entity: 'wod', operation: 'list' },
    { method: 'POST', path: '/wods', entity: 'wod', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/athletes', entity: 'athlete', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/results', entity: 'result', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/results', entity: 'result', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/competitions', entity: 'competition', operation: 'list' },
    { method: 'GET', path: '/coaches', entity: 'coach', operation: 'list' },
  ],

  entityConfig: {
    wod: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'movements', type: 'json' },
        { name: 'time_cap', type: 'integer' },
        { name: 'rounds', type: 'integer' },
        { name: 'scoring', type: 'enum' },
        { name: 'rx_weight', type: 'json' },
        { name: 'scaled_weight', type: 'json' },
      ],
      relationships: [{ type: 'hasMany', target: 'result' }],
    },
    athlete: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'gender', type: 'enum' },
        { name: 'join_date', type: 'date' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'photo', type: 'image' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'result' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    result: {
      defaultFields: [
        { name: 'score', type: 'string', required: true },
        { name: 'score_type', type: 'enum', required: true },
        { name: 'rx', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'date', type: 'date', required: true },
        { name: 'is_pr', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'wod' },
        { type: 'belongsTo', target: 'athlete' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'price', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'auto_renew', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'athlete' }],
    },
    competition: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'location', type: 'string' },
        { name: 'type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'events', type: 'json' },
        { name: 'registration_deadline', type: 'date' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'max_participants', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'hasMany', target: 'result' }],
    },
    coach: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'bio', type: 'text' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'photo', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default crossfitBlueprint;
