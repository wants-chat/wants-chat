import { Blueprint } from './blueprint.interface';

/**
 * Crowdfunding Blueprint
 */
export const crowdfundingBlueprint: Blueprint = {
  appType: 'crowdfunding',
  description: 'Crowdfunding platform with campaigns, pledges, rewards, and updates',

  coreEntities: ['campaign', 'pledge', 'reward', 'update', 'comment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Discover', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Discover', path: '/', icon: 'Compass' },
        { label: 'Categories', path: '/categories', icon: 'Grid' },
        { label: 'My Pledges', path: '/pledges', icon: 'Heart' },
        { label: 'Start Campaign', path: '/create', icon: 'Plus' },
      ]}},
      { id: 'featured', component: 'featured-campaigns', entity: 'campaign', position: 'main' },
      { id: 'trending', component: 'campaign-grid', entity: 'campaign', position: 'main', props: { title: 'Trending' }},
    ]},
    { path: '/campaigns/:id', name: 'Campaign', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-header', component: 'campaign-header', entity: 'campaign', position: 'main' },
      { id: 'campaign-content', component: 'campaign-content', entity: 'campaign', position: 'main' },
      { id: 'rewards', component: 'reward-list', entity: 'reward', position: 'main' },
      { id: 'updates', component: 'update-list', entity: 'update', position: 'main' },
      { id: 'comments', component: 'comment-section', entity: 'comment', position: 'main' },
    ]},
    { path: '/campaigns/:id/pledge', name: 'Pledge', layout: 'single-column', requiresAuth: true, sections: [
      { id: 'pledge-form', component: 'pledge-form', entity: 'pledge', position: 'main' },
    ]},
    { path: '/pledges', name: 'My Pledges', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pledge-list', component: 'pledge-list', entity: 'pledge', position: 'main' },
    ]},
    { path: '/create', name: 'Start Campaign', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-wizard', component: 'campaign-wizard', entity: 'campaign', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/campaigns', entity: 'campaign', operation: 'list' },
    { method: 'GET', path: '/campaigns/:id', entity: 'campaign', operation: 'get' },
    { method: 'POST', path: '/campaigns', entity: 'campaign', operation: 'create', requiresAuth: true },
    { method: 'POST', path: '/campaigns/:id/pledges', entity: 'pledge', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/campaigns/:id/rewards', entity: 'reward', operation: 'list' },
    { method: 'GET', path: '/campaigns/:id/updates', entity: 'update', operation: 'list' },
    { method: 'GET', path: '/my-pledges', entity: 'pledge', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    campaign: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'tagline', type: 'string' },
        { name: 'description', type: 'text', required: true },
        { name: 'story', type: 'text' },
        { name: 'images', type: 'json' },
        { name: 'video_url', type: 'url' },
        { name: 'goal_amount', type: 'decimal', required: true },
        { name: 'raised_amount', type: 'decimal' },
        { name: 'backer_count', type: 'integer' },
        { name: 'end_date', type: 'datetime', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'category', type: 'string' },
      ],
      relationships: [
        { type: 'hasMany', target: 'pledge' },
        { type: 'hasMany', target: 'reward' },
        { type: 'hasMany', target: 'update' },
      ],
    },
    pledge: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'is_anonymous', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'campaign' },
        { type: 'belongsTo', target: 'reward' },
      ],
    },
    reward: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'minimum_pledge', type: 'decimal', required: true },
        { name: 'estimated_delivery', type: 'date' },
        { name: 'quantity_available', type: 'integer' },
        { name: 'claimed_count', type: 'integer' },
      ],
      relationships: [{ type: 'belongsTo', target: 'campaign' }],
    },
  },
};

export default crowdfundingBlueprint;
