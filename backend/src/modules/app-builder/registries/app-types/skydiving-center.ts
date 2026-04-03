/**
 * Skydiving Center App Type Definition
 *
 * Complete definition for skydiving and parachute operations.
 * Essential for skydiving centers, tandem jump facilities, and parachute training.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKYDIVING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'skydiving-center',
  name: 'Skydiving Center',
  category: 'sports',
  description: 'Skydiving center platform with jump booking, manifest management, instructor pairing, and weather monitoring',
  icon: 'plane',

  keywords: [
    'skydiving center',
    'parachute training',
    'skydiving center software',
    'tandem jump',
    'aff training',
    'skydiving center management',
    'jump booking',
    'skydiving center practice',
    'skydiving center scheduling',
    'manifest management',
    'skydiving center crm',
    'instructor pairing',
    'skydiving center business',
    'weather monitoring',
    'skydiving center pos',
    'static line',
    'skydiving center operations',
    'freefall',
    'skydiving center platform',
    'uspa certified',
  ],

  synonyms: [
    'skydiving center platform',
    'skydiving center software',
    'parachute training software',
    'tandem jump software',
    'aff training software',
    'jump booking software',
    'skydiving center practice software',
    'manifest management software',
    'instructor pairing software',
    'static line software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Jumper Portal', enabled: true, basePath: '/', layout: 'public', description: 'Jumps and training' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Manifest and weather' },
  ],

  roles: [
    { id: 'admin', name: 'Center Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Tandem Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/manifest' },
    { id: 'staff', name: 'Manifest Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/loads' },
    { id: 'jumper', name: 'Jumper', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'adventure',

  examplePrompts: [
    'Build a skydiving center platform',
    'Create a tandem jump portal',
    'I need a parachute training system',
    'Build a manifest management platform',
    'Create a skydiving booking app',
  ],
};
