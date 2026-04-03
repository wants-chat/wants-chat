import { Blueprint } from './blueprint.interface';

/**
 * Music Streaming Blueprint
 */
export const musicBlueprint: Blueprint = {
  appType: 'music',
  description: 'Music streaming app with artists, albums, playlists, and player',

  coreEntities: ['artist', 'album', 'track', 'playlist', 'genre', 'listen_history'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Home', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Home', path: '/', icon: 'Home' },
        { label: 'Browse', path: '/browse', icon: 'Search' },
        { label: 'Library', path: '/library', icon: 'Library' },
        { label: 'Playlists', path: '/playlists', icon: 'ListMusic' },
      ]}},
      { id: 'featured', component: 'featured-albums', entity: 'album', position: 'main' },
      { id: 'recent', component: 'recently-played', entity: 'listen_history', position: 'main' },
    ]},
    { path: '/browse', name: 'Browse', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'genres', component: 'genre-grid', entity: 'genre', position: 'main' },
      { id: 'top-artists', component: 'artist-grid', entity: 'artist', position: 'main' },
    ]},
    { path: '/artists/:id', name: 'Artist', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artist-header', component: 'artist-header', entity: 'artist', position: 'main' },
      { id: 'artist-albums', component: 'album-grid', entity: 'album', position: 'main' },
    ]},
    { path: '/albums/:id', name: 'Album', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'album-detail', component: 'album-detail', entity: 'album', position: 'main' },
      { id: 'track-list', component: 'track-list', entity: 'track', position: 'main' },
    ]},
    { path: '/playlists', name: 'Playlists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'playlist-grid', component: 'playlist-grid', entity: 'playlist', position: 'main' },
    ]},
    { path: '/playlists/:id', name: 'Playlist', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'playlist-detail', component: 'playlist-detail', entity: 'playlist', position: 'main' },
      { id: 'playlist-tracks', component: 'track-list', entity: 'track', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/artists', entity: 'artist', operation: 'list' },
    { method: 'GET', path: '/artists/:id', entity: 'artist', operation: 'get' },
    { method: 'GET', path: '/albums', entity: 'album', operation: 'list' },
    { method: 'GET', path: '/albums/:id', entity: 'album', operation: 'get' },
    { method: 'GET', path: '/tracks', entity: 'track', operation: 'list' },
    { method: 'GET', path: '/playlists', entity: 'playlist', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/playlists', entity: 'playlist', operation: 'create', requiresAuth: true },
    { method: 'POST', path: '/playlists/:id/tracks', entity: 'playlist', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/genres', entity: 'genre', operation: 'list' },
  ],

  entityConfig: {
    artist: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'bio', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'monthly_listeners', type: 'integer' },
        { name: 'verified', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'album' }],
    },
    album: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'cover_url', type: 'image' },
        { name: 'release_date', type: 'date' },
        { name: 'type', type: 'enum' },
        { name: 'total_tracks', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'artist' },
        { type: 'hasMany', target: 'track' },
      ],
    },
    track: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'duration_ms', type: 'integer', required: true },
        { name: 'track_number', type: 'integer' },
        { name: 'audio_url', type: 'file' },
        { name: 'play_count', type: 'integer' },
        { name: 'explicit', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'album' },
        { type: 'belongsTo', target: 'artist' },
      ],
    },
    playlist: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'cover_url', type: 'image' },
        { name: 'is_public', type: 'boolean' },
        { name: 'track_ids', type: 'json' },
      ],
      relationships: [],
    },
  },
};

export default musicBlueprint;
