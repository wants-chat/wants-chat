import { Blueprint } from './blueprint.interface';

/**
 * Buddhist Temple Blueprint
 */
export const buddhisttempleBlueprint: Blueprint = {
  appType: 'buddhisttemple',
  description: 'Buddhist temple app with meditation, teachings, retreats, and community',

  coreEntities: ['session', 'teaching', 'retreat', 'member', 'event', 'donation'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Meditation', path: '/sessions', icon: 'Clock' },
        { label: 'Teachings', path: '/teachings', icon: 'BookOpen' },
        { label: 'Retreats', path: '/retreats', icon: 'Mountain' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Dana', path: '/donations', icon: 'Heart' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/sessions', name: 'Meditation', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/teachings', name: 'Teachings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'teaching-grid', component: 'product-grid', entity: 'teaching', position: 'main' },
    ]},
    { path: '/retreats', name: 'Retreats', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'retreat-grid', component: 'product-grid', entity: 'retreat', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/donations', name: 'Dana', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donation-table', component: 'data-table', entity: 'donation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list' },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/teachings', entity: 'teaching', operation: 'list' },
    { method: 'GET', path: '/retreats', entity: 'retreat', operation: 'list' },
    { method: 'POST', path: '/retreats', entity: 'retreat', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/donations', entity: 'donation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/donations', entity: 'donation', operation: 'create' },
  ],

  entityConfig: {
    session: {
      defaultFields: [
        { name: 'session_name', type: 'string', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'teacher', type: 'string' },
        { name: 'meditation_style', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'location', type: 'string' },
        { name: 'is_online', type: 'boolean' },
        { name: 'online_link', type: 'string' },
        { name: 'max_participants', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    teaching: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'teaching_type', type: 'enum', required: true },
        { name: 'teacher', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'tradition', type: 'enum' },
        { name: 'topic', type: 'string' },
        { name: 'sutras_referenced', type: 'json' },
        { name: 'audio_url', type: 'string' },
        { name: 'video_url', type: 'string' },
        { name: 'transcript', type: 'text' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'teaching_date', type: 'date' },
        { name: 'is_published', type: 'boolean' },
      ],
      relationships: [],
    },
    retreat: {
      defaultFields: [
        { name: 'retreat_name', type: 'string', required: true },
        { name: 'retreat_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'teacher', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'schedule', type: 'json' },
        { name: 'tradition', type: 'enum' },
        { name: 'location', type: 'string' },
        { name: 'accommodation_type', type: 'enum' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'suggested_donation', type: 'decimal' },
        { name: 'meals_included', type: 'boolean' },
        { name: 'requirements', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'dharma_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'membership_type', type: 'enum' },
        { name: 'membership_date', type: 'date' },
        { name: 'practice_history', type: 'text' },
        { name: 'tradition', type: 'enum' },
        { name: 'teacher_relationship', type: 'string' },
        { name: 'retreats_attended', type: 'json' },
        { name: 'volunteer_interests', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'donation' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'location', type: 'string' },
        { name: 'teacher', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'registration_required', type: 'boolean' },
        { name: 'suggested_donation', type: 'decimal' },
        { name: 'is_vegetarian', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    donation: {
      defaultFields: [
        { name: 'donation_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'donation_type', type: 'enum', required: true },
        { name: 'purpose', type: 'enum' },
        { name: 'payment_method', type: 'enum' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'recurring_frequency', type: 'enum' },
        { name: 'in_honor_of', type: 'string' },
        { name: 'dedication', type: 'text' },
        { name: 'anonymous', type: 'boolean' },
        { name: 'acknowledgment_sent', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
  },
};

export default buddhisttempleBlueprint;
