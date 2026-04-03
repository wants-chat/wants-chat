/**
 * Senior Companion App Type Definition
 *
 * Complete definition for senior companion service operations.
 * Essential for companion care services, senior friendship programs, and non-medical elderly care.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_COMPANION_APP_TYPE: AppTypeDefinition = {
  id: 'senior-companion',
  name: 'Senior Companion',
  category: 'services',
  description: 'Senior companion platform with visit scheduling, companion matching, activity logging, and family updates',
  icon: 'users',

  keywords: [
    'senior companion',
    'companion care',
    'senior companion software',
    'elderly companionship',
    'senior friendship',
    'senior companion management',
    'visit scheduling',
    'senior companion practice',
    'senior companion scheduling',
    'companion matching',
    'senior companion crm',
    'activity logging',
    'senior companion business',
    'family updates',
    'senior companion pos',
    'socialization',
    'senior companion operations',
    'errands assistance',
    'senior companion platform',
    'loneliness prevention',
  ],

  synonyms: [
    'senior companion platform',
    'senior companion software',
    'companion care software',
    'elderly companionship software',
    'senior friendship software',
    'visit scheduling software',
    'senior companion practice software',
    'companion matching software',
    'activity logging software',
    'socialization software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Visits and updates' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Companions and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Service Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Care Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'companion', name: 'Companion', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visits' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'warm',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a senior companion platform',
    'Create a companion care app',
    'I need an elderly companionship system',
    'Build a senior friendship service app',
    'Create a senior companion portal',
  ],
};
