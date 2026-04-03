/**
 * Live Streaming App Type Definition
 *
 * Complete definition for live streaming platform operations.
 * Essential for streaming platforms, content creators, and live event producers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LIVE_STREAMING_APP_TYPE: AppTypeDefinition = {
  id: 'live-streaming',
  name: 'Live Streaming',
  category: 'entertainment',
  description: 'Live streaming platform with channel management, stream scheduling, monetization, and viewer engagement',
  icon: 'radio',

  keywords: [
    'live streaming',
    'streaming platform',
    'live streaming software',
    'content creator',
    'live events',
    'live streaming management',
    'channel management',
    'live streaming practice',
    'live streaming scheduling',
    'stream scheduling',
    'live streaming crm',
    'monetization',
    'live streaming business',
    'viewer engagement',
    'live streaming pos',
    'donations',
    'live streaming operations',
    'subscriptions',
    'live streaming platform',
    'chat moderation',
  ],

  synonyms: [
    'live streaming platform',
    'live streaming software',
    'streaming platform software',
    'content creator software',
    'live events software',
    'channel management software',
    'live streaming practice software',
    'stream scheduling software',
    'monetization software',
    'viewer engagement software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Viewer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Streams and channels' },
    { id: 'admin', name: 'Creator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Streams and earnings' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'creator', name: 'Content Creator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/streams' },
    { id: 'moderator', name: 'Moderator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/moderation' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a live streaming platform',
    'Create a content creator portal',
    'I need a streaming management system',
    'Build a monetization and engagement platform',
    'Create a live broadcast app',
  ],
};
