/**
 * Music Label App Type Definition
 *
 * Complete definition for music label and record label applications.
 * Essential for record labels, music distributors, and artist management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_LABEL_APP_TYPE: AppTypeDefinition = {
  id: 'music-label',
  name: 'Music Label',
  category: 'media',
  description: 'Music label platform with artist roster, release management, royalty tracking, and distribution',
  icon: 'music',

  keywords: [
    'music label',
    'record label',
    'music distribution',
    'artist roster',
    'music release',
    'royalty tracking',
    'music publishing',
    'indie label',
    'record company',
    'music catalog',
    'artist management',
    'album release',
    'single release',
    'music rights',
    'licensing',
    'music royalties',
    'distrokid',
    'tunecore',
    'cd baby',
    'label management',
    'a&r',
  ],

  synonyms: [
    'music label platform',
    'record label software',
    'music label software',
    'music distribution platform',
    'record label management',
    'music publishing software',
    'artist roster software',
    'royalty tracking software',
    'music catalog software',
    'label management platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Public Portal', enabled: true, basePath: '/', layout: 'public', description: 'Discover artists and music' },
    { id: 'admin', name: 'Label Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Artists and releases' },
  ],

  roles: [
    { id: 'admin', name: 'Label Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Label Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/artists' },
    { id: 'ar', name: 'A&R', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/submissions' },
    { id: 'artist', name: 'Artist', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/releases' },
    { id: 'fan', name: 'Fan', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'media',

  defaultColorScheme: 'zinc',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a music label platform',
    'Create a record label management app',
    'I need a music distribution system',
    'Build an indie label with royalty tracking',
    'Create a music publishing platform',
  ],
};
