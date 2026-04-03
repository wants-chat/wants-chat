/**
 * Streaming Service App Type Definition
 *
 * Complete definition for video streaming and OTT platform applications.
 * Essential for streaming services, VOD platforms, and video-on-demand businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STREAMING_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'streaming-service',
  name: 'Streaming Service',
  category: 'media',
  description: 'Video streaming platform with content library, subscriptions, user profiles, and playback analytics',
  icon: 'play-circle',

  keywords: [
    'streaming service',
    'video streaming',
    'ott platform',
    'video on demand',
    'vod',
    'netflix clone',
    'streaming platform',
    'video library',
    'content streaming',
    'subscription video',
    'svod',
    'avod',
    'streaming app',
    'video content',
    'media streaming',
    'watch online',
    'binge watch',
    'streaming subscription',
    'video player',
    'content delivery',
    'media platform',
  ],

  synonyms: [
    'streaming service platform',
    'video streaming software',
    'ott platform software',
    'vod platform',
    'streaming platform software',
    'video on demand platform',
    'streaming app builder',
    'video streaming service',
    'content streaming platform',
    'media streaming software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Viewer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and watch content' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'content', layout: 'admin', description: 'Content and subscribers' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'content', name: 'Content Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/library' },
    { id: 'editor', name: 'Video Editor', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/uploads' },
    { id: 'moderator', name: 'Moderator', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/reviews' },
    { id: 'subscriber', name: 'Subscriber', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/' },
    { id: 'viewer', name: 'Free Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'media',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'dark',

  examplePrompts: [
    'Build a video streaming platform',
    'Create a Netflix-style streaming service',
    'I need an OTT platform',
    'Build a VOD subscription service',
    'Create a video streaming app',
  ],
};
