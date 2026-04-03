/**
 * Homeless Shelter App Type Definition
 *
 * Complete definition for homeless shelter operations.
 * Essential for shelters, transitional housing, and homeless services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOMELESS_SHELTER_APP_TYPE: AppTypeDefinition = {
  id: 'homeless-shelter',
  name: 'Homeless Shelter',
  category: 'community',
  description: 'Homeless shelter platform with bed management, client services, case management, and resource referrals',
  icon: 'home',

  keywords: [
    'homeless shelter',
    'transitional housing',
    'homeless shelter software',
    'homeless services',
    'emergency shelter',
    'homeless shelter management',
    'bed management',
    'homeless shelter practice',
    'homeless shelter scheduling',
    'client services',
    'homeless shelter crm',
    'case management',
    'homeless shelter business',
    'resource referrals',
    'homeless shelter pos',
    'intake assessment',
    'homeless shelter operations',
    'housing assistance',
    'homeless shelter platform',
    'wraparound services',
  ],

  synonyms: [
    'homeless shelter platform',
    'homeless shelter software',
    'transitional housing software',
    'homeless services software',
    'emergency shelter software',
    'bed management software',
    'homeless shelter practice software',
    'client services software',
    'case management software',
    'wraparound services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Services Portal', enabled: true, basePath: '/', layout: 'public', description: 'Resources and intake' },
    { id: 'admin', name: 'Shelter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and beds' },
  ],

  roles: [
    { id: 'admin', name: 'Shelter Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'caseworker', name: 'Case Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'staff', name: 'Shelter Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/beds' },
    { id: 'client', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'concert-tickets'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'nonprofit',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'accessible',

  examplePrompts: [
    'Build a homeless shelter management platform',
    'Create a transitional housing portal',
    'I need a shelter bed management system',
    'Build a case management platform',
    'Create a client services and referral app',
  ],
};
