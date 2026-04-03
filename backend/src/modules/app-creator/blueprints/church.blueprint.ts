import { Blueprint } from './blueprint.interface';

/**
 * Church/Religious Organization Blueprint
 */
export const churchBlueprint: Blueprint = {
  appType: 'church',
  description: 'Church and religious organization app with members, events, donations, and groups',

  coreEntities: ['member', 'event', 'donation', 'group', 'sermon', 'volunteer', 'prayer_request'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Donations', path: '/donations', icon: 'Heart' },
        { label: 'Groups', path: '/groups', icon: 'UsersRound' },
        { label: 'Sermons', path: '/sermons', icon: 'BookOpen' },
      ]}},
      { id: 'church-stats', component: 'church-stats', position: 'main' },
      { id: 'upcoming-events', component: 'event-list', entity: 'event', position: 'main', props: { title: 'Upcoming Events' }},
      { id: 'recent-donations', component: 'donation-summary', entity: 'donation', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-filters', component: 'member-filters', entity: 'member', position: 'main' },
      { id: 'member-table', component: 'member-table', entity: 'member', position: 'main' },
    ]},
    { path: '/members/:id', name: 'Member Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-profile', component: 'member-profile', entity: 'member', position: 'main' },
      { id: 'member-groups', component: 'member-groups', entity: 'group', position: 'main' },
      { id: 'member-donations', component: 'member-donations', entity: 'donation', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'event-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/events/:id', name: 'Event Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-detail', component: 'event-detail', entity: 'event', position: 'main' },
      { id: 'event-registrations', component: 'event-registrations', entity: 'event', position: 'main' },
    ]},
    { path: '/donations', name: 'Donations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donation-stats', component: 'donation-stats', position: 'main' },
      { id: 'donation-table', component: 'donation-table', entity: 'donation', position: 'main' },
    ]},
    { path: '/give', name: 'Give', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'donation-form', component: 'donation-form', entity: 'donation', position: 'main' },
    ]},
    { path: '/groups', name: 'Groups', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'group-grid', component: 'group-grid', entity: 'group', position: 'main' },
    ]},
    { path: '/groups/:id', name: 'Group Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'group-detail', component: 'group-detail', entity: 'group', position: 'main' },
      { id: 'group-members', component: 'group-members', entity: 'member', position: 'main' },
    ]},
    { path: '/sermons', name: 'Sermons', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sermon-list', component: 'sermon-list', entity: 'sermon', position: 'main' },
    ]},
    { path: '/sermons/:id', name: 'Sermon', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'sermon-player', component: 'sermon-player', entity: 'sermon', position: 'main' },
      { id: 'sermon-notes', component: 'sermon-notes', entity: 'sermon', position: 'main' },
    ]},
    { path: '/prayer-requests', name: 'Prayer Requests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'prayer-list', component: 'prayer-list', entity: 'prayer_request', position: 'main' },
      { id: 'prayer-form', component: 'prayer-form', entity: 'prayer_request', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/members/:id', entity: 'member', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/events/:id', entity: 'event', operation: 'get' },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/donations', entity: 'donation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/donations', entity: 'donation', operation: 'create' },
    { method: 'GET', path: '/groups', entity: 'group', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sermons', entity: 'sermon', operation: 'list' },
    { method: 'GET', path: '/sermons/:id', entity: 'sermon', operation: 'get' },
    { method: 'POST', path: '/prayer-requests', entity: 'prayer_request', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'membership_date', type: 'date' },
        { name: 'status', type: 'enum' },
        { name: 'photo_url', type: 'image' },
        { name: 'family_id', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'donation' },
        { type: 'hasMany', target: 'group' },
      ],
    },
    donation: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'fund', type: 'string' },
        { name: 'payment_method', type: 'enum' },
        { name: 'transaction_id', type: 'string' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_anonymous', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'member' }],
    },
    sermon: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'speaker', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'description', type: 'text' },
        { name: 'video_url', type: 'url' },
        { name: 'audio_url', type: 'url' },
        { name: 'scripture_reference', type: 'string' },
        { name: 'series', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'thumbnail_url', type: 'image' },
      ],
      relationships: [],
    },
    group: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'type', type: 'enum' },
        { name: 'meeting_day', type: 'string' },
        { name: 'meeting_time', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'leader_id', type: 'string' },
        { name: 'max_members', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'member' }],
    },
  },
};

export default churchBlueprint;
