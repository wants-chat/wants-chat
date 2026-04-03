import { Blueprint } from './blueprint.interface';

/**
 * Dating Blueprint
 */
export const datingBlueprint: Blueprint = {
  appType: 'dating',
  description: 'Dating app with profiles, matches, messages, and discovery',

  coreEntities: ['profile', 'match', 'message', 'like', 'preference'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Discover', layout: 'single-column', requiresAuth: true, sections: [
      { id: 'discover-cards', component: 'swipe-cards', entity: 'profile', position: 'main' },
    ]},
    { path: '/matches', name: 'Matches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Discover', path: '/', icon: 'Compass' },
        { label: 'Matches', path: '/matches', icon: 'Heart' },
        { label: 'Messages', path: '/messages', icon: 'MessageCircle' },
        { label: 'Profile', path: '/profile', icon: 'User' },
      ]}},
      { id: 'matches-grid', component: 'match-grid', entity: 'match', position: 'main' },
    ]},
    { path: '/messages', name: 'Messages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'conversation-list', component: 'conversation-list', entity: 'message', position: 'main' },
    ]},
    { path: '/messages/:id', name: 'Chat', layout: 'single-column', requiresAuth: true, sections: [
      { id: 'chat-window', component: 'chat-window', entity: 'message', position: 'main' },
    ]},
    { path: '/profile', name: 'My Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'profile-edit', component: 'dating-profile-edit', entity: 'profile', position: 'main' },
    ]},
    { path: '/profiles/:id', name: 'View Profile', layout: 'single-column', requiresAuth: true, sections: [
      { id: 'profile-view', component: 'dating-profile-view', entity: 'profile', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/discover', entity: 'profile', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/profiles/:id', entity: 'profile', operation: 'get', requiresAuth: true },
    { method: 'PUT', path: '/profile', entity: 'profile', operation: 'update', requiresAuth: true },
    { method: 'POST', path: '/likes', entity: 'like', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/matches', entity: 'match', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/messages/:matchId', entity: 'message', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/messages/:matchId', entity: 'message', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    profile: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'age', type: 'integer', required: true },
        { name: 'bio', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'location', type: 'json' },
        { name: 'interests', type: 'json' },
        { name: 'looking_for', type: 'enum' },
        { name: 'gender', type: 'enum' },
        { name: 'height', type: 'integer' },
        { name: 'occupation', type: 'string' },
      ],
      relationships: [
        { type: 'hasMany', target: 'like' },
        { type: 'hasMany', target: 'match' },
      ],
    },
    match: {
      defaultFields: [
        { name: 'matched_at', type: 'datetime', required: true },
        { name: 'last_message_at', type: 'datetime' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'message' }],
    },
  },
};

export default datingBlueprint;
