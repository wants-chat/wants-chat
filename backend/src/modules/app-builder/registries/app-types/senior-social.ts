/**
 * Senior Social App Type Definition
 *
 * Complete definition for senior centers and social activity programs.
 * Essential for senior centers, community centers, and active aging programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_SOCIAL_APP_TYPE: AppTypeDefinition = {
  id: 'senior-social',
  name: 'Senior Social',
  category: 'seniors',
  description: 'Senior social platform with activity registration, event calendar, group management, and community features',
  icon: 'users',

  keywords: [
    'senior center',
    'senior social',
    'senior center software',
    'senior activities',
    'active aging',
    'senior center management',
    'community center',
    'senior programs',
    'senior center scheduling',
    'senior events',
    'senior center crm',
    'senior clubs',
    'senior center business',
    'senior outings',
    'senior center pos',
    'social seniors',
    'senior center operations',
    'senior groups',
    'senior center services',
    'senior engagement',
  ],

  synonyms: [
    'senior center platform',
    'senior center software',
    'senior social software',
    'senior activities software',
    'active aging software',
    'community center software',
    'senior programs software',
    'senior events software',
    'senior clubs software',
    'senior engagement software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness hardcore', 'dating'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Activities and events' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Programs and members' },
  ],

  roles: [
    { id: 'admin', name: 'Executive Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'staff', name: 'Activity Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/activities' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'documents',
    'gallery',
    'email',
    'check-in',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'seniors',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a senior center platform',
    'Create a senior activities registration app',
    'I need a senior social engagement system',
    'Build a community center program platform',
    'Create an active aging events app',
  ],
};
