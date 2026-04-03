import { Blueprint } from './blueprint.interface';

/**
 * Podcast Blueprint
 */
export const podcastBlueprint: Blueprint = {
  appType: 'podcast',
  description: 'Podcast app with shows, episodes, subscriptions, and player',

  coreEntities: ['show', 'episode', 'category', 'subscription', 'listen_progress'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Discover', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Discover', path: '/', icon: 'Compass' },
        { label: 'Browse', path: '/browse', icon: 'Search' },
        { label: 'Library', path: '/library', icon: 'Library' },
        { label: 'Downloads', path: '/downloads', icon: 'Download' },
      ]}},
      { id: 'featured', component: 'featured-shows', entity: 'show', position: 'main' },
      { id: 'continue', component: 'continue-listening', entity: 'listen_progress', position: 'main' },
      { id: 'trending', component: 'trending-episodes', entity: 'episode', position: 'main' },
    ]},
    { path: '/shows/:id', name: 'Show', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'show-header', component: 'show-header', entity: 'show', position: 'main' },
      { id: 'episode-list', component: 'episode-list', entity: 'episode', position: 'main' },
    ]},
    { path: '/episodes/:id', name: 'Episode', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'episode-player', component: 'episode-player', entity: 'episode', position: 'main' },
      { id: 'episode-notes', component: 'episode-notes', entity: 'episode', position: 'main' },
    ]},
    { path: '/library', name: 'Library', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscribed', component: 'show-grid', entity: 'show', position: 'main', props: { title: 'Subscribed Shows' }},
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/shows', entity: 'show', operation: 'list' },
    { method: 'GET', path: '/shows/:id', entity: 'show', operation: 'get' },
    { method: 'GET', path: '/shows/:id/episodes', entity: 'episode', operation: 'list' },
    { method: 'GET', path: '/episodes/:id', entity: 'episode', operation: 'get' },
    { method: 'POST', path: '/shows/:id/subscribe', entity: 'subscription', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    show: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'cover_url', type: 'image' },
        { name: 'author', type: 'string' },
        { name: 'website', type: 'url' },
        { name: 'rss_feed', type: 'url' },
        { name: 'explicit', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'episode' }],
    },
    episode: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'audio_url', type: 'file', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'episode_number', type: 'integer' },
        { name: 'season_number', type: 'integer' },
        { name: 'published_at', type: 'datetime' },
      ],
      relationships: [{ type: 'belongsTo', target: 'show' }],
    },
  },
};

export default podcastBlueprint;
