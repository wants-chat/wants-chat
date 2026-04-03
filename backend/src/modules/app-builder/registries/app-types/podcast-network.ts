/**
 * Podcast Network App Type Definition
 *
 * Complete definition for podcast network and audio content platform applications.
 * Essential for podcast networks, audio creators, and podcast hosting services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PODCAST_NETWORK_APP_TYPE: AppTypeDefinition = {
  id: 'podcast-network',
  name: 'Podcast Network',
  category: 'media',
  description: 'Podcast network platform with show management, episode hosting, analytics, and monetization',
  icon: 'mic',

  keywords: [
    'podcast network',
    'podcast hosting',
    'podcast platform',
    'audio content',
    'podcast management',
    'podcast analytics',
    'podcast monetization',
    'podcast distribution',
    'podcast creator',
    'podcast studio',
    'audio streaming',
    'podcast episodes',
    'podcast shows',
    'podcast advertising',
    'podcast sponsorship',
    'rss feed',
    'podcast directory',
    'anchor',
    'spotify podcasters',
    'podcast app',
    'audio network',
  ],

  synonyms: [
    'podcast network platform',
    'podcast hosting software',
    'podcast management software',
    'audio content platform',
    'podcast network app',
    'podcast creator platform',
    'podcast hosting service',
    'podcast distribution platform',
    'audio streaming platform',
    'podcast studio software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Listener Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and listen' },
    { id: 'admin', name: 'Creator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'creator', layout: 'admin', description: 'Shows and analytics' },
  ],

  roles: [
    { id: 'admin', name: 'Network Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Network Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/shows' },
    { id: 'creator', name: 'Podcast Creator', level: 60, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/episodes' },
    { id: 'editor', name: 'Audio Editor', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'listener', name: 'Listener', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'analytics',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'clients',
    'scheduling',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'media',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a podcast network platform',
    'Create a podcast hosting service',
    'I need a podcast management system',
    'Build a podcast network with monetization',
    'Create an audio content platform',
  ],
};
