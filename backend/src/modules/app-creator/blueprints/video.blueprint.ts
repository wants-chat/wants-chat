import { Blueprint } from './blueprint.interface';

/**
 * Video Streaming Blueprint
 */
export const videoBlueprint: Blueprint = {
  appType: 'video',
  description: 'Video streaming app with channels, videos, playlists, and subscriptions',

  coreEntities: ['channel', 'video', 'playlist', 'category', 'comment', 'subscription'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Home', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Home', path: '/', icon: 'Home' },
        { label: 'Trending', path: '/trending', icon: 'TrendingUp' },
        { label: 'Subscriptions', path: '/subscriptions', icon: 'Users' },
        { label: 'Library', path: '/library', icon: 'Library' },
      ]}},
      { id: 'video-feed', component: 'video-feed', entity: 'video', position: 'main' },
    ]},
    { path: '/watch/:id', name: 'Watch', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'video-player', component: 'video-player', entity: 'video', position: 'main' },
      { id: 'video-info', component: 'video-info', entity: 'video', position: 'main' },
      { id: 'comments', component: 'comment-section', entity: 'comment', position: 'main' },
      { id: 'related', component: 'related-videos', entity: 'video', position: 'main' },
    ]},
    { path: '/channel/:id', name: 'Channel', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'channel-header', component: 'channel-header', entity: 'channel', position: 'main' },
      { id: 'channel-videos', component: 'video-grid', entity: 'video', position: 'main' },
    ]},
    { path: '/trending', name: 'Trending', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trending-videos', component: 'video-grid', entity: 'video', position: 'main', props: { title: 'Trending' }},
    ]},
    { path: '/upload', name: 'Upload', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'upload-form', component: 'video-upload-form', entity: 'video', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/videos', entity: 'video', operation: 'list' },
    { method: 'GET', path: '/videos/:id', entity: 'video', operation: 'get' },
    { method: 'POST', path: '/videos', entity: 'video', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/channels', entity: 'channel', operation: 'list' },
    { method: 'GET', path: '/channels/:id', entity: 'channel', operation: 'get' },
    { method: 'POST', path: '/channels/:id/subscribe', entity: 'subscription', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/videos/:id/comments', entity: 'comment', operation: 'list' },
    { method: 'POST', path: '/videos/:id/comments', entity: 'comment', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    video: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'thumbnail_url', type: 'image' },
        { name: 'video_url', type: 'file', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'views', type: 'integer' },
        { name: 'likes', type: 'integer' },
        { name: 'visibility', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'channel' },
        { type: 'hasMany', target: 'comment' },
      ],
    },
    channel: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'banner_url', type: 'image' },
        { name: 'subscribers', type: 'integer' },
        { name: 'verified', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'video' }],
    },
  },
};

export default videoBlueprint;
