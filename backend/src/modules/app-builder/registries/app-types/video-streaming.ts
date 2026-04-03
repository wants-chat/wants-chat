/**
 * Video Streaming App Type Definition
 *
 * Complete definition for video streaming and VOD applications.
 * Essential for content creators, media companies, and streaming platforms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIDEO_STREAMING_APP_TYPE: AppTypeDefinition = {
  id: 'video-streaming',
  name: 'Video Streaming',
  category: 'media',
  description: 'Video streaming platform with VOD, channels, playlists, and viewer engagement',
  icon: 'video',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'video streaming',
    'video platform',
    'vod',
    'video on demand',
    'streaming',
    'youtube',
    'vimeo',
    'twitch',
    'netflix',
    'video hosting',
    'video player',
    'video content',
    'video app',
    'video site',
    'live streaming',
    'live video',
    'video channel',
    'video upload',
    'video sharing',
    'video library',
    'media streaming',
    'ott',
    'over the top',
    'video portal',
    'video hub',
    'webinar platform',
  ],

  synonyms: [
    'streaming platform',
    'video service',
    'media platform',
    'video creator platform',
    'video network',
    'streaming service',
    'video manager',
    'video cms',
    'media hub',
    'content platform',
  ],

  negativeKeywords: [
    'blog only',
    'portfolio',
    'ecommerce only',
    'audio only',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Video Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public video browsing and watching',
    },
    {
      id: 'admin',
      name: 'Creator Studio',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'creator',
      layout: 'admin',
      description: 'Video management and analytics',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'creator',
      name: 'Content Creator',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/videos',
    },
    {
      id: 'subscriber',
      name: 'Subscriber',
      level: 30,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/library',
    },
    {
      id: 'viewer',
      name: 'Viewer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'categories',
    'search',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'comments',
    'analytics',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'inventory',
    'table-reservations',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'media',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'red',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a video streaming platform',
    'Create a video hosting site like YouTube',
    'I need a VOD platform',
    'Build a video sharing app',
    'Create a streaming service with subscriptions',
    'I want to build a video content platform',
    'Make a video streaming app with live streaming',
  ],
};
