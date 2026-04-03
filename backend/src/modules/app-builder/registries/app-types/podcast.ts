/**
 * Podcast & Audio App Type Definition
 *
 * Complete definition for podcast and audio streaming applications.
 * Essential for podcasters, audio creators, and media companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PODCAST_APP_TYPE: AppTypeDefinition = {
  id: 'podcast',
  name: 'Podcast & Audio',
  category: 'media',
  description: 'Podcast platform with audio streaming, episodes, playlists, and listener engagement',
  icon: 'podcast',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'podcast',
    'podcasting',
    'podcast platform',
    'audio streaming',
    'audio platform',
    'podcast hosting',
    'spotify',
    'apple podcasts',
    'anchor',
    'transistor',
    'buzzsprout',
    'podbean',
    'simplecast',
    'audio content',
    'episodes',
    'podcast episodes',
    'audio player',
    'podcast player',
    'podcast app',
    'audio app',
    'radio',
    'internet radio',
    'audiobook',
    'audio book',
    'music streaming',
    'spoken word',
  ],

  synonyms: [
    'audio platform',
    'podcast hosting',
    'audio hosting',
    'podcast creator',
    'audio creator',
    'podcast site',
    'audio site',
    'podcast network',
    'audio network',
    'podcast manager',
  ],

  negativeKeywords: [
    'blog only',
    'portfolio',
    'ecommerce',
    'video only',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Podcast Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public podcast browsing and listening',
    },
    {
      id: 'admin',
      name: 'Creator Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'creator',
      layout: 'admin',
      description: 'Podcast management and analytics',
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
      name: 'Podcast Creator',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/episodes',
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
      id: 'listener',
      name: 'Listener',
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
    'search',
    'categories',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'comments',
    'reviews',
    'analytics',
    'announcements',
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
  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a podcast platform',
    'Create a podcast hosting app',
    'I need a podcast streaming platform',
    'Build a podcast app like Spotify',
    'Create an audio content platform',
    'I want to build a podcast player app',
    'Make a podcast hosting site with analytics',
  ],
};
