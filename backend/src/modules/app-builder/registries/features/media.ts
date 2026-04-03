/**
 * Media Feature Definition
 *
 * Media library for videos, audio, and streaming content
 * with playlists and media management.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const MEDIA_FEATURE: FeatureDefinition = {
  id: 'media',
  name: 'Media',
  category: 'content',
  description: 'Video and audio media library with playlists and streaming',
  icon: 'play-circle',

  includedInAppTypes: [
    'video-platform',
    'streaming',
    'podcast',
    'music',
    'e-learning',
    'course-platform',
    'fitness',
    'yoga',
    'meditation',
    'church',
    'conference',
    'webinar',
    'entertainment',
    'news-site',
  ],

  activationKeywords: [
    'media',
    'video',
    'audio',
    'streaming',
    'podcast',
    'music',
    'player',
    'playlist',
    'youtube',
    'vimeo',
    'spotify',
    'media library',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth', 'file-upload'],
  conflicts: [],

  pages: [
    {
      id: 'media-library',
      route: '/media',
      section: 'frontend',
      title: 'Media Library',
      authRequired: false,
      templateId: 'media-library',
      components: [
        'media-grid',
        'media-card',
        'category-tabs',
        'search-bar',
      ],
      layout: 'default',
    },
    {
      id: 'media-player',
      route: '/media/:id',
      section: 'frontend',
      title: 'Media Player',
      authRequired: false,
      templateId: 'media-player',
      components: [
        'video-player',
        'audio-player',
        'media-info',
        'related-media',
        'comments-section',
      ],
      layout: 'default',
    },
    {
      id: 'playlists',
      route: '/playlists',
      section: 'frontend',
      title: 'Playlists',
      authRequired: true,
      templateId: 'playlists',
      components: [
        'playlists-grid',
        'playlist-card',
        'create-playlist-button',
      ],
      layout: 'default',
    },
    {
      id: 'playlist-view',
      route: '/playlists/:id',
      section: 'frontend',
      title: 'Playlist',
      authRequired: false,
      templateId: 'playlist-view',
      components: [
        'playlist-header',
        'playlist-items',
        'playlist-player',
      ],
      layout: 'default',
    },
    {
      id: 'admin-media',
      route: '/admin/media',
      section: 'admin',
      title: 'Media Manager',
      authRequired: true,
      templateId: 'admin-media',
      components: [
        'media-upload',
        'media-table',
        'transcoding-status',
        'storage-stats',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Library
    'media-grid',
    'media-card',
    'media-list',
    'category-tabs',

    // Players
    'video-player',
    'audio-player',
    'media-controls',
    'progress-bar',
    'volume-control',

    // Info
    'media-info',
    'related-media',
    'comments-section',

    // Playlists
    'playlists-grid',
    'playlist-card',
    'playlist-header',
    'playlist-items',
    'playlist-player',
    'create-playlist-button',

    // Admin
    'media-upload',
    'media-table',
    'transcoding-status',
    'storage-stats',
    'thumbnail-generator',
  ],

  entities: [
    {
      name: 'media',
      displayName: 'Media',
      description: 'Video and audio files',
      isCore: true,
    },
    {
      name: 'playlists',
      displayName: 'Playlists',
      description: 'Media playlists',
      isCore: true,
    },
    {
      name: 'playlist_items',
      displayName: 'Playlist Items',
      description: 'Items in playlists',
      isCore: false,
    },
    {
      name: 'media_views',
      displayName: 'Views',
      description: 'View tracking',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/media',
      auth: false,
      handler: 'crud',
      entity: 'media',
      description: 'List media',
    },
    {
      method: 'GET',
      path: '/media/:id',
      auth: false,
      handler: 'crud',
      entity: 'media',
      description: 'Get media',
    },
    {
      method: 'POST',
      path: '/media',
      auth: true,
      handler: 'crud',
      entity: 'media',
      description: 'Upload media',
    },
    {
      method: 'PUT',
      path: '/media/:id',
      auth: true,
      handler: 'crud',
      entity: 'media',
      description: 'Update media',
    },
    {
      method: 'DELETE',
      path: '/media/:id',
      auth: true,
      handler: 'crud',
      entity: 'media',
      description: 'Delete media',
    },
    {
      method: 'GET',
      path: '/playlists',
      auth: false,
      handler: 'crud',
      entity: 'playlists',
      description: 'List playlists',
    },
    {
      method: 'POST',
      path: '/playlists',
      auth: true,
      handler: 'crud',
      entity: 'playlists',
      description: 'Create playlist',
    },
    {
      method: 'POST',
      path: '/playlists/:id/items',
      auth: true,
      handler: 'crud',
      entity: 'playlist_items',
      description: 'Add to playlist',
    },
    {
      method: 'POST',
      path: '/media/:id/view',
      auth: false,
      handler: 'custom',
      entity: 'media_views',
      description: 'Track view',
    },
    {
      method: 'GET',
      path: '/media/:id/stream',
      auth: false,
      handler: 'custom',
      entity: 'media',
      description: 'Stream media',
    },
  ],

  config: [
    {
      key: 'maxUploadSize',
      label: 'Max Upload Size (MB)',
      type: 'number',
      default: 500,
      description: 'Maximum media file size',
    },
    {
      key: 'enableTranscoding',
      label: 'Enable Transcoding',
      type: 'boolean',
      default: true,
      description: 'Auto-transcode for streaming',
    },
    {
      key: 'defaultQuality',
      label: 'Default Quality',
      type: 'string',
      default: '720p',
      description: 'Default video quality',
    },
    {
      key: 'enableDownload',
      label: 'Allow Downloads',
      type: 'boolean',
      default: false,
      description: 'Allow media downloads',
    },
  ],
};
