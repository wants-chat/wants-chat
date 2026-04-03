/**
 * Radio Station App Type Definition
 *
 * Complete definition for radio station and broadcast applications.
 * Essential for radio stations, internet radio, and audio broadcasting.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RADIO_STATION_APP_TYPE: AppTypeDefinition = {
  id: 'radio-station',
  name: 'Radio Station',
  category: 'media',
  description: 'Radio station platform with live streaming, show scheduling, playlist management, and listener engagement',
  icon: 'radio',

  keywords: [
    'radio station',
    'internet radio',
    'online radio',
    'radio streaming',
    'radio broadcast',
    'fm radio',
    'am radio',
    'radio show',
    'radio dj',
    'radio programming',
    'radio playlist',
    'live radio',
    'radio app',
    'radio network',
    'college radio',
    'community radio',
    'talk radio',
    'music radio',
    'podcast radio',
    'radio automation',
    'shoutcast',
  ],

  synonyms: [
    'radio station platform',
    'radio station software',
    'internet radio software',
    'radio streaming platform',
    'radio broadcast software',
    'online radio platform',
    'radio management software',
    'radio station app',
    'radio programming software',
    'radio automation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Listener Portal', enabled: true, basePath: '/', layout: 'public', description: 'Listen and interact' },
    { id: 'admin', name: 'Station Dashboard', enabled: true, basePath: '/admin', requiredRole: 'host', layout: 'admin', description: 'Shows and playlists' },
  ],

  roles: [
    { id: 'admin', name: 'Station Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'director', name: 'Program Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'host', name: 'Show Host/DJ', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/shows' },
    { id: 'producer', name: 'Producer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/content' },
    { id: 'listener', name: 'Listener', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'media',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'vibrant',

  examplePrompts: [
    'Build an internet radio station',
    'Create a radio streaming platform',
    'I need a radio station management system',
    'Build an online radio with live streaming',
    'Create a community radio app',
  ],
};
